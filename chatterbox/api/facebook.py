# import the logging library
import logging
from six.moves.urllib.parse import urlencode
from . import OAuth2Api, SimpleProfile


# Get an instance of a logger
log = logging.getLogger(__name__)

API_VERSION = "2.2"


class Facebook(OAuth2Api):

    @property
    def base_url(self):
        return "https://graph.facebook.com/v{}".format(API_VERSION)

    def whoami(self):
        log.debug("Invoking whoami")
        return self.get("https://graph.facebook.com/me")

    def simple_profile(self):
        log.debug("Invoking simple_profile")

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
        log.debug("Invoking user_feed")
        kwargs = kwargs or {}
        url = 'https://graph.facebook.com/v{}/{}/feed?'\
            .format(API_VERSION, user)
        return self.get(url + urlencode(kwargs))

    def object_detail(self, object_id):
        """https://developers.facebook.com/docs/graph-api/reference/v2.2/status
        """
        log.debug("Invoking object_detail")
        url = "{}/{}".format(self.base_url, object_id)
        return self.get(url)
