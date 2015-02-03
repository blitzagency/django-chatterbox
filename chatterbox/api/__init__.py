
class Api(object):
    pass


class Oauth1Api(Api):
    pass


class Oauth2Api(Api):
    pass

# this'll be key/client
# def __init__(self, client_id, client_secret, token, token_updater=None):

#         token_updater = token_updater or printing_token_saver

#         refresh_extras = {
#             "client_id": client_id,
#             "client_secret": client_secret,
#         }

#         self._session = OAuth2Session(client_id, token=token,
#             auto_refresh_url=self.refresh_url,
#             auto_refresh_kwargs=refresh_extras,
#             token_updater=token_saver)
