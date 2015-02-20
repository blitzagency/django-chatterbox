import logging
from django import forms
from chatterbox.utils.facebook import activity_from_dict
from . import Collector


log = logging.getLogger(__name__)


def facebook_iterator(api, method, **kwargs):
    log.debug("Creating Facebook iterator for %s with args: %s",
              method.__name__, kwargs)

    results = method(**kwargs)
    messages = results.get('data')

    while 1:
        if len(messages) == 0:
            raise StopIteration

        for message in messages:
            yield message

        next = results.get('paging', {}).get('next')
        if next:
            log.debug("Fetching next page")
            results = api.get(next)
            messages = results.get('data')
        else:
            raise StopIteration


class FacebookUserForm(forms.Form):
    user_id = forms.CharField(label='User ID', max_length=100)


class FacebookWall(Collector):
    form = FacebookUserForm
    activity_from_dict = activity_from_dict

    def action(self, job):
        log.debug("Invoking action")
        user_id = job.data["user_id"]
        api = job.key.api
        statuses = facebook_iterator(api, api.user_feed, user=user_id)

        for status in statuses:
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
