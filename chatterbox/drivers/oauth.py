import requests
import json
from datetime import (datetime, timedelta)
import pytz
from oauthlib.oauth1.rfc5849 import SIGNATURE_HMAC, SIGNATURE_TYPE_AUTH_HEADER
from oauthlib.common import generate_token
from requests_oauthlib import OAuth1 as OAuth1Manager
from six.moves.urllib.parse import parse_qsl


class OAuthError(Exception):
    pass


class OAuthDenied(Exception):
    pass


class OAuth(object):
    verify = True
    signature_method = SIGNATURE_HMAC
    signature_type = SIGNATURE_TYPE_AUTH_HEADER

    def __init__(self, client_id, client_secret):
        self.client_id = client_id
        self.client_secret = client_secret
        self.request = None
        self.alias = self.__class__.__name__.lower()

    @property
    def session(self):
        try:
            return self.request.session
        except:
            return {}

    def get_request_token_url(self):
        return self.request_token_url

    def get_access_token_url(self):
        return self.access_token_url

    def get_authorize_url(self, redirect_url, scopes):

        params = self.get_authorize_params(
            redirect_url=redirect_url,
            scopes=scopes,
        )

        req = requests.Request(url=self.authorize_url, params=params)
        return req.prepare().url

    def callback(self, data, redirect_uri):
        """
        Receives the full callback from the service and returns a 2-tuple
        containing the user token and user secret (if applicable).
        """
        raise NotImplementedError("callback() must be defined in a subclass")


class OAuth1(OAuth):
    returns_token = True

    def parse_token(self, content):
        content = dict(parse_qsl(content))

        return {
            'access_token': content['oauth_token'],
            'secret': content['oauth_token_secret'],
        }

    def get_request_token_params(self, redirect_url, scopes):
        return {}

    def get_request_token_response(self, redirect_url, scopes):
        auth = OAuth1Manager(client_key=self.client_id,
                             client_secret=self.client_secret,
                             callback_uri=redirect_url,
                             signature_method=self.signature_method,
                             signature_type=self.signature_type)
        return requests.post(self.get_request_token_url(), auth=auth,
                             params=self.get_request_token_params(redirect_url, scopes),
                             verify=self.verify)

    def get_authorize_params(self, redirect_url, scopes):

        resp = self.get_request_token_response(redirect_url, scopes)
        try:
            data = self.parse_token(resp.content)
        except Exception:
            raise OAuthError('Unable to parse access token')

        self.session["%s_temp_secret" % self.alias] = data['secret']

        if not self.returns_token:
            redirect_url += ('?oauth_token=%s' % data['access_token'])
        return {
            'oauth_token': data['access_token'],
            'oauth_callback': redirect_url,
        }

    def get_access_token_response(self, token, secret, verifier=None):
        auth = OAuth1Manager(client_key=self.client_id,
                             client_secret=self.client_secret,
                             resource_owner_key=token,
                             resource_owner_secret=secret,
                             verifier=verifier,
                             signature_method=self.signature_method,
                             signature_type=self.signature_type)
        return requests.post(self.get_access_token_url(), auth=auth,
                             verify=self.verify)

    def callback(self, data, redirect_uri):
        token = data['oauth_token']
        verifier = data.get('oauth_verifier', None)
        secret = self.session.pop('%s_temp_secret' % self.alias, None)
        resp = self.get_access_token_response(token, secret, verifier)

        try:
            return self.parse_token(resp.content)
        except Exception:
            raise OAuthError('Unable to parse access token')

    def api(self, key, domain, path, method='GET', params=None, data=None,
            headers=None):
        protocol = self.https and 'https' or 'http'
        url = '%s://%s%s' % (protocol, domain, path)
        auth = OAuth1Manager(client_key=self.client_id,
                             client_secret=self.client_secret,
                             resource_owner_key=key.access_token,
                             resource_owner_secret=key.secret,
                             signature_method=self.signature_method,
                             signature_type=self.signature_type)
        return requests.request(method, url, auth=auth, params=params or {},
                                data=data or {}, headers=headers or {},
                                verify=self.verify, stream=True)


class OAuth2(OAuth):
    auth = None
    supports_state = True
    token_type = "Bearer"

    def parse_token(self, content):
        data = json.loads(content)
        expires_in = data.get('expires_in', None)

        if expires_in:
            now = datetime.now(pytz.utc)
            data["expires_at"] = now + timedelta(seconds=expires_in)

        return data

    def get_scope_string(self, scopes):
        out = " ".join(scopes)
        return out

    def get_authorize_params(self, redirect_url, scopes):

        state = generate_token()
        self.session['chatterbox_%s_state' % self.alias] = state

        if not self.supports_state:
            redirect_url += ('?state=%s' % state)

        params = {
            'client_id': self.client_id,
            'response_type': 'code',
            'redirect_uri': redirect_url,
            'state': state,
        }

        if any(scopes):
            params['scope'] = self.get_scope_string(scopes)

        return params

    def get_access_token_response(self, redirect_url, data):

        return requests.post(self.get_access_token_url(), {
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'grant_type': 'authorization_code',
            'code': data.get('code', None),
            'redirect_uri': redirect_url
        }, verify=self.verify, auth=self.auth)

    def callback(self, data, redirect_url):
        state = self.session.pop('chatterbox_%s_state' % self.alias, None)
        # state = flask.session['%s_state' % self.alias]

        if 'state' in data and state != data.get('state', None):
            # potential CSRF
            raise OAuthDenied("invalid state")

        if not self.supports_state:
            redirect_url += ('?state=%s' % state)

        resp = self.get_access_token_response(redirect_url, data)
        return self.parse_token(resp.content)
