import json
from django.test import TestCase
from chatterbox.utils.youtube import activity_dict_from_dict
from .utils import load_json


class YoutubeUtils(TestCase):

    def test_activity_dict_from_dict(self):
        data = load_json("youtube-in-basic-video")
        final = load_json("youtube-out-basic-video")
        output = activity_dict_from_dict(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)
