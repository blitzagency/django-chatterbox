# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.db import migrations


def populate_collectors(apps):
    Service = apps.get_model('chatterbox', 'Service')
    Collector = apps.get_model('chatterbox', 'Collector')

    # Services
    fb = Service(label='Facebook',
                 key='facebook',
                 driver='chatterbox.drivers.facebook.Facebook')
    fb.save()

    ig = Service(label='Instagram',
                 key='instagram',
                 driver='chatterbox.drivers.instagram.Instagram')
    ig.save()

    tw = Service(label='Twitter',
                 key='twitter',
                 driver='chatterbox.drivers.twitter.Twitter')
    tw.save()

    yt = Service(label='YouTube',
                 key='youtube',
                 driver='chatterbox.drivers.youtube.YouTube')
    yt.save()

    # Collectors
    col = Collector(label='Facebook User Wall',
                    service=fb,
                    driver='chatterbox.collectors.facebook.FacebookWall')
    col.save()

    col = Collector(label='Instagram Tag Search',
                    service=ig,
                    driver='chatterbox.collectors.instagram.InstagramSearch')
    col.save()

    col = Collector(label='Instagram User Media',
                    service=ig,
                    driver='chatterbox.collectors.instagram.InstagramWall')
    col.save()

    col = Collector(label='Twitter Tag Search',
                    service=tw,
                    driver='chatterbox.collectors.twitter.TwitterTagSearch')
    col.save()

    col = Collector(label='YouTube Search',
                    service=yt,
                    driver='chatterbox.collectors.youtube.YouTubeSearch')
    col.save()

    col = Collector(label='YouTube User Videos',
                    service=yt,
                    driver='chatterbox.collectors.youtube.YouTubeUser')
    col.save()


def populate(apps, schema_editor):
    populate_collectors(apps)


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0001_initial'),
        ('chatterbox', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(populate),
    ]
