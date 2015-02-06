from . import Collector
from django import forms


class TagForm(forms.Form):
    tag = forms.CharField(label='Tag', max_length=100)


class TwitterTagSearch(Collector):
    form = TagForm

    def action(self, job):
        pass

