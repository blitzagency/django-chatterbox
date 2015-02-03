from . import Oauth2Api, SimpleProfile


class YouTube(Oauth2Api):
    def whoami(self):
        return self.get("https://www.googleapis.com/oauth2/v2/userinfo")

    def simple_profile(self):
        data = self.whoami()

        result = {
            "id": data["id"],
            "name": data["name"],
            "link": data["link"],
            "picture": data["picture"],
        }

        profile = SimpleProfile(**result)
        return profile

    # def search(self, query):
    #     return self.get('asdf?{}'.format(query))
