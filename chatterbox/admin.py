from django.contrib import admin
from .models import (Service, Client, Key)
from django.utils.html import format_html
from django.utils.safestring import mark_safe


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
            return format_html("!!!!<a href=\"{0}\">{0}</a>", Driver.provider_url)

        return "Unknown"

    def docs_url(self, instance):
        Driver = instance.load_driver()

        if Driver:
            return format_html("<a href=\"{0}\">{0}</a>", Driver.docs_url)

        return "Unknown"

    provider_url.short_description = "Provider Url"
    provider_url.allow_tags = True

    docs_url.short_description = "Docs Url"
    docs_url.allow_tags = True

