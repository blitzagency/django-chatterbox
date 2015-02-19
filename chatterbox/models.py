import json
import uuid
import importlib
from django.db import models
from django.conf import settings
from jsonfield import JSONField
from chatterbox.utils.date import string_to_datetime


def make_uuid():
    return str(uuid.uuid4().hex)


def maybe_load_class(path):
    parts = path.split('.')
    module = '.'.join(parts[0:-1])
    kls = parts[-1]

    try:
        return getattr(importlib.import_module(module), kls)
    except:
        # log the import error
        return None


# Twitter, Instagram, Facebook, Youtube, etc
class Service(models.Model):
    label = models.CharField(max_length=200)
    key = models.SlugField(unique=True, max_length=200, db_index=True)
    driver = models.CharField(max_length=200)

    def load_driver(self, path=None):
        path = path or self.driver

        try:
            return self.__driver_class
        except AttributeError:
            self.__driver_class = maybe_load_class(path)
            return self.__driver_class

    def __unicode__(self):
        return self.label


# to get anything from a service, you need this information
# ex: FB always wants key/secret
# (instance of a service)
class Client(models.Model):
    label = models.CharField(max_length=200)
    uuid = models.CharField(max_length=36, unique=True, db_index=True,
                            default=make_uuid, editable=False)
    client_id = models.CharField(max_length=200)
    client_secret = models.CharField(max_length=200)
    redirect_url = models.URLField()

    service = models.ForeignKey('Service', related_name='keys')

    @property
    def driver(self):
        try:
            return self.__driver
        except AttributeError:
            obj = self.service.load_driver()

            self.__driver = obj(
                client_id=self.client_id,
                client_secret=self.client_secret)

            return self.__driver

    @property
    def available_permissions(self):
        driver = self.driver
        return driver.available_permissions

    def __unicode__(self):
        return self.label


class Key(models.Model):
    access_token = models.CharField(max_length=250)

    # Used in OAuth1
    secret = models.CharField(max_length=200, blank=True, null=True)

    expires = models.DateTimeField(blank=True, null=True)
    refresh_token = models.CharField(max_length=200, blank=True, null=True)
    client = models.ForeignKey('Client', related_name='client_keys')
    service = models.ForeignKey('Service', related_name='service_keys')
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             blank=True, null=True,
                             related_name="chatterbox_keys"
                             )

    service_username = models.CharField(max_length=200)
    service_user_id = models.CharField(max_length=200)

    @property
    def api(self):
        try:
            return self.__api
        except AttributeError:
            obj = self.service.load_driver()
            Api = self.load_api_class(obj.api_path)
            self.__api = Api(key=self, client=self.client)
            return self.__api

    def load_api_class(self, path=None):
        path = path or ""

        try:
            return self.__api_class
        except AttributeError:
            self.__api_class = maybe_load_class(path)
            return self.__api_class


class Collector(models.Model):
    label = models.CharField(max_length=200)  # Search Tweets
    service = models.ForeignKey('Service', related_name='collectors')
    driver = models.CharField(max_length=200, unique=True, db_index=True)

    def load_driver(self, path=None):
        path = path or self.driver

        try:
            return self.__driver_class
        except AttributeError:
            self.__driver_class = maybe_load_class(path)
            return self.__driver_class

    def __unicode__(self):
        return self.label


class Job(models.Model):
    job_id = models.CharField(max_length=36, db_index=True,
                              default=make_uuid, editable=False)
    collector = models.ForeignKey('Collector', related_name='collector_actions')
    key = models.ForeignKey('Key', related_name='key_actions')
    data = JSONField()
    history = JSONField()

    @property
    def data_json(self):
        return json.dumps(self.data)

    @property
    def collector_instance(self):
        try:
            return self.__collector
        except AttributeError:
            kls = self.collector.load_driver()

            if kls:
                self.__collector = kls()
            else:
                self.__collector = None

            return self.__collector

    def run(self):
        try:
            self.collector_instance.action(self)
        except AttributeError:
            # loading the collector failed and
            # collector_instance is None
            pass

    def __unicode__(self):
        return self.job_id


TYPE_CHOICES = (
    ('note', 'Note'),
    ('video', 'Video'),
    ('image', 'Image'),
)

PROVIDER_CHOICES = (
    ('facebook', 'Facebook'),
    ('instagram', 'Instagram'),
    ('youtube', 'YouTube'),
    ('twitter', 'Twitter'),
)


class Activity(models.Model):
    published = models.DateTimeField(blank=True, null=True)
    object_type = models.CharField(max_length=250, choices=TYPE_CHOICES)
    content = models.TextField(blank=True, null=True)
    actor_displayName = models.CharField(max_length=250, blank=True, null=True)
    actor_id = models.CharField(max_length=250, blank=True, null=True)
    job = models.ManyToManyField(Job, related_name='job_activity')
    provider_displayName = models.CharField(max_length=250,
                                            choices=PROVIDER_CHOICES)
    blob = JSONField()

    @classmethod
    def from_activity_dict(cls, data):
        activity = cls()
        activity.published = string_to_datetime(data.get('published'))
        activity.object_type = data.get('provider').get('displayName').lower()
        activity.content = data.get('object').get('content')
        activity.actor_displayName = data.get('actor').get('displayName')
        activity.actor_id = data.get('actor').get('@id')
        activity.provider_displayName
        activity.blob = data

        return activity
