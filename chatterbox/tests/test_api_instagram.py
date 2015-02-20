from django.test import TestCase
from chatterbox.models import Service


class InstagramApiTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
        self.service = Service.objects.get(key='instagram')
        self.key = self.service.service_keys.first()
        self.api = self.key.api

    def test_simple_search(self):
        results = self.api.search('fireworks')
        self.assertEqual(results['meta']['code'], 200)

    def test_complex_search(self):
        results = self.api.search(
            'fireworks',
            count=17,
            min_tag_id='1423001539550109')
        self.assertEqual(len(results['data']), 17)

    def test_default_user_media(self):
        results = self.api.user_media()
        self.assertEqual(results['meta']['code'], 200)

    def test_user_media(self):
        user_id='11314839'
        results = self.api.user_media(user_id=user_id)
        self.assertEqual(results['meta']['code'], 200)
        first_post = results.get('data')[0]
        first_user_id = first_post.get('user').get('id')
        self.assertEqual(first_user_id, user_id)
