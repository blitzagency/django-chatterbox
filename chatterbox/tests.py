from django.test import TestCase
from .models import Service


class ApiTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):

        self._yt = Service.objects.get(label='YouTube')
        keys = self._yt.service_keys.all()
        print(keys)
        import pdb; pdb.set_trace()
        pass

    def test_youtube_search(self):
        print('hi')
