from django.test import TestCase
from .models import Service


class ApiTestCase(TestCase):

    def setUp(self):
        self._yt = Service.objects.get(label='YouTube')

        pass

    def test_animals_can_speak(self):
        print('hi')
