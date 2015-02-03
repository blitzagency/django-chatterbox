from . import Oauth2Api


class YouTube(Oauth2Api):
    def whoami(self):
        return self.get('https://www.googleapis.com/oauth2/v2/userinfo')

    # def search(self, query):
    #     return self.get('asdf?{}'.format(query))
