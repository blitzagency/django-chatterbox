import logging
from django import forms
from chatterbox.utils.facebook import activity_from_dict
from . import (Collector, maybe)


log = logging.getLogger(__name__)


class FacebookUserForm(forms.Form):
    user_id = forms.CharField(label='User ID', max_length=100)


class FacebookWall(Collector):
    form = FacebookUserForm
    activity_from_dict = activity_from_dict

    def action(self, job):
        log.debug("Invoking action")

        for status in self.statuses:
            if status.get("story") and not status.get("content", None):
                log.debug("Got unused type %s", status)
                # these are useless things like, 'dino commented on his photo'
                # we don't want this, if you do, override the collector
                continue
            activity = self.create_or_get_activity_from_dict(status)
            try:
                self.register_activity(activity, job)
            except Exception:
                log.debug("Stopping action")
                # need to decide when to stop...
                # at this point this job has already processed this activity
                # before, should we do nothing?  for now we are going to stop
                # all iteration and be done, in the future we might want to
                # keep running the process and run an update action? idk...
                break

    @property
    def statuses(self):
        user_id = self.job.data["user_id"]
        results = maybe(self.fetch_results)(user_id)

        if results is None:
            raise StopIteration

        messages = results.get('data')

        while 1:
            if len(messages) == 0:
                raise StopIteration

            for message in messages:
                yield message

            log.debug("Fetching next page")

            try:
                next_url = results["paging"]["next"]
            except KeyError:
                raise StopIteration

            log.debug("Fetching next page")
            results = maybe(self.fetch_url)(next_url)

            if results is None:
                raise StopIteration

            messages = results.get('data')

    def fetch_results(self, user_id, **kwargs):
        return self.api.user_feed(user_id, **kwargs)

    def fetch_url(self, url, **kwargs):
        return self.api.get(url, **kwargs)
