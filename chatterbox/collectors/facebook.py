from . import Collector
from django import forms


class FacebookUserForm(forms.Form):
    username = forms.CharField(label='Username', max_length=100)


class FacebookWall(Collector):
    form = FacebookUserForm

    def action(self, job):
        pass


class FacebookSearch(Collector):

    def action(self, job):
        pass

