from django.test import TestCase
import mock
from .utils import (
    load_json, load_data, mock_request_with_json_response
)

from chatterbox.models import (
    Service, Collector, Job, Activity
)


class CollectorTwitterSearchTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
        service = Service.objects.get(key='twitter')

        collector = Collector.objects.get(
            driver="chatterbox.collectors.twitter.TwitterTagSearch")
        client = service.keys.all()[0]

        key = client.client_keys.all()[0]

        job = Job()
        job.collector = collector
        job.data = {"tag": "#dino"}
        job.save()
        job.keys.add(key)
        self.job = job

    def test_basic_search(self):

        job = self.job
        # mock the request response
        return_value = load_json("twitter-basic-search-response")
        with mock.patch('chatterbox.api.twitter.Twitter.search') as mock_search:
            mock_search.return_value = return_value
            job.run()
            # self.assertEqual(Activity.objects.all().count(), 2)

    def test_duplicate_results(self):
        job = self.job

        # mock the request response
        return_value = load_json("twitter-duplicate-tweets")
        with mock.patch('chatterbox.api.twitter.Twitter.search') as mock_search:
            mock_search.return_value = return_value
            job.run()
        self.assertEqual(Activity.objects.all().count(), 1)

    def test_multiple_job_tweets(self):
        job1 = self.job

        # create 2nd job
        job2 = Job()
        job2.collector = job1.collector
        job2.data = {"tag": "#dino"}
        job2.save()
        job2.keys.add(job1.keys.all()[0])

        # mock the request response
        return_value = load_json("twitter-basic-search-response")
        with mock.patch('chatterbox.api.twitter.Twitter.search') as mock_search:
            mock_search.return_value = return_value
            job1.run()
            job2.run()

        activity = Activity.objects.all()[0]
        self.assertEqual(activity.job.all().count(), 2)

        self.assertEqual(Activity.objects.all().count(), 2)

    def test_rate_limited(self):
        job1 = self.job

        return_value = load_data("twitter-rate-limit-response")
        req = mock_request_with_json_response(return_value)
        with mock.patch("requests_oauthlib.OAuth1Session.request", req):
            job1.run()

        activities = Activity.objects.all().count()
        self.assertEqual(activities, 0)
