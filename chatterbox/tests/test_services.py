from django.test import TestCase
from chatterbox.models import(
    Service
)


class ServicesTestCase(TestCase):

    def setUp(self):
        pass

    def test_load_driver(self):
        from chatterbox.tests.services.demo import DemoService
        service = Service()
        service.driver = "chatterbox.tests.services.demo.DemoService"

        kls = service.load_driver()

        self.assertTrue(kls == DemoService)
