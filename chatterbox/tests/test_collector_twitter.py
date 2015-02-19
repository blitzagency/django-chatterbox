from django.test import TestCase
from django.test import TransactionTestCase
from .utils import load_json
import mock
from chatterbox.models import (
    Service, Collector, Job, Activity
)


class CollectorTwitterSearchTestCase(TransactionTestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
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
        self.job = job

    def test_basic_search(self):

        job = self.job
        # mock the request response
        return_value = load_json("twitter-basic-search-response")
        job.key.api.search = mock.Mock(return_value=return_value)
        job.run()
        self.assertEqual(Activity.objects.all().count(), 2)

    def test_duplicate_results(self):
        job = self.job

        # mock the request response
        return_value = load_json("twitter-duplicate-tweets")
        job.key.api.search = mock.Mock(return_value=return_value)
        job.run()
        self.assertEqual(Activity.objects.all().count(), 1)
