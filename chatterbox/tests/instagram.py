from django.test import TestCase
from ..models import Service


class InstagramApiTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
        self.service = Service.objects.get(key='instagram')
        self.key = self.service.service_keys.first()
        self.api = self.key.api

    def test_simple_search(self):
        pass
        # print(self.api)
