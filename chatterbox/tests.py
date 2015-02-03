from django.test import TestCase
from .models import Service
from pprint import pprint


class YouTubeApiTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
        self.service = Service.objects.get(label='YouTube')
        self.key = self.service.service_keys.first()
        self.api = self.key.api

    def test_simple_search(self):
        results = self.api.search('dino')
        self.assertEqual(results['pageInfo']['resultsPerPage'], 5)

    def test_complex_search(self):
        results = self.api.search('dino', maxResults=17, pageToken='CAUQAA')
        self.assertEqual(results['pageInfo']['resultsPerPage'], 17)

    def test_get_user_videos(self):
        results = self.api.user_videos()
        self.assertLess(results['pageInfo']['resultsPerPage'], 100)
