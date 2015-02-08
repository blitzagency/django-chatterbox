from django.apps import AppConfig


class ChatterboxConfig(AppConfig):
    name = "chatterbox"
    verbose_name = "Chatterbox"

    def ready(self):
        from chatterbox.signals import jobs
