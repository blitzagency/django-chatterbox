from django.test import TestCase
from chatterbox.models import Service


class FacebookApiTestCase(TestCase):
    fixtures = ("project/apps/chatterbox/fixtures/users.json",
                "project/apps/chatterbox/fixtures/dump.json")

    def setUp(self):
        self.service = Service.objects.get(key="tumblr")
        self.key = self.service.service_keys.first()
        self.api = self.key.api

    def test_tag_search(self):
        results = self.api.tags("chicken")
        data = results.get('response', None)
        self.assertTrue(len(data) > 0)

    def test_page_feed(self):
        results = self.api.posts("pitchersandpoets.tumblr.com")
        data = results.get('response', None)
        self.assertTrue(len(data.get('posts')))
