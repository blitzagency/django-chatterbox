from . import Collector
from django import forms
from chatterbox.utils.twitter import parse_to_activity
from chatterbox.models import Activity


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

    def action(self, job):
        tag = format_search_tag(job.data["tag"])
        api = job.key.api
        statuses = twitter_iterator(api.search, tag)
        return
        for status in statuses:
            blob = parse_to_activity(status)
            a = Activity.create_from_activity_json(blob, job)

            # import pdb; pdb.set_trace()

    def post_save(self, job):
        print("GOT HERE")

    def post_delete(self, job):
        print("GOT HERE")
