import json
import pytz
from datetime import (datetime, timedelta)
from requests_oauthlib import OAuth2Session


class Api(object):

    def __init__(self, key, client):
        # meant to be overriden
        pass

    def post(self, url, **kwargs):
        r = self._session.request(
            "POST",
            url=url,
            **kwargs
        )
        return r.content

    def get(self, url, **kwargs):
        r = self._session.request(
            "GET",
            url=url,
            **kwargs
        )
        return self.parse_response(r)

    def parse_response(self, response):
        return response.json

    # this must be overriden
    def whoami(self):
        pass


class Oauth1Api(Api):
    pass


class Oauth2Api(Api):
    def __init__(self, key, client):

        self.key = key
        self.client = client

        refresh_extras = {
            "client_id": client.client_id,
            "client_secret": client.client_secret,
        }

        token = {
            'access_token': key.access_token,
            'token_type': client.driver.token_type,
            'refresh_token': key.refresh_token,
        }

        self._session = OAuth2Session(
            client.client_id,
            token=token,
            auto_refresh_url=client.driver.refresh_url,
            auto_refresh_kwargs=refresh_extras,
            token_updater=self.token_updater
        )

    def token_updater(self, token):

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
