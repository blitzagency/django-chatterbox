import logging
from six.moves.urllib.parse import urlencode
from . import OAuth1Api, SimpleProfile
from ..exceptions import RateLimitException


log = logging.getLogger(__name__)


class Tumblr(OAuth1Api):

    def verify_parsed_response(self, data):
        if "errors" in data and data["errors"][0]["code"] == 88:
            log.error("Rate Limited: %s", data)
            raise RateLimitException

    def whoami(self):
        log.debug("Invoking whoami")
        return self.get("https://api.tumblr.com/v2/user/info")

    def simple_profile(self):
        log.debug("Invoking simple_profile")
        data = self.whoami()

        username = data.get('response').get('user').get('name')
        result = {
            "id": username,
            "name": username,
            "link": "http://{}.tumblr.com/".format(username),
            "picture": None
        }

        profile = SimpleProfile(**result)
        return profile

    def tags(self, query, **kwargs):
        """
        https://www.tumblr.com/docs/en/api/v2#tagged-method
        """
        log.debug("Invoking tag search")
        kwargs = kwargs or {}
        url = 'https://api.tumblr.com/v2/tagged?'
        kwargs['tag'] = query
        return self.get(url + urlencode(kwargs))

    def posts(self, host_name, **kwargs):
        """
        https://www.tumblr.com/docs/en/api/v2#posts

        PARAMETERS
        host_name -- tumblr host to hit ( ex: pitchersandpoets.tumblr.com )
        type -- (String)  The type of post to return. Specify one of the following:  text, quote, link, answer, video, audio, photo, chat None - return all types
        id --  (Number)  A specific post ID. Returns the single post specified or (if not found) a 404 error.
        tag -- String  Limits the response to posts with the specified tag
        limit --   (Number)  The number of posts to return: 1-20, inclusive
        offset --  Number  Post number to start at 0 (first post)

        """

        log.debug("Invoking posts query")
        kwargs = kwargs or {}
        url = 'https://api.tumblr.com/v2/blog/pitchersandpoets.tumblr.com/posts?'
        kwargs['host_name'] = host_name
        import pdb; pdb.set_trace()
        return self.get(url + urlencode(kwargs))
