import json
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from chatterbox.models import Job


@receiver(post_save, sender=Job)
def job_post_save(sender, **kwargs):
    obj = kwargs["instance"]
    kls = obj.collector.load_driver()
    action = kls()

    hook = getattr(action, "post_save", None)

    if hook:
        hook(obj)


@receiver(post_delete, sender=Job)
def job_post_delete(sender, **kwargs):
    obj = kwargs["instance"]
    kls = obj.collector.load_driver()
    action = kls()

    hook = getattr(action, "post_delete", None)

    if hook:
        hook(obj)


