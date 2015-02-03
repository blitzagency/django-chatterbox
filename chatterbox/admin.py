from django.contrib import admin
from .models import (Service, Client, Key)


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


admin.site.register(Service)

