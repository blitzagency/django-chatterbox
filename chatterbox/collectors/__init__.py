import logging
from django.template.response import SimpleTemplateResponse
from django.db import IntegrityError
from chatterbox.models import Activity
from chatterbox.exceptions import (
    RateLimitException, KeyInvalidationException
)


log = logging.getLogger(__name__)


def maybe(func):
    """ Don't use this as a method decorator. Though tempting,
    remember that during method decoration, the class is not created
    yet. `func` will not be bound to anything, and will not have
    `func.im_self` which is important in our use case.
    """
    def action(*args, **kwargs):

        results = None
        instance = func.im_self

        try:
            results = func(*args, **kwargs)
        except RateLimitException:
            log.error("RateLimitException: '%s.%s.%s(*%s, **%s)'",
                      instance.__module__, instance.__class__.__name__,
                      func.im_func.__name__, args, kwargs)
            try:
                instance.key_manager.invalidate_current_key()
                results = func(*args, **kwargs)
            except KeyInvalidationException:
                log.error("KeyInvalidationException: Unable "
                          "to invalidate current key, we are done here")
                results = None

        return results

    return action


def cycle(count):
    current = 0

    while 1:
        yield current
        current = current + 1

        if current >= count:
            current = 0


class KeyManager(object):
    def __init__(self, keys):
        self.keys = keys
        self._cycle = cycle(len(keys))

        self.current_key = keys[0]
        self.current_index = next(self._cycle)

    @property
    def api(self):
        return self.current_key.api

    def invalidate_current_key(self):
        index = next(self._cycle)

        if index == self.current_index:
            log.debug("Unable to invalidate current key. Next key is current key")
            raise KeyInvalidationException

        log.debug("Previous key has been invalidated, switching "
                  "to next available key")

        self.current_key = self.keys[index]
        self.current_index = index


class Collector(object):
    form = None
    template = None
    activity_from_dict = lambda: None

    def __init__(self):
        self.key_manager = None

    @property
    def keys(self):
        try:
            return self.key_manager.keys
        except:
            return []

    @keys.setter
    def keys(self, value):
        self.key_manager = KeyManager(value)

    @property
    def api(self):
        return self.key_manager.api

    def action(self, job):
        raise NotImplementedError("Subclasses must implement the \"action\" method")

    def render(self):
        log.debug("Rendering Collector")
        form = None
        template = self.template

        if self.form:
            log.debug("Initializing Collector Form")
            form = self.form(prefix="data")

        if template and form:
            log.debug("Initializing Collector Template")
            context = {"form": form}
            view = SimpleTemplateResponse(template, context)
            log.debug("Rendering form with template")
            return view.render()

        elif template is None and form:
            log.debug("Rendering form as table")
            return form.as_table()

        else:
            log.debug("No template or form to render")
            return ""

    def create_or_get_activity_from_dict(self, data):
        log.debug("Creating or getting activity from dict: %s", data)
        activity = self.activity_from_dict.__func__(data)
        # try and save the object after setting the ID, if there is error
        # it's because the object is not unique
        if not Activity.objects.filter(object_id=activity.object_id).count():
            activity.save()
        else:
            log.debug("Activity exists, fetching existing")
            activity = Activity.objects.get(object_id=activity.object_id)

        # try:
        #     activity.save()
        # except IntegrityError:
        #     # it already exists..but is it from another job?
        #     log.debug("Activity exists, fetching existing")
        #     activity = Activity.objects.get(object_id=activity.object_id)

        return activity

    def register_activity(self, activity, job):
        log.debug("Registering activity: %s for job: %s", activity, job)
        count = activity.job.filter(id=job.id).count()

        if count:
            log.error("Job: %s already associated with activity: %s", job, activity)
            raise Exception("Job already associated with activity")

        activity.job.add(job)
