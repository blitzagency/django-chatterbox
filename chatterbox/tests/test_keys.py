from django.test import TestCase
from chatterbox.models import(
    Service, Client, Key
)


class KeysTestCase(TestCase):

    def setUp(self):
        pass

    def test_load_api(self):
        from chatterbox.tests.api.demo import DemoApi
        service = Service()
        service.driver = "chatterbox.tests.services.demo.DemoService"

        client = Client()

        key = Key()
        key.service = service
        key.client = client

        api = key.api
        self.assertTrue(api.__class__ == DemoApi)
