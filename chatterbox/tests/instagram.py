import json
from django.test import TestCase
from ..models import Service
from chatterbox.utils.instagram import parse_to_activity
from .utils import load_json
from pprint import pprint


class InstagramApiTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
        self.service = Service.objects.get(key='instagram')
        self.key = self.service.service_keys.first()
        self.api = self.key.api

    def test_simple_search(self):
        results = self.api.search('fireworks')
        self.assertEqual(results['meta']['code'], 200)

    def test_complex_search(self):
        results = self.api.search(
            'fireworks',
            count=17,
            min_tag_id='1423001539550109')
        self.assertEqual(len(results['data']), 17)

    def test_user_media(self):
        results = self.api.user_media()
        self.assertEqual(results['meta']['code'], 200)


class InstagramUtils(TestCase):

    def test_instagram_image_parse_to_activity(self):
        data = load_json("instagram-in-basic-image")
        final = load_json("instagram-out-basic-image")
        output = parse_to_activity(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)

    def test_instagram_video_parse_to_activity(self):
        data = load_json("instagram-in-basic-video")
        final = load_json("instagram-out-basic-video")
        output = parse_to_activity(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)
