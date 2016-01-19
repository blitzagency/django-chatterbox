import logging
from django.core.management.base import BaseCommand
from chatterbox.models import Job


log = logging.getLogger(__name__)


class Command(BaseCommand):
    def handle(self, *args, **options):
        jobs = Job.objects.all()
        for job in jobs:
            log.info("Starting Job: %s", job)
            job.run()
