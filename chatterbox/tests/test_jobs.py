from mock import patch
from django.test import TestCase
from chatterbox.models import(
    Service, Collector, Client, Key, Job
)


class JobsTestCase(TestCase):

    def setUp(self):
        pass

    def test_run_job(self):

        service = Service()
        service.driver = "chatterbox.tests.services.demo.DemoService"

        collector = Collector()
        collector.driver = "chatterbox.tests.collectors.demo.DemoCollector"

        collector.service = service

        client = Client()

        key = Key()
        key.service = service
        key.client = client

        job = Job()
        job.collector = collector
        job.key = key

        with patch('chatterbox.tests.collectors.demo.DemoCollector') as MockClass:
            job.run()
            job.collector_instance.action.assert_called_once_with(job)
