# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from datetime import datetime
from django.db import migrations
import pytz


def populate_services(apps):
    Service = apps.get_model('chatterbox', 'Service')

    o1 = Service(
        label="YouTube",
        key="youtube",
        provider_url="http://www.youtube.com",
        docs_url="http://www.youtube.com",
        driver="chatterbox.drivers.youtube.YouTube"
    )

    o2 = Service(
        label="Instagram",
        key="instagram",
        provider_url="http://instagram.com",
        docs_url="http://instagram.com/developer/",
        driver="chatterbox.drivers.instagram.Instagram"
    )

    o3 = Service(
        label="Twitter",
        key="twitter",
        provider_url="https://www.twitter.com/",
        docs_url="https://dev.twitter.com/docs",
        driver="chatterbox.drivers.twitter.Twitter"
    )

    o1.save()
    o2.save()
    o3.save()



def populate(apps, schema_editor):

    from django.apps import apps as dj_apps
    from django.contrib.auth.management import create_permissions
    config = dj_apps.get_app_config('chatterbox')
    create_permissions(config)

    populate_services(apps)


class Migration(migrations.Migration):

    dependencies = [
        ('chatterbox', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(populate),
    ]


#
#
#
#
