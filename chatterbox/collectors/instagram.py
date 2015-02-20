import logging
from django import forms
from chatterbox.utils.instagram import activity_from_dict
from . import Collector


log = logging.getLogger(__name__)


def instagram_iterator(api, method, **kwargs):
    results = method(**kwargs)
    messages = results.get('data')
    while 1:
        if len(messages) == 0:
            raise StopIteration

        for message in messages:
            yield message

        next = results.get('pagination', {}).get('next_url')
        if next:
            log.debug("Fetching next page")
            results = api.get(next)
            messages = results.get('data')
        else:
            raise StopIteration


class InstagramUserForm(forms.Form):
    user_id = forms.CharField(label='User ID', max_length=100)


class InstagramSearchForm(forms.Form):
    query = forms.CharField(label='Search Term(s)', max_length=100)


class InstagramWall(Collector):
    activity_from_dict = activity_from_dict

    def action(self, job):
        log.debug("Invoking action")
        job.data = job.data or {}
        user_id = job.data.get('user_id')
        api = job.key.api
        statuses = instagram_iterator(api, api.user_media, user_id=user_id)
        for status in statuses:
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


class InstagramWallFromKey(InstagramWall):
    form = InstagramUserForm


class InstagramSearch(Collector):
    activity_from_dict = activity_from_dict
    form = InstagramSearchForm

    def action(self, job):
        log.debug("Invoking action")
        job.data = job.data or {}
        query = job.data.get('query')
        api = job.key.api
        statuses = instagram_iterator(api, api.search, query=query)
        for status in statuses:
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
