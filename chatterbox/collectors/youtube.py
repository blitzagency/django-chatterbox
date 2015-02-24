import logging
from django import forms
from chatterbox.utils.youtube import activity_from_dict
from . import (Collector, maybe)


log = logging.getLogger(__name__)


class YouTubeSearchForm(forms.Form):
    query = forms.CharField(label='Search Query', max_length=100)


class YouTubeCollector(Collector):
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
                # all iteration and be done, in the future we might want to
                # keep running the process and run an update action? idk...
                break

    @property
    def statuses(self):
        pass

    def fetch_search_results(self, query, **kwargs):
        return self.api.search(query, **kwargs)

    def fetch_user_videos_results(self, **kwargs):
        return self.api.user_videos(**kwargs)


class YouTubeSearch(YouTubeCollector):
    form = YouTubeSearchForm

    @property
    def statuses(self):
        self.job.data = self.job.data or {}
        query = self.job.data.get('query')
        results = maybe(self.fetch_search_results)(query)
        if results is None:
            raise StopIteration

        messages = results.get('items')

        while 1:
            if len(messages) == 0:
                raise StopIteration

            for message in messages:
                yield message

            log.debug("Fetching next page")

            try:
                page_token = results["nextPageToken"]
            except KeyError:
                raise StopIteration

            if not page_token:
                raise StopIteration

            log.debug("Fetching next page")
            results = maybe(self.fetch_search_results)(query, pageToken=page_token)

            if results is None:
                raise StopIteration

            messages = results.get('items')


class YouTubeUser(YouTubeCollector):

    @property
    def statuses(self):
        results = maybe(self.fetch_user_videos_results)()

        if results is None:
            raise StopIteration

        messages = results.get('items')

        while 1:
            if len(messages) == 0:
                raise StopIteration

            for message in messages:
                yield message

            log.debug("Fetching next page")

            try:
                page_token = results["nextPageToken"]
            except KeyError:
                raise StopIteration

            if not page_token:
                raise StopIteration

            log.debug("Fetching next page")
            results = maybe(self.fetch_user_videos_results)(pageToken=page_token)

            if results is None:
                raise StopIteration

            messages = results.get('items')
