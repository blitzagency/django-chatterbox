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

    def user_media(self, **kwargs):
        pass
