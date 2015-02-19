from . import Collector
from django import forms
from chatterbox.utils.twitter import activity_from_dict


def format_search_tag(tag):
    if not tag.startswith("#"):
        tag = "#{}".format(tag)
    return tag


def twitter_iterator(method, search):
    results = method(search)
    tweets = results.get('statuses')
    while 1:
        if len(tweets) == 0:
            raise StopIteration

        for tweet in tweets:
            yield tweet

        results = method(search, max_id=tweet['id_str'])
        tweets = results.get('statuses')


class TagForm(forms.Form):
    tag = forms.CharField(label='Tag', max_length=100)
    nombre = forms.CharField(label='Nombre', max_length=100)


class TwitterTagSearch(Collector):
    form = TagForm
    activity_from_dict = activity_from_dict

    def action(self, job):
        tag = format_search_tag(job.data["tag"])
        api = job.key.api
        statuses = twitter_iterator(api.search, tag)

        for status in statuses:
            activity = self.create_activity_from_dict(status)
            try:
                self.register_activity(activity, job)
            except Exception:
                # need to decide when to stop...
                # at this point this job has already processed this activity
                # before, should we do nothing?  for now we are going to stop
                # all iteration and be done
                break

    def post_save(self, job):
        pass
        # print("GOT HERE")

    def post_delete(self, job):
        pass
        # print("GOT HERE")
