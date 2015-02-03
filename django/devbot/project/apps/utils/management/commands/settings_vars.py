from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = "Prints settings vars values corresponding to passed args"

    def handle(self, *args, **options):
        for arg in args:
            if hasattr(settings, arg):
                self.stdout.write("{}=\"{}\"\n".format(arg, getattr(settings, arg)))