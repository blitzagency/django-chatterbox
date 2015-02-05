from django.template.response import SimpleTemplateResponse
from django import forms


class Collector(object):
    form = None
    template = None

    def action(self, job):
        raise NotImplementedError("Subclasses must implement the \"action\" method")

    def render(self):
        form = None
        template = self.template

        if self.form:
            form = self.Form()

        if template and form:
            context = {"form": form}
            view = SimpleTemplateResponse(template, context)
            return view.render()

        elif template is None and form:
            return str(form)

        else:
            return ""



"""
twitter tag search
instagram tag search
facebook wall
"""

class TagForm(forms.Form):
    tag = forms.CharField(label='Tag', max_length=100)


class TwitterTagSearch(Collector):
    form = TagForm

    def action(self, job):
        pass

