# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.db import migrations


def populate_collectors(apps):
    Service = apps.get_model('chatterbox', 'Service')
    Collector = apps.get_model('chatterbox', 'Collector')

    # Services
    tmblr = Service(label='Tumblr',
                    key='tumblr',
                    driver='chatterbox.drivers.tumblr.Tumblr')
    tmblr.save()

    col = Collector(label='Tublr Tag Search',
                    service=tmblr,
                    driver='chatterbox.collectors.tumblr.TumblrTagSearch')
    col.save()

    col = Collector(label='Tublr Post Feed',
                    service=tmblr,
                    driver='chatterbox.collectors.tumblr.TumblrPostFeed')
    col.save()


def populate(apps, schema_editor):
    populate_collectors(apps)


class Migration(migrations.Migration):

    dependencies = [
        ('chatterbox', '0002_data'),
    ]

    operations = [
        migrations.RunPython(populate),
    ]
