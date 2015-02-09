import os
import json
from django.test import TestCase
from ..models import Service
from pprint import pprint
from chatterbox.utils.instagram import instagram_parse_to_activity


class InstagramApiTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
        self.service = Service.objects.get(key='instagram')
        self.key = self.service.service_keys.first()
        self.api = self.key.api

    def test_simple_search(self):
        results = self.api.search('dino')
        self.assertEqual(results['meta']['code'], 200)

    def test_complex_search(self):
        results = self.api.search(
            'dino',
            count=17,
            min_tag_id='1423001539550109')
        self.assertEqual(len(results['data']), 17)

    def test_user_media(self):
        results = self.api.user_media()
        self.assertEqual(results['meta']['code'], 200)


class InstagramUtils(TestCase):

    def test_instagram_parse_to_activity(self):
        tests_folder = os.path.dirname(os.path.realpath(__file__))
        in_path = tests_folder + '/test-instagram-parse/in-basic-insta.json'
        with open(in_path) as data_file:
            data = json.load(data_file)
        output = instagram_parse_to_activity(data)
        # pprint(output)

        # out_path = tests_folder + '/test-instagram-parse/out-basic-tweet.json'
        # with open(out_path) as data_file:
        #     final = json.load(data_file)

        # self.assertEqual(output, final)
