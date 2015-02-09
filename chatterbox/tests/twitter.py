import os
import json
from django.test import TestCase
from ..models import Service
from chatterbox.utils.twitter import parse_to_activity
from pprint import pprint


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


class TwitterUtils(TestCase):

    def test_parse_to_activity(self):
        tests_folder = os.path.dirname(os.path.realpath(__file__))
        in_path = tests_folder + '/data/twitter-in-basic-tweet.json'
        with open(in_path) as data_file:
            data = json.load(data_file)
        output = parse_to_activity(data)

        out_path = tests_folder + '/data/twitter-out-basic-tweet.json'
        with open(out_path) as data_file:
            final = json.load(data_file)

        self.assertEqual(output, final)
