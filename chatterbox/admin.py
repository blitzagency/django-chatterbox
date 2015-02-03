from django.contrib import admin
from .models import (Service, Client, Key)


@admin.register(Client)
class ClientAdmin(admin.ModelAdmin):
    change_form_template = "admin/client_change_form.html"


@admin.register(Key)
class KeyAdmin(admin.ModelAdmin):
    list_display = ('get_service', 'get_client', 'user')

    def get_service(self, obj):
        return obj.service.label

    def get_client(self, obj):
        return obj.client.label


    get_service.short_description = 'Service'
    get_service.admin_order_field = 'service__label'

    get_client.short_description = 'Client'
    get_client.admin_order_field = 'client__label'


admin.site.register(Service)

