from django.test import TestCase
from chatterbox.utils.twitter import parse_to_activity
from .utils import load_json


class TwitterUtils(TestCase):

    def test_parse_to_activity(self):
        data = load_json("twitter-in-basic-tweet")
        final = load_json("twitter-out-basic-tweet")
        output = parse_to_activity(data)
        self.assertEqual(output, final)
