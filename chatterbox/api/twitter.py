from . import OAuth1Api


class Twitter(OAuth1Api):
    def whoami(self):
        return self.get("https://api.instagram.com/v1/users/self")

    def simple_profile(self):
        data = self.whoami()

        data = data.get('data', {})

        result = {
            "id": data.get("id", None),
            "name": data.get("username", None),
            "link": "http://instagram.com/{}".format(data.get("username", None)),
            "picture": data.get("profile_picture", None)
        }

        profile = SimpleProfile(**result)
        return profile
