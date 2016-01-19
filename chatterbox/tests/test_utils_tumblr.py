from django.test import TestCase
from chatterbox.utils.tumblr import activity_dict_from_dict
from .utils import load_json


class TumblrUtils(TestCase):

    def test_activity_dict_from_dict(self):

        data = load_json("tumblr-in-basic-post")
        output = activity_dict_from_dict(data)
        final = load_json("tumblr-out-basic-post")
        self.assertEqual(output, final)
