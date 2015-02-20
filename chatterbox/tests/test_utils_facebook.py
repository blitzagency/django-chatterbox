import json
from django.test import TestCase
from .utils import load_json
from chatterbox.utils.facebook import parse_to_activity


class FacebookUtils(TestCase):

    def test_facebook_link_parse_to_activity(self):
        data = load_json("facebook-in-basic-link")
        final = load_json("facebook-out-basic-link")
        output = parse_to_activity(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)

    def test_facebook_photo_parse_to_activity(self):
        data = load_json("facebook-in-basic-photo")
        final = load_json("facebook-out-basic-photo")
        output = parse_to_activity(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)

    def test_facebook_basic_status_message_parse_to_activity(self):
        data = load_json("facebook-in-basic-status+message")
        final = load_json("facebook-out-basic-status+message")
        output = parse_to_activity(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)

    def test_facebook_basic_status_message_comments_parse_to_activity(self):
        data = load_json("facebook-in-basic-status+message+comments")
        final = load_json("facebook-out-basic-status+message+comments")
        output = parse_to_activity(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)

    def test_facebook_status_parse_to_activity(self):
        data = load_json("facebook-in-basic-status")
        final = load_json("facebook-out-basic-status")
        output = parse_to_activity(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)

    def test_facebook_video_parse_to_activity(self):
        data = load_json("facebook-in-basic-video")
        final = load_json("facebook-out-basic-video")
        output = parse_to_activity(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)
