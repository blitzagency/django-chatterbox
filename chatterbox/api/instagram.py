from six.moves.urllib.parse import urlencode
from . import OAuth2Api, SimpleProfile


class Instagram(OAuth2Api):

    def whoami(self):
        return self.get("https://api.instagram.com/v1/users/self")

    def simple_profile(self):
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

    # def user_media(self, **kwargs):
    #     pass

    def search(self, query, **kwargs):
        """http://instagram.com/developer/endpoints/tags/

        PARAMETERS
        count -- Count of tagged media to return.
        min_tag_id -- Return media before this min_tag_id.
        max_tag_id -- Return media after this max_tag_id.

        """
        # need to do a check on quality of query (spaces?)
        url = 'https://api.instagram.com/v1/tags/{}/media/recent'.format(query)
        if kwargs:
            additional = urlencode(kwargs)
            url = url + '?{}'.format(additional)
        return self.get(url)
