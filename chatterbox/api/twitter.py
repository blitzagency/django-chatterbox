from . import OAuth1Api, SimpleProfile


class Twitter(OAuth1Api):
    def whoami(self):
        return self.get("https://api.twitter.com/1.1/account/verify_credentials.json")

    def simple_profile(self):
        data = self.whoami()

        result = {
            "id": data.get("id_str", None),
            "name": data.get("screen_name", None),
            "link": "https://twitter.com/".format(data.get("screen_name", None)),
            "picture": data.get("profile_image_url", None)
        }

        profile = SimpleProfile(**result)
        return profile
