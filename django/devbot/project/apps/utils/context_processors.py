from django.conf import settings


def global_variables(request):
    return {
        #'include_base_url': settings.STATIC_URL.startswith('http'),
    }