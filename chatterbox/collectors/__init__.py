from django.template.response import SimpleTemplateResponse


class Collector(object):
    form = None
    template = None

    def action(self, job):
        raise NotImplementedError("Subclasses must implement the \"action\" method")

    def render(self):
        form = None
        template = self.template

        if self.form:
            form = self.form()

        if template and form:
            context = {"form": form}
            view = SimpleTemplateResponse(template, context)
            return view.render()

        elif template is None and form:
            return form.as_table()

        else:
            return ""