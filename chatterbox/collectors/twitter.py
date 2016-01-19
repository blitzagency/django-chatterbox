import logging
from django import forms
from chatterbox.utils.twitter import activity_from_dict
from . import (Collector, maybe)


log = logging.getLogger(__name__)


def format_search_tag(tag):
    log.debug("Invoking format_search_tag: %s", tag)

    if not tag.startswith("#"):
        tag = "#{}".format(tag)
    return tag


class TagForm(forms.Form):
    tag = forms.CharField(label='Tag', max_length=100)


class TwitterTagSearch(Collector):
    form = TagForm
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
        tag = format_search_tag(self.job.data["tag"])

        results = maybe(self.fetch_results)(tag)

        if results is None:
            raise StopIteration

        tweets = results.get('statuses')

        while 1:
            if len(tweets) == 0:
                raise StopIteration

            for tweet in tweets:
                yield tweet

            log.debug("Fetching next page")
            results = maybe(self.fetch_results)(tag, max_id=tweet['id_str'])

            if results is None:
                raise StopIteration

            tweets = results.get('statuses')

    def fetch_results(self, tag, **kwargs):
        return self.api.search(tag, **kwargs)

    def post_save(self, job):
        pass
        # print("GOT HERE")

    def post_delete(self, job):
        pass
        # print("GOT HERE")
