from django.test import TestCase
from django.test import TransactionTestCase
from chatterbox.models import (
    Service, Collector, Job
)


class CollectorTwitterTestCase(TransactionTestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
        pass

    def test_twitter_search(self):
        service = Service.objects.get(key='twitter')

        collector = Collector()
        collector.driver = "chatterbox.collectors.twitter.TwitterTagSearch"
        collector.service = service
        collector.save()

        client = service.keys.all()[0]

        key = client.client_keys.all()[0]

        job = Job()
        job.collector = collector
        job.key = key
        job.data = {"tag": "#dino"}
        job.save()
        job.run()
