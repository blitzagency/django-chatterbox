from six.moves.urllib.parse import urlencode
from . import OAuth2Api, SimpleProfile


class Facebook(OAuth2Api):

    def whoami(self):
        return self.get("https://graph.facebook.com/me")

    def simple_profile(self):
        data = self.whoami()
        picture = 'https://graph.facebook.com/{}/picture'.format(data.get('id'))
        result = {
            "id": data.get("id", None),
            "name": data.get("name", None),
            "link": data.get('link'),
            "picture": picture
        }

        profile = SimpleProfile(**result)
        return profile

    def search(self, query, **kwargs):
        pass

    def user_media(self, **kwargs):
        pass
