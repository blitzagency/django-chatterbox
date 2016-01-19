from django.test import TestCase
import mock
from .utils import (
    load_json, load_data, mock_request_with_json_response
)

from chatterbox.models import (
    Service, Collector, Job, Activity
)


class CollectortumblrTagTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
        service = Service.objects.get(key='tumblr')

        collector = Collector.objects.get(
            driver="chatterbox.collectors.tumblr.TumblrTagSearch")
        client = service.keys.all()[0]

        key = client.client_keys.all()[0]

        job = Job()
        job.collector = collector
        job.data = {"tag": "dino"}
        job.save()
        job.keys.add(key)
        self.job = job

    def test_basic_tag_search(self):

        job = self.job
        # mock the request response
        return_value = load_json("tumblr-basic-search-response")
        with mock.patch('chatterbox.api.tumblr.Tumblr.tags') as mock_search:
            mock_search.return_value = return_value
            job.run()
            self.assertEqual(Activity.objects.all().count(), 20)


class CollectortumblrPostsTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
        service = Service.objects.get(key='tumblr')

        collector = Collector.objects.get(
            driver="chatterbox.collectors.tumblr.TumblrPostFeed")
        client = service.keys.all()[0]

        key = client.client_keys.all()[0]

        job = Job()
        job.collector = collector
        job.data = {"host_name": "whitemenwearinggoogleglass.tumblr.com"}
        job.save()
        job.keys.add(key)
        self.job = job

    def test_basic_post_feed(self):
        job = self.job
        # mock the request response
        return_value = load_json("tumblr-basic-post-feed")
        with mock.patch('chatterbox.api.tumblr.Tumblr.posts') as mock_search:
            mock_search.return_value = return_value
            job.run()
            self.assertEqual(Activity.objects.all().count(), 20)

    def test_basic_post_feed_with_duplicate(self):
        job = self.job
        # mock the request response
        return_value = load_json("tumblr-basic-post-feed-duplicate")
        with mock.patch('chatterbox.api.tumblr.Tumblr.posts') as mock_search:
            mock_search.return_value = return_value
            job.run()
            self.assertEqual(Activity.objects.all().count(), 20)


    # def test_duplicate_results(self):
    #     job = self.job

    #     # mock the request response
    #     return_value = load_json("tumblr-duplicate-tweets")
    #     with mock.patch('chatterbox.api.tumblr.Tumblr.search') as mock_search:
    #         mock_search.return_value = return_value
    #         job.run()
    #     self.assertEqual(Activity.objects.all().count(), 1)

    # def test_multiple_job_tweets(self):
    #     job1 = self.job

    #     # create 2nd job
    #     job2 = Job()
    #     job2.collector = job1.collector
    #     job2.data = {"tag": "#dino"}
    #     job2.save()
    #     job2.keys.add(job1.keys.all()[0])

    #     # mock the request response
    #     return_value = load_json("tumblr-basic-search-response")
    #     with mock.patch('chatterbox.api.tumblr.Tumblr.search') as mock_search:
    #         mock_search.return_value = return_value
    #         job1.run()
    #         job2.run()

    #     activity = Activity.objects.all()[0]
    #     self.assertEqual(activity.job.all().count(), 2)

    #     self.assertEqual(Activity.objects.all().count(), 2)

    # def test_rate_limited(self):
    #     job1 = self.job

    #     return_value = load_data("tumblr-rate-limit-response")
    #     req = mock_request_with_json_response(return_value)
    #     with mock.patch("requests_oauthlib.OAuth1Session.request", req):
    #         job1.run()

    #     activities = Activity.objects.all().count()
    #     self.assertEqual(activities, 0)
