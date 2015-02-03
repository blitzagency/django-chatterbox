from django.test import TestCase
from django.core.cache import cache

class CacheTest(TestCase):
    def test_cache(self):
        cache.set('test_cache', 42)
        self.assertEqual(cache.get('test_cache'), 42)
