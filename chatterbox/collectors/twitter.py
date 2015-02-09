from . import Collector
from django import forms


class TagForm(forms.Form):
    tag = forms.CharField(label='Tag', max_length=100)
    nombre = forms.CharField(label='Nombre', max_length=100)


class TwitterTagSearch(Collector):
    form = TagForm

    def action(self, job):
        pass

    def post_save(self, job):
        print("GOT HERE")

    def post_delete(self, job):
        print("GOT HERE")


