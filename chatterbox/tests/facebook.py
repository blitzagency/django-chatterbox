from django.test import TestCase
from ..models import Service
from pprint import pprint


class FacebookApiTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
        self.service = Service.objects.get(key='facebook')
        self.key = self.service.service_keys.first()
        self.api = self.key.api

    def test_simple_search(self):
        results = self.api.search('dino')
        pprint(results)

    # def test_complex_search(self):
    #     pass

    # def test_user_media(self):
    #     pass
