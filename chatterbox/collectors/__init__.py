from django.template.response import SimpleTemplateResponse
from django.db import IntegrityError
from chatterbox.models import Activity


class Collector(object):
    form = None
    template = None
    activity_from_dict = lambda: None

    def action(self, job):
        raise NotImplementedError("Subclasses must implement the \"action\" method")

    def render(self):
        form = None
        template = self.template

        if self.form:
            form = self.form(prefix="data")

        if template and form:
            context = {"form": form}
            view = SimpleTemplateResponse(template, context)
            return view.render()

        elif template is None and form:
            return form.as_table()

        else:
            return ""

    def create_or_get_activity_from_dict(self, data):
        activity = self.activity_from_dict.__func__(data)
        # try and save the object after setting the ID, if there is error
        # it's because the object is not unique
        try:
            activity.save()
        except IntegrityError:
            # it already exists..but is it from another job?
            activity = Activity.objects.get(object_id=activity.object_id)

        return activity

    def register_activity(self, activity, job):
        count = activity.job.filter(id=job.id).count()
        if count:
            raise Exception("Job already associated with activity")

        activity.job.add(job)
