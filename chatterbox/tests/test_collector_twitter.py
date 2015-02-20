from django.test import TransactionTestCase
import mock
from .utils import (
    load_json, load_data, mock_request_with_json_response
)

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

    def test_multiple_job_tweets(self):
        job1 = self.job

        # mock the request response
        return_value = load_json("twitter-basic-search-response")
        job1.key.api.search = mock.Mock(return_value=return_value)
        job1.run()

        # create 2nd job
        job2 = Job()
        job2.collector = job1.collector
        job2.key = job1.key
        job2.data = {"tag": "#dino"}
        job2.save()

        return_value = load_json("twitter-basic-search-response")
        job2.key.api.search = mock.Mock(return_value=return_value)
        job2.run()

        activity = Activity.objects.all()[0]
        self.assertEqual(activity.job.all().count(), 2)

        self.assertEqual(Activity.objects.all().count(), 2)

    def test_rate_limited(self):
        job1 = self.job

        # mock the request response
        return_value = load_json("twitter-basic-search-response")
        job1.key.api.search = mock.Mock(return_value=return_value)
        job1.run()

        # create 2nd job
        job2 = Job()
        job2.collector = job1.collector
        job2.key = job1.key
        job2.data = {"tag": "#dino"}
        job2.save()

        return_value = load_json("twitter-basic-search-response")
        job2.key.api.search = mock.Mock(return_value=return_value)
        job2.run()

        activity = Activity.objects.all()[0]
        self.assertEqual(activity.job.all().count(), 2)

        self.assertEqual(Activity.objects.all().count(), 2)
