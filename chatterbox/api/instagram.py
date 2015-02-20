import logging
from six.moves.urllib.parse import urlencode
from . import OAuth2Api, SimpleProfile


log = logging.getLogger(__name__)


class Instagram(OAuth2Api):

    def verify_parsed_response(self, data):
        pass

    def whoami(self):
        log.debug("Invoking whoami")
        return self.get("https://api.instagram.com/v1/users/self")

    def simple_profile(self):
        log.debug("Invoking simple_profile")
        data = self.whoami()

        data = data.get('data', {})

        link = "http://instagram.com/{}".format(data.get("username", None))

        result = {
            "id": data.get("id", None),
            "name": data.get("username", None),
            "link": link,
            "picture": data.get("profile_picture", None)
        }

        profile = SimpleProfile(**result)
        return profile

    def search(self, query, **kwargs):
        """http://instagram.com/developer/endpoints/tags/

        PARAMETERS
        count -- Count of tagged media to return.
        min_tag_id -- Return media before this min_tag_id.
        max_tag_id -- Return media after this max_tag_id.

        """

        log.debug("Invoking search")

        # need to do a check on quality of query (spaces?)
        url = 'https://api.instagram.com/v1/tags/{}/media/recent'.format(query)
        if kwargs:
            additional = urlencode(kwargs)
            url = url + '?{}'.format(additional)
        return self.get(url)

    def user_media(self, user_id='self', **kwargs):
        """http://instagram.com/developer/endpoints/users/#get_users_feed

        PARAMETERS
        count -- Count of media to return.
        max_timestamp -- Return media before this UNIX timestamp.
        access_token -- A valid access token.
        min_timestamp -- Return media after this UNIX timestamp.
        min_id -- Return media later than this min_id.
        max_id -- Return media earlier than this max_id.

        """

        log.debug("Invoking user_media")
        # need to do a check on quality of query (spaces?)
        url = 'https://api.instagram.com/v1/users/{}/media/recent'.format(user_id)
        if kwargs:
            additional = urlencode(kwargs)
            url = url + '?{}'.format(additional)
        return self.get(url)
