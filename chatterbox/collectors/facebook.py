import logging
from django import forms
from chatterbox.utils.facebook import activity_from_dict
from chatterbox.exceptions import RateLimitException, KeyInvalidationException
from . import Collector


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
        results = self.maybe_fetch_results(user_id)

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
                next = results["paging"]["next"]
            except KeyError:
                raise StopIteration

            log.debug("Fetching next page")
            results = self.maybe_fetch_url(next)

            if results is None:
                raise StopIteration

            messages = results.get('data')

    def maybe_fetch_results(self, user_id, **kwargs):
        results = None

        try:
            results = self.api.user_feed(user_id)
        except RateLimitException:

            log.error("Aborting scrape due to rate limit: %s", user_id)

            try:
                self.key_manager.invalidate_current_key()
                results = self.api.user_feed(user_id, **kwargs)
            except KeyInvalidationException:
                log.error("Unable to invalidate current key, we are done here")
                results = None

        return results

    def maybe_fetch_url(self, url, **kwargs):
        results = None

        try:
            results = self.api.get(url)
        except RateLimitException:

            log.error("Aborting scrape due to rate limit: %s", url)

            try:
                self.key_manager.invalidate_current_key()
                results = self.api.get(url, **kwargs)
            except KeyInvalidationException:
                log.error("Unable to invalidate current key, we are done here")
                results = None

        return results
