from django.contrib import admin
from .models import (Service, Client, Key, Collector, Job, Activity)
from django.utils.html import format_html
from django.conf.urls import url
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_protect
from django.utils.decorators import method_decorator
from django import forms

csrf_protect_m = method_decorator(csrf_protect)


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
            return format_html(
                "<a href=\"{0}\" target=\"_blank\">{0}</a>",
                Driver.provider_url)

        return "Unknown"

    def docs_url(self, instance):
        Driver = instance.load_driver()

        if Driver:
            return format_html(
                "<a href=\"{0}\" target=\"_blank\">{0}</a>",
                Driver.docs_url)

        return "Unknown"

    provider_url.short_description = "Provider Url"
    provider_url.allow_tags = True

    docs_url.short_description = "Docs Url"
    docs_url.allow_tags = True


@admin.register(Collector)
class CollectorAdmin(admin.ModelAdmin):
    pass


def make_approved(modeladmin, request, queryset):
    queryset.update(is_approved=True)
make_approved.short_description = "Mark selected activities as approved"


def make_not_approved(modeladmin, request, queryset):
    queryset.update(is_approved=False)
make_not_approved.short_description = "Mark selected activities as not approved"


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    readonly_fields = ('job', 'actor_displayName', 'provider_displayName',
                       'actor_id', 'object_type', 'object_id', 'published',
                       'content')
    list_display = ('object_type', 'admin_media', 'actor_displayName',
                    'provider_displayName', 'published', 'content',
                    'is_approved')

    actions = [make_approved, make_not_approved]


class JobForm(forms.ModelForm):
    service_key = forms.CharField()
    collector = forms.IntegerField()
    keys = forms.ModelMultipleChoiceField(queryset=Key.objects.all())

    class Meta:
        model = Job
        exclude = ("data", "history")

    def _post_clean(self):

        cleaned_data = self.cleaned_data
        extra_data = {}

        collector = Collector.objects.filter(
            service__key=cleaned_data['service_key'],
            id=cleaned_data['collector']).first()

        kls = collector.load_driver()

        if kls.form:
            extra_data = self._process_driver_form(
                kls.form, self.data, self.files)

        obj = self.instance
        obj.collector = collector
        obj.data = extra_data

    def _process_driver_form(self, form, data, files):
        f = form(data=data, files=files, prefix="data")
        result = {}

        if f.is_valid():
            result = f.cleaned_data

        return result


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    form = JobForm
    readonly_fields = ("job_id",)
    list_display = ("get_service", "get_collector",
                    "get_service_username", "job_id", "data_json")

    change_form_template = "admin/job_change_form.html"

    def get_service(self, obj):
        return obj.collector.service.label

    def get_collector(self, obj):
        return obj.collector.label

    def get_service_username(self, obj):
        names = obj.keys.all()
        return ', '.join([x.service_username for x in names])

    def save_model(self, request, obj, form, change):
        super(JobAdmin, self).save_model(request, obj, form, change)

        keys = form.cleaned_data['keys']
        obj.keys.add(*keys)

    get_service.short_description = 'Service'
    get_service.admin_order_field = 'service__label'

    get_collector.short_description = 'Collector'
    get_collector.admin_order_field = 'collector__label'

    get_service_username.short_description = 'Service Username(s)'

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
        html = ""

        try:
            obj = Collector.objects.get(pk=id)
        except:
            obj = None

        if obj:
            kls = obj.load_driver()

            if kls:
                collector = kls()
                html = collector.render()

        return JsonResponse({"form": html})

    def get_urls(self):
        info = self.model._meta.app_label, self.model._meta.model_name
        urls = super(JobAdmin, self).get_urls()

        api_urls = [
            url(
                r'^api/services/$',
                self.admin_site.admin_view(self.api_services),
                name='%s_%s_api_services' % info
            ),

            url(
                r'^api/clients/$',
                self.admin_site.admin_view(self.api_clients),
                name='%s_%s_api_clients' % info
            ),

            url(
                r'^api/keys/$',
                self.admin_site.admin_view(self.api_keys),
                name='%s_%s_api_keys' % info
            ),

            url(
                r'^api/collectors/$',
                self.admin_site.admin_view(self.api_collectors),
                name='%s_%s_api_collectors' % info
            ),

            url(
                r'^api/collectors/(?P<id>\d+)/form/$',
                self.admin_site.admin_view(self.api_collectors_form),
                name='%s_%s_api_collectors_form' % info
            ),
        ]

        return api_urls + urls
