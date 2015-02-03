from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = "Create a new superuser without prompting the user for input"

    def handle(self, *args, **options):
        user = User(username="admin", email="admin@local.com",
                    is_superuser=True, is_staff=True)
        user.set_password("pass")
        user.save()

        self.stdout.write("Created admin: admin\n")