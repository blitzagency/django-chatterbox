import logging
from django.template.response import SimpleTemplateResponse
from django.db import IntegrityError
from chatterbox.models import Activity


log = logging.getLogger(__name__)


class Collector(object):
    form = None
    template = None
    activity_from_dict = lambda: None

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
