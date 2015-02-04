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

    def test_user_feed(self):
        results = self.api.user_feed()
        data = results.get('data', None)
        first = data[0]
        self.assertEqual(first.get('from').get('name'), 'Dino Petrone')

    def test_brand_feed(self):
        results = self.api.user_feed('11936081183')
        data = results.get('data', None)
        self.assertTrue(len(data) > 0)
