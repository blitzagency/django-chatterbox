from six.moves.urllib.parse import urlencode
from . import OAuth2Api, SimpleProfile


API_VERSION = "2.2"


class Facebook(OAuth2Api):

    def whoami(self):
        return self.get("https://graph.facebook.com/me")

    def simple_profile(self):
        data = self.whoami()
        picture = 'https://graph.facebook.com/{}/picture'\
            .format(data.get('id'))
        result = {
            "id": data.get("id", None),
            "name": data.get("name", None),
            "link": data.get('link'),
            "picture": picture
        }

        profile = SimpleProfile(**result)
        return profile

    # there is no search ability on api v2+ (depricated at v1)

    def user_feed(self, user='me', **kwargs):
        """https://developers.facebook.com/docs/graph-api/reference/v2.2/user/feed
        """
        kwargs = kwargs or {}
        url = 'https://graph.facebook.com/v{}/{}/feed?'\
            .format(API_VERSION, user)
        return self.get(url + urlencode(kwargs))
