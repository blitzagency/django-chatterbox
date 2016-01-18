import logging
from django import forms
from chatterbox.utils.tumblr import activity_from_dict
from . import (Collector, maybe)


log = logging.getLogger(__name__)


class TumblrHostForm(forms.Form):
    host_name = forms.CharField(
        label='Host Name', max_length=100, help_text="dinopetrone.tumblr.com")


class TublrTagForm(forms.Form):
    tag = forms.CharField(label='Tag Query', max_length=100)


class TumblrTagSearch(Collector):
    form = TublrTagForm
    activity_from_dict = activity_from_dict

    def action(self, job):
        log.debug("Invoking action")

        for status in self.statuses:

            activity = self.create_or_get_activity_from_dict(status)

            try:
                self.register_activity(activity, job)
            except Exception:
                log.debug("Stopping action")
                # need to decide when to stop...
                # at this point this job has already processed this activity
                # before, should we do nothing?  for now we are going to stop
                # all iteration and be done
                break

    @property
    def statuses(self):
        tag = self.job.data["tag"]
        results = maybe(self.fetch_results)(tag)

        if results is None:
            raise StopIteration

        posts = results.get('response')
        while 1:
            if len(posts) == 0:
                raise StopIteration

            for post in posts:
                yield post

            log.debug("Fetching next page")
            results = maybe(self.fetch_results)(tag, before=post['timestamp'])

            if results is None:
                raise StopIteration

            posts = results.get('response')

    def fetch_results(self, tag, **kwargs):
        return self.api.tags(tag, **kwargs)

    def post_save(self, job):
        pass
        # print("GOT HERE")

    def post_delete(self, job):
        pass
        # print("GOT HERE")
