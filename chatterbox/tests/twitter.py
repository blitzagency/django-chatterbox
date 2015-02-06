import os
import json
from django.test import TestCase
from ..models import Service
from chatterbox.utils.twitter import parse_to_activity
from pprint import pprint


class TwitterApiTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
        self.service = Service.objects.get(key='twitter')
        self.key = self.service.service_keys.first()
        self.api = self.key.api

    def test_simple_search(self):
        data = self.api.search('flowers')

        # default count is 15
        self.assertTrue(data['search_metadata']['count'] == 15)
        self.assertTrue(data['search_metadata']['count'] == len(data['statuses']))

    def test_complex_search(self):
        data = self.api.search('flowers', count=100)

        self.assertTrue(data['search_metadata']['count'] == 100)
        self.assertTrue(data['search_metadata']['count'] == len(data['statuses']))

    def test_get_home_timeline(self):
        data = self.api.home_timeline()
        count = len(data)
        self.assertTrue(count <= 20 and count > 0)

    def test_get_home_timeline_complex(self):
        data = self.api.home_timeline(count=50)
        count = len(data)

        self.assertTrue(count <= 50 and count > 20)


class TwitterUtils(TestCase):

    def test_parse_to_activity(self):
        path = os.path.dirname(os.path.realpath(__file__)) + '/test-twitter-parse/tweet.json'
        with open(path) as data_file:
            data = json.load(data_file)
        output = parse_to_activity(data)
        final = {'@context': 'http://www.w3.org/ns/activitystreams',
                 '@type': 'Activity',
                 'actor': {'@id': 'https://www.twitter.com/MacRumors',
                           '@type': 'Person',
                           'displayName': u'MacRumors.com',
                           'image': {'@type': 'Link',
                                     'href': u'http://pbs.twimg.com/profile_images/2611360072/uoza6k5toiy51th66jlj_normal.jpeg',
                                     'mediaType': 'image/jpeg'},
                           'twitter:contributors_enabled': False,
                           'twitter:created_at': u'Wed May 21 20:01:19 +0000 2008',
                           'twitter:default_profile': False,
                           'twitter:default_profile_image': False,
                           'twitter:description': u'Apple, Mac, iPhone and iPad News and Rumors.  Got a tip?  Email it to tips@macrumors.com',
                           'twitter:entities': {u'description': {u'urls': []},
                                                u'url': {u'urls': [{u'display_url': u'macrumors.com',
                                                                    u'expanded_url': u'http://www.macrumors.com',
                                                                    u'indices': [0, 22],
                                                                    u'url': u'http://t.co/ei8cMSbN5a'}]}},
                           'twitter:favourites_count': 73,
                           'twitter:follow_request_sent': False,
                           'twitter:followers_count': 600996,
                           'twitter:following': True,
                           'twitter:friends_count': 47,
                           'twitter:geo_enabled': False,
                           'twitter:id': 14861285,
                           'twitter:id_str': u'14861285',
                           'twitter:is_translation_enabled': False,
                           'twitter:is_translator': False,
                           'twitter:lang': u'en',
                           'twitter:listed_count': 16674,
                           'twitter:location': u'',
                           'twitter:notifications': False,
                           'twitter:profile_background_color': u'C2D6F2',
                           'twitter:profile_background_image_url': u'http://pbs.twimg.com/profile_background_images/378800000168665032/-XdMWMPy.png',
                           'twitter:profile_background_image_url_https': u'https://pbs.twimg.com/profile_background_images/378800000168665032/-XdMWMPy.png',
                           'twitter:profile_background_tile': True,
                           'twitter:profile_banner_url': u'https://pbs.twimg.com/profile_banners/14861285/1399010969',
                           'twitter:profile_image_url': u'http://pbs.twimg.com/profile_images/2611360072/uoza6k5toiy51th66jlj_normal.jpeg',
                           'twitter:profile_image_url_https': u'https://pbs.twimg.com/profile_images/2611360072/uoza6k5toiy51th66jlj_normal.jpeg',
                           'twitter:profile_link_color': u'0084B4',
                           'twitter:profile_location': None,
                           'twitter:profile_sidebar_border_color': u'FFFFFF',
                           'twitter:profile_sidebar_fill_color': u'DDEEF6',
                           'twitter:profile_text_color': u'333333',
                           'twitter:profile_use_background_image': True,
                           'twitter:protected': False,
                           'twitter:screen_name': u'MacRumors',
                           'twitter:statuses_count': 17126,
                           'twitter:time_zone': u'Eastern Time (US & Canada)',
                           'twitter:url': u'http://t.co/ei8cMSbN5a',
                           'twitter:utc_offset': -18000,
                           'twitter:verified': True},
                 'object': {'@id': 'https://twitter.com/MacRumors/status/563793708303142912',
                            '@type': 'Note',
                            'content': u"Hands-On Review of Oral-B's iPhone-Connected Bluetooth Smart Toothbrush http://t.co/U6h3sPCXgB by @julipuli http://t.co/i6Qu1Kx8Dq",
                            'twitter:contributors': None,
                            'twitter:coordinates': None,
                            'twitter:entities': {u'hashtags': [],
                                                 u'media': [{u'display_url': u'pic.twitter.com/i6Qu1Kx8Dq',
                                                             u'expanded_url': u'http://twitter.com/MacRumors/status/563793708303142912/photo/1',
                                                             u'id': 563793708231819264,
                                                             u'id_str': u'563793708231819264',
                                                             u'indices': [108, 130],
                                                             u'media_url': u'http://pbs.twimg.com/media/B9L_Y_nCAAA4UG2.jpg',
                                                             u'media_url_https': u'https://pbs.twimg.com/media/B9L_Y_nCAAA4UG2.jpg',
                                                             u'sizes': {u'large': {u'h': 600,
                                                                                   u'resize': u'fit',
                                                                                   u'w': 800},
                                                                        u'medium': {u'h': 450,
                                                                                    u'resize': u'fit',
                                                                                    u'w': 600},
                                                                        u'small': {u'h': 255,
                                                                                   u'resize': u'fit',
                                                                                   u'w': 340},
                                                                        u'thumb': {u'h': 150,
                                                                                   u'resize': u'crop',
                                                                                   u'w': 150}},
                                                             u'type': u'photo',
                                                             u'url': u'http://t.co/i6Qu1Kx8Dq'}],
                                                 u'symbols': [],
                                                 u'urls': [{u'display_url': u'macrumors.com/2015/02/06/ora\u2026',
                                                            u'expanded_url': u'http://www.macrumors.com/2015/02/06/oral-b-pro-smart-toothbrush-review/',
                                                            u'indices': [72, 94],
                                                            u'url': u'http://t.co/U6h3sPCXgB'}],
                                                 u'user_mentions': [{u'id': 7354292,
                                                                     u'id_str': u'7354292',
                                                                     u'indices': [98, 107],
                                                                     u'name': u'Juli Clover',
                                                                     u'screen_name': u'julipuli'}]},
                            'twitter:extended_entities': {u'media': [{u'display_url': u'pic.twitter.com/i6Qu1Kx8Dq',
                                                                      u'expanded_url': u'http://twitter.com/MacRumors/status/563793708303142912/photo/1',
                                                                      u'id': 563793708231819264,
                                                                      u'id_str': u'563793708231819264',
                                                                      u'indices': [108,
                                                                                   130],
                                                                      u'media_url': u'http://pbs.twimg.com/media/B9L_Y_nCAAA4UG2.jpg',
                                                                      u'media_url_https': u'https://pbs.twimg.com/media/B9L_Y_nCAAA4UG2.jpg',
                                                                      u'sizes': {u'large': {u'h': 600,
                                                                                            u'resize': u'fit',
                                                                                            u'w': 800},
                                                                                 u'medium': {u'h': 450,
                                                                                             u'resize': u'fit',
                                                                                             u'w': 600},
                                                                                 u'small': {u'h': 255,
                                                                                            u'resize': u'fit',
                                                                                            u'w': 340},
                                                                                 u'thumb': {u'h': 150,
                                                                                            u'resize': u'crop',
                                                                                            u'w': 150}},
                                                                      u'type': u'photo',
                                                                      u'url': u'http://t.co/i6Qu1Kx8Dq'}]},
                            'twitter:favorite_count': 20,
                            'twitter:favorited': False,
                            'twitter:geo': None,
                            'twitter:id': 563793708303142912,
                            'twitter:id_str': u'563793708303142912',
                            'twitter:in_reply_to_screen_name': None,
                            'twitter:in_reply_to_status_id': None,
                            'twitter:in_reply_to_status_id_str': None,
                            'twitter:in_reply_to_user_id': None,
                            'twitter:in_reply_to_user_id_str': None,
                            'twitter:lang': u'en',
                            'twitter:place': None,
                            'twitter:possibly_sensitive': False,
                            'twitter:retweet_count': 21,
                            'twitter:retweeted': False,
                            'twitter:source': u'<a href="http://www.macrumors.com" rel="nofollow">MacRumors.com Web</a>',
                            'twitter:text': u"Hands-On Review of Oral-B's iPhone-Connected Bluetooth Smart Toothbrush http://t.co/U6h3sPCXgB by @julipuli http://t.co/i6Qu1Kx8Dq",
                            'twitter:truncated': False},
                 'provider': {'@type': 'Service', 'displayName': 'Twitter'},
                 'published': u'Fri Feb 06 20:17:49 +0000 2015'}
        self.assertEqual(output, final)
