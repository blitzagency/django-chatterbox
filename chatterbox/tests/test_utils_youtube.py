import json
from django.test import TestCase
from chatterbox.utils.youtube import parse_to_activity
from .utils import load_json


class YoutubeUtils(TestCase):

    def test_parse_to_activity(self):
        data = load_json("youtube-in-basic-video")
        final = load_json("youtube-out-basic-video")
        output = parse_to_activity(data)
        value1 = json.dumps(output, sort_keys=True)
        value2 = json.dumps(final, sort_keys=True)
        self.assertEqual(value1, value2)
