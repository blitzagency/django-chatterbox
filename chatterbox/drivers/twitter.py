from .oauth import OAuth1


class Twitter(OAuth1):
    # General info about the provider
    provider_url = 'https://www.twitter.com/'
    docs_url = 'https://dev.twitter.com/rest/public'
    category = 'Social'
    api_path = 'chatterbox.api.twitter.Twitter'

    # URLs to interact with the API
    request_token_url = 'https://api.twitter.com/oauth/request_token'
    authorize_url = 'https://api.twitter.com/oauth/authorize'
    access_token_url = 'https://api.twitter.com/oauth/access_token'

    available_permissions = [
        (None, 'read your tweets'),
        ('write', 'read and send tweets'),
        ('dm', 'read and send tweets, including DMs'),
    ]

    # Twitter's permissions model is subtractive, rather than additive. foauth
    # is registered with maximum permissions, which then have to be limited on
    # each authorization call. This mapping converts between the additive model
    # used within foauth and the subtractive model used by Twitter.
    scope_map = {
        None: 'read',
        'write': 'write',
        'dm': None
    }

    def get_request_token_params(self, redirect_uri, scopes):
        params = super(Twitter, self).get_request_token_params(redirect_uri, scopes)

        # Convert to Twitter's permissions model
        scopes = map(lambda x: self.scope_map.get(x or None), scopes)
        if any(scopes):
            params['x_auth_access_type'] = scopes[0]

        return params

    def callback(self, data, *args, **kwargs):
        # if 'denied' in data:
        #     raise OAuthDenied('Denied access to Twitter')

        return super(Twitter, self).callback(data, *args, **kwargs)

    # def get_user_id(self, key):
    #     r = self.api(key, self.api_domains[0], u'/1.1/account/verify_credentials.json')
    #     return unicode(r.json()[u'id'])
