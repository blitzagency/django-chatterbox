import logging
from django import forms
from chatterbox.utils.instagram import activity_from_dict
from chatterbox.exceptions import RateLimitException, KeyInvalidationException
from . import Collector


log = logging.getLogger(__name__)


class InstagramCollector(Collector):

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
                # all iteration and be done, in the future we might want to
                # keep running the process and run an update action? idk...
                break

    @property
    def statuses(self):

        # self.job.data could be '' , or {user_id='foo'} or {query='foo'}
        # so i'm normalizing it here
        self.job.data = self.job.data or {}
        user_id = self.job.data.get("user_id")
        query = self.job.data.get("query")

        results = self.maybe_fetch_results(user_id=user_id, query=query)

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
                next_url = results["pagination"]["next_url"]
            except KeyError:
                raise StopIteration

            log.debug("Fetching next page")
            results = self.maybe_fetch_results(next=next_url)

            if results is None:
                raise StopIteration

            messages = results.get('data')

    def maybe_fetch_results(self, user_id=None, query=None, next=None, **kwargs):
        method = None
        args = []
        if query:
            method = self.api.search
            kwargs['query'] = query

        elif user_id:
            method = self.api.user_media
            kwargs['user_id'] = user_id

        elif next:
            method = self.api.get
            args.append(next)
        else:
            method = self.api.user_media

        results = None
        try:
            results = method(*args, **kwargs)
        except RateLimitException:

            log.error("Aborting scrape due to rate limit: %s", user_id)

            try:
                self.key_manager.invalidate_current_key()
                # results = self.api.search(user_id, **kwargs)
                results = method(**kwargs)
            except KeyInvalidationException:
                log.error("Unable to invalidate current key, we are done here")
                results = None

        return results


# Wall Collector (this doesn't need a form because it uses the key)
class InstagramWall(InstagramCollector):
    activity_from_dict = activity_from_dict


# Wall Collector + Form
class InstagramUserForm(forms.Form):
    user_id = forms.CharField(label='User ID', max_length=100)


class InstagramWallFromKey(InstagramWall):
    form = InstagramUserForm


# Search Collector + Form
class InstagramSearchForm(forms.Form):
    query = forms.CharField(label='Search Term(s)', max_length=100)


class InstagramSearch(InstagramCollector):
    activity_from_dict = activity_from_dict
    form = InstagramSearchForm
