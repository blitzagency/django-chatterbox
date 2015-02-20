import json
from django.test import TestCase
from .utils import load_json
from chatterbox.utils.facebook import activity_dict_from_dict


class FacebookUtils(TestCase):

    def test_facebook_link_activity_dict_from_dict(self):
        data = load_json("facebook-in-basic-link")
        final = load_json("facebook-out-basic-link")
        output = activity_dict_from_dict(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)

    def test_facebook_photo_activity_dict_from_dict(self):
        data = load_json("facebook-in-basic-photo")
        final = load_json("facebook-out-basic-photo")
        output = activity_dict_from_dict(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)

    def test_facebook_basic_status_message_activity_dict_from_dict(self):
        data = load_json("facebook-in-basic-status+message")
        final = load_json("facebook-out-basic-status+message")
        output = activity_dict_from_dict(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)

    def test_facebook_basic_status_message_comments_activity_dict_from_dict(self):
        data = load_json("facebook-in-basic-status+message+comments")
        final = load_json("facebook-out-basic-status+message+comments")
        output = activity_dict_from_dict(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)

    def test_facebook_status_activity_dict_from_dict(self):
        data = load_json("facebook-in-basic-status")
        final = load_json("facebook-out-basic-status")
        output = activity_dict_from_dict(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)

    def test_facebook_video_activity_dict_from_dict(self):
        data = load_json("facebook-in-basic-video")
        final = load_json("facebook-out-basic-video")
        output = activity_dict_from_dict(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)
