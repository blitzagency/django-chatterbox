from django.test import TestCase
from chatterbox.models import(
    Collector
)


class CollectorsTestCase(TestCase):

    def setUp(self):
        pass

    def test_load_driver(self):
        from chatterbox.tests.collectors.demo import DemoCollector
        collector = Collector()
        collector.driver = "chatterbox.tests.collectors.demo.DemoCollector"

        kls = collector.load_driver()

        self.assertTrue(kls == DemoCollector)
