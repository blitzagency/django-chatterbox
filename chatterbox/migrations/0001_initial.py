# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import jsonfield.fields
import chatterbox.models
from django.conf import settings


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Activity',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('published', models.DateTimeField(null=True, blank=True)),
                ('object_type', models.CharField(max_length=250, choices=[(b'note', b'Note'), (b'video', b'Video'), (b'image', b'Image')])),
                ('content', models.TextField(null=True, blank=True)),
                ('actor_displayName', models.CharField(max_length=250, null=True, blank=True)),
                ('actor_id', models.CharField(max_length=250, null=True, blank=True)),
                ('provider_displayName', models.CharField(max_length=250, choices=[(b'facebook', b'Facebook'), (b'instagram', b'Instagram'), (b'youtube', b'YouTube'), (b'twitter', b'Twitter')])),
                ('blob', jsonfield.fields.JSONField(default=dict)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Client',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('label', models.CharField(max_length=200)),
                ('uuid', models.CharField(default=chatterbox.models.make_uuid, unique=True, max_length=36, editable=False, db_index=True)),
                ('client_id', models.CharField(max_length=200)),
                ('client_secret', models.CharField(max_length=200)),
                ('redirect_url', models.URLField()),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Collector',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('label', models.CharField(max_length=200)),
                ('driver', models.CharField(unique=True, max_length=200, db_index=True)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Job',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('job_id', models.CharField(default=chatterbox.models.make_uuid, max_length=36, editable=False, db_index=True)),
                ('data', models.CharField(max_length=250, null=True, blank=True)),
                ('collector', models.ForeignKey(related_name='collector_actions', to='chatterbox.Collector')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Key',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('access_token', models.CharField(max_length=250)),
                ('secret', models.CharField(max_length=200, null=True, blank=True)),
                ('expires', models.DateTimeField(null=True, blank=True)),
                ('refresh_token', models.CharField(max_length=200, null=True, blank=True)),
                ('service_username', models.CharField(max_length=200)),
                ('service_user_id', models.CharField(max_length=200)),
                ('client', models.ForeignKey(related_name='client_keys', to='chatterbox.Client')),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.CreateModel(
            name='Service',
            fields=[
                ('id', models.AutoField(verbose_name='ID', serialize=False, auto_created=True, primary_key=True)),
                ('label', models.CharField(max_length=200)),
                ('key', models.SlugField(unique=True, max_length=200)),
                ('driver', models.CharField(max_length=200)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
        migrations.AddField(
            model_name='key',
            name='service',
            field=models.ForeignKey(related_name='service_keys', to='chatterbox.Service'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='key',
            name='user',
            field=models.ForeignKey(related_name='chatterbox_keys', blank=True, to=settings.AUTH_USER_MODEL, null=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='job',
            name='key',
            field=models.ForeignKey(related_name='key_actions', to='chatterbox.Key'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='collector',
            name='service',
            field=models.ForeignKey(related_name='collectors', to='chatterbox.Service'),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='client',
            name='service',
            field=models.ForeignKey(related_name='keys', to='chatterbox.Service'),
            preserve_default=True,
        ),
    ]
