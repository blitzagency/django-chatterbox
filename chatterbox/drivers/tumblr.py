import logging
from .oauth import OAuth1


log = logging.getLogger(__name__)


class Tumblr(OAuth1):
    # General info about the provider
    provider_url = 'https://www.tumblr.com/'
    docs_url = 'https://www.tumblr.com/docs/en/api/v2'
    category = 'Social'
    api_path = 'chatterbox.api.tumblr.Tumblr'

    # URLs to interact with the API
    request_token_url = 'https://www.tumblr.com/oauth/request_token'
    authorize_url = 'https://www.tumblr.com/oauth/authorize'
    access_token_url = 'https://www.tumblr.com/oauth/access_token'

    available_permissions = [
        (None, 'read tumbls'),
    ]

    scope_map = {
        None: 'read',
    }

    def get_request_token_params(self, redirect_uri, scopes):
        params = super(Tumblr, self).get_request_token_params(redirect_uri, scopes)
        # Convert to Tumblr's permissions model
        scopes = map(lambda x: self.scope_map.get(x or None), scopes)
        if any(scopes):
            params['x_auth_access_type'] = scopes[0]

        return params
