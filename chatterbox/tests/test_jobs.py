from mock import patch
from django.test import TestCase
from chatterbox.models import(
    Collector, Key, Job
)


class JobsTestCase(TestCase):
    fixtures = ('project/apps/chatterbox/fixtures/users.json',
                'project/apps/chatterbox/fixtures/demo.json')

    def setUp(self):
        pass

    def test_run_job(self):

        with patch('chatterbox.tests.collectors.demo.DemoCollector') as MockClass:
            collector = Collector.objects.get(pk=1)
            key = Key.objects.get(pk=1)

            job = Job.objects.create(
                collector=collector,
                data={},
                history={}
            )

            job.keys.add(key)

            job.run()
            job.collector_instance.action.assert_called_once_with(job)
