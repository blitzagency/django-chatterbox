from django.test import TestCase
from .utils import load_json
import mock
from chatterbox.models import (
    Service, Collector, Job, Activity
)


class CollectorInstagrameWallTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def test_basic_wall_scrape(self):
        service = Service.objects.get(key='instagram')

        collector = Collector.objects.get(
            driver='chatterbox.collectors.instagram.InstagramWall')

        client = service.keys.all()[0]

        key = client.client_keys.all()[0]

        job = Job()
        job.collector = collector
        job.save()
        job.keys.add(key)

        # mock the request response
        return_value = load_json("instagram-user-feed-response")
        with mock.patch('chatterbox.api.instagram.Instagram.user_media') as mock_user_media:
            mock_user_media.return_value = return_value
            job.run()
            self.assertEqual(Activity.objects.all().count(), 2)

    def test_user_wall_scrape(self):
        service = Service.objects.get(key='instagram')

        collector = Collector.objects.get(
            driver='chatterbox.collectors.instagram.InstagramWall')

        client = service.keys.all()[0]

        key = client.client_keys.all()[0]

        job = Job()
        job.collector = collector
        job.save()
        job.keys.add(key)

        return_value = load_json("instagram-user-feed-response")
        with mock.patch('chatterbox.api.instagram.Instagram.user_media') as mock_user_media:
            mock_user_media.return_value = return_value
            job.data = {"user_id": "11314839"}
            job.run()
        self.assertEqual(Activity.objects.all().count(), 2)

    def test_search_scrape(self):
        service = Service.objects.get(key='instagram')

        collector = Collector.objects.get(
            driver='chatterbox.collectors.instagram.InstagramSearch')

        client = service.keys.all()[0]

        key = client.client_keys.all()[0]

        job = Job()
        job.collector = collector
        job.save()
        job.keys.add(key)

        return_value = load_json("instagram-search-response")
        job.data = {"query": "fireworks"}

        with mock.patch('chatterbox.api.instagram.Instagram.search') as mock_search:
            mock_search.return_value = return_value
            job.run()

            self.assertEqual(Activity.objects.all().count(), 20)
