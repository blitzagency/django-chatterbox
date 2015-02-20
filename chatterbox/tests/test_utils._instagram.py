import json
from django.test import TestCase
from chatterbox.utils.instagram import parse_to_activity
from .utils import load_json


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
