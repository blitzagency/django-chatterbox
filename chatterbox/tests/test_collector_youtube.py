from django.test import TestCase
from .utils import load_json
import mock
from chatterbox.models import (
    Service, Collector, Job, Activity
)


class CollectorYouTubeWallTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
        pass

    def test_basic_search_scrape(self):
        service = Service.objects.get(key='youtube')

        collector = Collector.objects.get(
            driver="chatterbox.collectors.youtube.YouTubeSearch")

        client = service.keys.all()[0]

        key = client.client_keys.all()[0]

        job = Job()
        job.collector = collector
        job.save()
        job.keys.add(key)

        job.data = {"query": "feet"}
        # mock the request response
        return_value = load_json("youtube-search-response")

        with mock.patch('chatterbox.api.youtube.YouTube.search') as mock_search:
            mock_search.return_value = return_value
            job.run()
            self.assertEqual(Activity.objects.all().count(), 5)
            # if we run this command at a later time, with same results, we
            # will not get any duplicate or additional Activity items added
            job.run()
            self.assertEqual(Activity.objects.all().count(), 5)

    def test_basic_user_scrape(self):
        service = Service.objects.get(key='youtube')

        collector = Collector.objects.get(
            driver="chatterbox.collectors.youtube.YouTubeUser")

        client = service.keys.all()[0]

        key = client.client_keys.all()[0]

        job = Job()
        job.collector = collector
        job.save()
        job.keys.add(key)

        # mock the request response
        return_value = load_json("youtube-user-feed-response")

        with mock.patch('chatterbox.api.youtube.YouTube.user_videos') as mock_user_feed:
            mock_user_feed.return_value = return_value
            job.run()
            self.assertEqual(Activity.objects.all().count(), 5)
