import logging
import calendar
import pytz
from datetime import (datetime, timedelta)
from requests_oauthlib import OAuth2Session, OAuth1Session


log = logging.getLogger(__name__)


class SimpleProfile(object):
    """SimpleProfile is an object whose purpose is to normalize the
    various possible responses from N services.

    Api Subclasses are required to implement the method `simple_profile`
    to return an instance of this object. Specifically, `id` and `name`
    are required to be present.
    """

    @classmethod
    def with_dict(cls, dict):
        obj = cls(**dict)
        return obj

    def __init__(self, **kwargs):
        self.id = kwargs.get('id', None)
        self.name = kwargs.get('name', None)
        self.link = kwargs.get('link', None)
        self.picture = kwargs.get('picture', None)


class Api(object):

    def __init__(self, key, client):
        # meant to be overriden
        pass

    def post(self, url, **kwargs):
        log.debug("POST: %s, %s", url, kwargs)
        r = self._session.request(
            "POST",
            url=url,
            **kwargs
        )
        return r.content

    def get(self, url, **kwargs):
        log.debug("GET: %s, %s", url, kwargs)

        r = self._session.request(
            "GET",
            url=url,
            **kwargs
        )
        return self.parse_response(r)

    def simple_profile(self):
        raise NotImplementedError("simple_profile() must be defined in a subclass")

    def parse_response(self, response):
        log.debug("Pasring API Response: %s", response.content)
        return response.json()

    def whoami(self):
        raise NotImplementedError("whoami() must be defined in a subclass")


class OAuth1Api(Api):
    def __init__(self, key, client):
        log.debug("Initializing OAuth1 API")
        self.key = key
        self.client = client

        self._session = OAuth1Session(
            client_key=client.client_id,
            client_secret=client.client_secret,
            resource_owner_key=key.access_token,
            resource_owner_secret=key.secret,
        )


class OAuth2Api(Api):
    def __init__(self, key, client):
        log.debug("Initializing OAuth2 API")
        self.key = key
        self.client = client

        token = {
            'access_token': key.access_token,
            'token_type': client.driver.token_type,
            'refresh_token': key.refresh_token,
        }

        if key.expires:
            expires_at = calendar.timegm(key.expires.utctimetuple())
            token['expires_at'] = expires_at

        refresh_extras = {
            "client_id": client.client_id,
            "client_secret": client.client_secret,
        }

        self._session = OAuth2Session(
            client.client_id,
            token=token,
            auto_refresh_url=client.driver.refresh_url,
            auto_refresh_kwargs=refresh_extras,
            token_updater=self.token_updater
        )

        # allowed values:
        # AUTH_HEADER = 'auth_header'
        # URI_QUERY = 'query'
        # BODY = 'body'
        # https://github.com/idan/oauthlib/blob/master/oauthlib/oauth2/rfc6749/clients/base.py#L23-L25
        self._session._client.default_token_placement = client.driver.bearer_type

    def token_updater(self, token):
        log.debug("Updating Token")

        # save access_token
        self.client.access_token = token.get('access_token')
        self.client.save()

        # save expires time
        now = datetime.now(pytz.utc)
        expires_at = now + timedelta(seconds=token.get('expires_in'))
        self.key.expires = expires_at

        # save refresh_token
        self.key.refresh_token = token.get('refresh_token')
        self.key.save()

# example
# {
# u'access_token': u'ya29.CwFYP2TJGLjyscdPS85ZofQ8C88XbxH5fP--VupiFMDWoEerHnQ',
# u'token_type': u'Bearer',
# u'expires_in': 3600,
# u'refresh_token': u'1/t2GZlVdGSO1cTGqPNC-ZX6ocAMEudVrK5jSpoR30zcRFq6',
# u'expires_at': 1422628154.377442}
