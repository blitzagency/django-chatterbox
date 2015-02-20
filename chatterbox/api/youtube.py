import logging
from six.moves.urllib.parse import urlencode
from . import OAuth2Api, SimpleProfile


log = logging.getLogger(__name__)


class YouTube(OAuth2Api):

    def verify_parsed_response(self, data):
        pass

    def whoami(self):
        log.debug("Invoking whoami")
        return self.get("https://www.googleapis.com/oauth2/v2/userinfo")

    def simple_profile(self):
        log.debug("Invoking simple_profile")
        data = self.whoami()

        result = {
            "id": data["id"],
            "name": data["name"],
            "link": data["link"],
            "picture": data["picture"],
        }

        profile = SimpleProfile(**result)
        return profile

    def search(self, query, part='snippet', type='video', **kwargs):
        """https://developers.google.com/youtube/v3/docs/search/list

        Common kwargs to pass to youtube:
        maxResults -- int value
        pageToken -- ex:CAUQAA   this is returned from the previous page result

        the docs link above has a full list of all
        """
        log.debug("Invoking search")

        url = 'https://www.googleapis.com/youtube/v3/search?part={}&q={}'\
            .format(part, query)
        if kwargs:
            additional = urlencode(kwargs)
            url = url + '&{}'.format(additional)
        return self.get(url)

    def user_videos(self, part='snippet', **kwargs):
        """https://developers.google.com/youtube/v3/docs/search/list

        Common kwargs to pass to youtube:
        maxResults -- int value
        pageToken -- ex:CAUQAA   this is returned from the previous page result

        the docs link above has a full list of all
        """

        log.debug("Invoking user_videos")

        url = 'https://www.googleapis.com/youtube/v3/search?part={}&forMine=true&type=video'\
            .format(part)
        if kwargs:
            additional = urlencode(kwargs)
            url = url + '&{}'.format(additional)
        return self.get(url)
