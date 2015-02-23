from django.test import TransactionTestCase
from .utils import load_json
import mock
from chatterbox.models import (
    Service, Collector, Job, Activity
)


class CollectorFacebookWallTestCase(TransactionTestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/dump.json')

    def setUp(self):
        service = Service.objects.get(key='facebook')

        collector = Collector()
        collector.driver = "chatterbox.collectors.facebook.FacebookWall"
        collector.service = service
        collector.save()

        client = service.keys.all()[0]

        key = client.client_keys.all()[0]

        job = Job()
        job.collector = collector
        job.data = {"user_id": "11936081183"}
        job.save()
        job.keys.add(key)
        self.job = job

    def test_basic_wall_scrape(self):
        job = self.job
        # mock the request response
        return_value = load_json("facebook-brand-feed-response")
        # job.key.api.user_feed = mock.Mock(return_value=return_value)
        # job.run()

        with mock.patch('chatterbox.api.facebook.Facebook.user_feed') as mock_user_feed:
            mock_user_feed.return_value = return_value
            job.run()
            self.assertEqual(Activity.objects.all().count(), 20)

            # if we run this command at a later time, with same results, we
            # will not get any duplicate or additional Activity items added
            job.run()
            self.assertEqual(Activity.objects.all().count(), 20)
