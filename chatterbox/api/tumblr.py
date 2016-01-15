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

    def search(self, query, **kwargs):
        """https://dev.twitter.com/rest/reference/get/search/tweets

        Common kwargs to pass:
        geocode -- latitude,longitude,radius
        count -- Up to a maximum of 100. Defaults to 15
        until -- Returns tweets generated before the given date. Date
                 should be formatted as YYYY-MM-DD
        result_type -- Specifies what type of search results you would
                       prefer to receive. The current default is "mixed."
                       Allowed values: mixed, recent, popular
        since_id -- Returns results with an ID greater than (that is,
                    more recent than) the specified ID
        max_id -- Returns results with an ID less than (that is, older
                  than) or equal to the specified ID.
        include_entities -- The entities node will be disincluded when
                            set to false.
        callback -- If supplied, the response will use the JSONP format
                    with a callback of the given name.

        """
        log.debug("Invoking search")
        kwargs = kwargs or {}
        url = 'https://api.twitter.com/1.1/search/tweets.json?'
        kwargs['q'] = query

        return self.get(url + urlencode(kwargs))

    def home_timeline(self, **kwargs):
        """https://dev.twitter.com/rest/reference/get/statuses/home_timeline

        Common kwargs to pass:

        count -- Up to a maximum of 200. Defaults to 20
        since_id -- Returns results with an ID greater than (that is,
                    more recent than) the specified ID
        max_id -- Returns results with an ID less than (that is, older
                  than) or equal to the specified ID.
        trim_user -- When set to either true, t or 1, each tweet returned
                     in a timeline will include a user object including
                    only the status authors numerical ID. Omit this
                    parameter to receive the complete user object.
        exclude_replies -- This parameter will prevent replies from
                           appearing in the returned timeline. Using
                           exclude_replies with the count parameter will
                           mean you will receive up-to count tweets -
                           this is because the count parameter retrieves
                           that many tweets before filtering out retweets
                           and replies.

        contributor_details -- This parameter enhances the contributors
                               element of the status response to include
                               the screen_name of the contributor. By
                               default only the user_id of the contributor
                               is included.
        include_entities -- The entities node will be disincluded when
                            set to false.


        """
        log.debug("Invoking home_timeline")
        kwargs = kwargs or {}
        url = "https://api.twitter.com/1.1/statuses/home_timeline.json?"
        return self.get(url + urlencode(kwargs))
