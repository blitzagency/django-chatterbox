import json
from django.test import TestCase
from ..models import Service
from chatterbox.utils.youtube import parse_to_activity
from .utils import load_json


class YouTubeApiTestCase(TestCase):
    fixtures = ("project/apps/chatterbox/fixtures/users.json",
                "project/apps/chatterbox/fixtures/dump.json")

    def setUp(self):
        self.service = Service.objects.get(label="YouTube")
        self.key = self.service.service_keys.first()
        self.api = self.key.api

    def test_simple_search(self):
        results = self.api.search("fireworks")
        self.assertEqual(results["pageInfo"]["resultsPerPage"], 5)

    def test_complex_search(self):
        results = self.api.search("dino", maxResults=17, pageToken="CAUQAA")
        self.assertEqual(results["pageInfo"]["resultsPerPage"], 17)

    def test_get_user_videos(self):
        results = self.api.user_videos()
        self.assertLess(results["pageInfo"]["resultsPerPage"], 100)


class YoutubeUtils(TestCase):

    def test_parse_to_activity(self):
        data = load_json("youtube-in-basic-video")
        final = load_json("youtube-out-basic-video")
        output = parse_to_activity(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)
