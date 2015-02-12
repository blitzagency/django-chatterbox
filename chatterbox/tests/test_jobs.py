from django.test import TestCase
from chatterbox.models import(
    Service, Collector, Key, Job
)


class JobsTestCase(TestCase):

    def setUp(self):
        pass

    def test_run_job(self):

        service = Service()
        service.driver = "chatterbox.tests.drivers.demo.DemoService"

        collector = Collector()
        collector.driver = "chatterbox.tests.collectors.demo.DemoCollector"

        collector.service = service

        job = Job()
        job.collector = collector

