import logging
from django import forms
from chatterbox.utils.instagram import activity_from_dict
from . import (Collector, maybe)


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

        results = None

        if query:
            results = maybe(self.fetch_search_results)(query)
        elif user_id:
            results = maybe(self.fetch_user_media)(user_id)
        else:
            results = maybe(self.fetch_user_media)()

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
            results = maybe(self.fetch_url)(next_url)

            if results is None:
                raise StopIteration

            messages = results.get('data')

    def fetch_search_results(self, query, **kwargs):
        return self.api.search(query=query, **kwargs)

    def fetch_user_media(self, *args, **kwargs):
        return self.api.user_media(*args, **kwargs)

    def fetch_url(self, url, **kwargs):
        return self.api.get(url, **kwargs)


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
