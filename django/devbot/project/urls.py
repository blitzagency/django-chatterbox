from django.conf import settings
from django.conf.urls import include, patterns, url
from django.contrib import admin
from django.views.generic import TemplateView

admin.autodiscover()

urlpatterns = patterns(
    '',
    (r'^grappelli/', include('grappelli.urls')),
    (r'^chatterbox/', include('chatterbox.urls', namespace="chatterbox")),
    (r'^admin/', include(admin.site.urls)),

    # Homepage
    (r'^$', TemplateView.as_view(template_name='index.html')),
)

#used to show static assets out of the collected-static
if getattr(settings, 'SERVE_STATIC', False) and settings.SERVE_STATIC:
    urlpatterns += patterns(
        '',
        url(r'^static/(?P<path>.*)$',
            'django.views.static.serve',
            {'document_root': settings.STATIC_ROOT, 'show_indexes': False}),
        url(r'^uploads/(?P<path>.*)$',
            'django.views.static.serve',
            {'document_root': settings.MEDIA_ROOT, 'show_indexes': False}),
    )
