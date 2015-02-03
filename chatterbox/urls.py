from django.conf.urls import patterns, include, url
from chatterbox.views.callback import callback
from chatterbox.views.auth import authorize

urlpatterns = patterns('',
    url(r"^callback/$", callback, name="callback"),
    url(r"^authorize/(?P<uuid>[a-fA-F0-9\-]{32,36})/$", authorize, name="authorize"),
)
