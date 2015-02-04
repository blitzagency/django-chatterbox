from six.moves.urllib.parse import urlencode
from . import OAuth2Api, SimpleProfile


class Facebook(OAuth2Api):

    def whoami(self):
        pass

    def simple_profile(self):
        pass

    # def simple_profile(self):
    #     data = self.whoami()

    #     data = data.get('data', {})

    #     link = "http://instagram.com/{}".format(data.get("username", None))

    #     result = {
    #         "id": data.get("id", None),
    #         "name": data.get("username", None),
    #         "link": link,
    #         "picture": data.get("profile_picture", None)
    #     }

    #     profile = SimpleProfile(**result)
    #     return profile

    def search(self, query, **kwargs):
        pass

    def user_media(self, **kwargs):
        pass
