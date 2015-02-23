import logging
from django.template.response import SimpleTemplateResponse
from django.db import IntegrityError
from chatterbox.models import Activity
from chatterbox.exceptions import KeyInvalidationException


log = logging.getLogger(__name__)


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

        try:
            self.current_key = keys[0]
            self.current_index = next(self._cycle)
        except IndexError:
            self.current_key = None
            self.current_index = -1

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
        self.keys = []
        self.key_manager = None

    @property
    def keys(self):
        return self.key_manager.keys

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
        try:
            activity.save()
        except IntegrityError:
            # it already exists..but is it from another job?
            log.debug("Activity exists, fetching existing")
            activity = Activity.objects.get(object_id=activity.object_id)

        return activity

    def register_activity(self, activity, job):
        log.debug("Registering activity: %s for job: %s", activity, job)
        count = activity.job.filter(id=job.id).count()

        if count:
            log.error("Job: %s already associated with activity: %s", job, activity)
            raise Exception("Job already associated with activity")

        activity.job.add(job)
