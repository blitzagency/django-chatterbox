import json
from django.db import models
from django.contrib import admin
from .models import (Service, Client, Key, Collector, Job, Activity)
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from django.conf.urls import url
from django.http import JsonResponse
from django.core import serializers
from django.shortcuts import get_object_or_404
from .models import (Service, Client, Key, Collector, Job)




@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    change_form_template = "admin/client_change_form.html"


@admin.register(Key)
class KeyAdmin(admin.ModelAdmin):
    list_display = ('get_service', 'get_client', 'user',
                    'get_service_username', 'get_service_user_id')

    def get_service(self, obj):
        return obj.service.label

    def get_client(self, obj):
        return obj.client.label

    def get_service_username(self, obj):
        return obj.service_username

    def get_service_user_id(self, obj):
        return obj.service_user_id

    get_service.short_description = 'Service'
    get_service.admin_order_field = 'service__label'

    get_client.short_description = 'Client'
    get_client.admin_order_field = 'client__label'

    get_service_username.short_description = 'Service User'
    get_service_username.admin_order_field = 'service_username'

    get_service_user_id.short_description = 'Service User ID'
    get_service_user_id.admin_order_field = 'service_user_id'


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    readonly_fields = ("provider_url", "docs_url")

    def provider_url(self, instance):
        Driver = instance.load_driver()

        if Driver:
            return format_html("<a href=\"{0}\" target=\"_blank\">{0}</a>", Driver.provider_url)

        return "Unknown"

    def docs_url(self, instance):
        Driver = instance.load_driver()

        if Driver:
            return format_html("<a href=\"{0}\" target=\"_blank\">{0}</a>", Driver.docs_url)

        return "Unknown"

    provider_url.short_description = "Provider Url"
    provider_url.allow_tags = True

    docs_url.short_description = "Docs Url"
    docs_url.allow_tags = True


@admin.register(Collector)
class CollectorAdmin(admin.ModelAdmin):
    pass

@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    pass


from django.template import RequestContext
from django.shortcuts import render_to_response
from functools import update_wrapper


# def admin_job_change_view(request, model_admin):

#     template_response =
#     opts = model_admin.model._meta
#     admin_site = model_admin.admin_site
#     has_perm = request.user.has_perm(opts.app_label + '.' \
#                                      + opts.get_change_permission())
#     context = {
#         'admin_site': admin_site.name,
#         'title': "My Custom View",
#         'opts': opts,
#         'app_label': opts.app_label,
#         'has_change_permission': has_perm
#     }

#     template = 'admin/job_change_form.html'

#     return render_to_response(template, context,
#                               context_instance=RequestContext(request))



@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    readonly_fields = ("job_id",)
    change_form_template = "admin/job_change_form.html"

    # def __data(self):
    #     context = {
    #         "services": Service.objects.order_by("-label").all(),
    #         "clients": Client.objects.select_related("service").all(),
    #         "keys": Key.objects.select_related("service").all()
    #     }

    #     return context

    # def add_view(self, request, form_url='', extra_context=None):
    #     response = self.changeform_view(request, None, form_url, extra_context)
    #     response.context_data.update(self.__data())
    #     return response

    # def change_view(self, request, object_id, form_url='', extra_context=None):
    #     response = self.changeform_view(request, object_id, form_url, extra_context)
    #     response.context_data.update(self.__data())
    #     return response

    def api_services(self, request):
        data = []
        for each in Service.objects.order_by("label").all():
            data.append({"id": each.id, "label": each.label, "key": each.key})

        return JsonResponse(data, safe=False)

    def api_clients(self, request):
        data = []
        service = request.GET.get('service', None)
        collection = []

        if service:
            collection = Client.objects.select_related("service")\
                .filter(service__key=service) \
                .order_by("label")
        else:
            collection = Client.objects.select_related("service")\
                .order_by("label")

        for each in collection:
            data.append({"id": each.id, "label": each.label})

        return JsonResponse(data, safe=False)

    def api_keys(self, request):
        data = []
        collection = []
        service = request.GET.get('service', None)

        if service:
            collection = Key.objects.select_related("service")\
                .filter(service__key=service) \
                .order_by("service_username")
        else:
            collection = Key.objects.select_related("service")\
                .order_by("service_username")

        for each in collection:
            data.append({"id": each.id, "username": each.service_username})

        return JsonResponse(data, safe=False)

    def api_collectors(self, request):
        data = []
        collection = []
        service = request.GET.get('service', None)

        if service:
            collection = Collector.objects.select_related("service")\
                .filter(service__key=service) \
                .order_by("label")
        else:
            collection = Collector.objects.select_related("service")\
                .order_by("label")

        for each in collection:
            data.append({"id": each.id, "label": each.label})

        return JsonResponse(data, safe=False)

    def api_collectors_form(self, request, id):

        obj = get_object_or_404(Collector, pk=id)

        kls = obj.load_action()
        collector = kls()
        return JsonResponse({"html": collector.render()})

    def get_urls(self):
        info = self.model._meta.app_label, self.model._meta.model_name
        urls = super(JobAdmin, self).get_urls()

        api_urls = [
            url(r'^api/services/$', self.admin_site.admin_view(self.api_services), name='%s_%s_api_services' % info),
            url(r'^api/clients/$', self.admin_site.admin_view(self.api_clients), name='%s_%s_api_clients' % info),
            url(r'^api/keys/$', self.admin_site.admin_view(self.api_keys), name='%s_%s_api_keys' % info),
            url(r'^api/collectors/$', self.admin_site.admin_view(self.api_collectors), name='%s_%s_api_collectors' % info),
            url(r'^api/collectors/(?P<id>\d+)/form/$', self.admin_site.admin_view(self.api_collectors_form), name='%s_%s_api_collectors_form' % info),
        ]

        return api_urls + urls
