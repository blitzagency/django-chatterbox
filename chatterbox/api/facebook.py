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

    # there is no search ability on api v2+ (depricated at v1)

    def user_media(self, **kwargs):
        kwargs = kwargs or {}
        url = 'https://graph.facebook.com/search?'
        kwargs['q'] = query

        return self.get(url + urlencode(kwargs))
