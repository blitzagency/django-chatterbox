import mock
from django.test import TestCase
from chatterbox.models import Service
from chatterbox.exceptions import RateLimitException
from .utils import load_data, mock_request_with_json_response


class TwitterApiTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
        self.service = Service.objects.get(key='twitter')
        self.key = self.service.service_keys.first()
        self.api = self.key.api

    def test_simple_search(self):
        data = self.api.search('flowers')

        # default count is 15
        self.assertTrue(data['search_metadata']['count'] == 15)
        self.assertTrue(data['search_metadata']['count'] == len(data['statuses']))

    def test_rate_limit(self):
        json = load_data("twitter-rate-limit-response")

        request = mock_request_with_json_response(json)
        self.api._session.request = request
        self.assertRaises(RateLimitException, self.api.search, [self, "#foo"])

    def test_complex_search(self):
        data = self.api.search('flowers', count=100)

        self.assertTrue(data['search_metadata']['count'] == 100)
        self.assertTrue(data['search_metadata']['count'] == len(data['statuses']))

    def test_get_home_timeline(self):
        data = self.api.home_timeline()
        count = len(data)
        self.assertTrue(count <= 20 and count > 0)

    def test_get_home_timeline_complex(self):
        data = self.api.home_timeline(count=50)
        count = len(data)

        self.assertTrue(count <= 50 and count > 20)
