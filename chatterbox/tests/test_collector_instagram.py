from django.test import TransactionTestCase
from .utils import load_json
import mock
from chatterbox.models import (
    Service, Collector, Job, Activity
)


class CollectorInstagrameWallTestCase(TransactionTestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def test_basic_wall_scrape(self):
        service = Service.objects.get(key='instagram')

        collector = Collector()
        collector.driver = 'chatterbox.collectors.instagram.InstagramWall'
        collector.service = service
        collector.save()

        client = service.keys.all()[0]

        key = client.client_keys.all()[0]

        job = Job()
        job.collector = collector
        job.key = key
        job.save()

        # mock the request response
        return_value = load_json("instagram-user-feed-response")
        job.key.api.user_media = mock.Mock(return_value=return_value)
        job.run()

        self.assertEqual(Activity.objects.all().count(), 2)

    def test_user_wall_scrape(self):
        service = Service.objects.get(key='instagram')

        collector = Collector()
        collector.driver = 'chatterbox.collectors.instagram.InstagramWall'
        collector.service = service
        collector.save()

        client = service.keys.all()[0]

        key = client.client_keys.all()[0]

        job = Job()
        job.collector = collector
        job.key = key
        job.save()

        # mock the request response
        return_value = load_json("instagram-user-feed-response")
        job.key.api.user_media = mock.Mock(return_value=return_value)
        job.data = {"user_id": "11314839"}
        job.run()
        self.assertEqual(Activity.objects.all().count(), 2)

    def test_search_scrape(self):
        service = Service.objects.get(key='instagram')

        collector = Collector()
        collector.driver = 'chatterbox.collectors.instagram.InstagramSearch'
        collector.service = service
        collector.save()

        client = service.keys.all()[0]

        key = client.client_keys.all()[0]

        job = Job()
        job.collector = collector
        job.key = key
        job.save()

        # mock the request response
        return_value = load_json("instagram-search-response")
        job.key.api.search = mock.Mock(return_value=return_value)
        job.data = {"query": "fireworks"}
        job.run()
        self.assertEqual(Activity.objects.all().count(), 20)
