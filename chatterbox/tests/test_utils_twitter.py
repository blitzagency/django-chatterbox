from django.test import TestCase
from chatterbox.utils.twitter import activity_dict_from_dict
from .utils import load_json


class TwitterUtils(TestCase):

    def test_activity_dict_from_dict(self):
        data = load_json("twitter-in-basic-tweet")
        final = load_json("twitter-out-basic-tweet")
        output = activity_dict_from_dict(data)
        self.assertEqual(output, final)
