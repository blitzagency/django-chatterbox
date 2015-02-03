import uuid
import importlib
from django.db import models
from django.conf import settings


def make_uuid():
    return str(uuid.uuid4().hex)


# Twitter, Instagram, Facebook, Youtube, etc
class Service(models.Model):
    label = models.CharField(max_length=200)
    key = models.SlugField(unique=True, max_length=200, db_index=True)
    provider_url = models.URLField()
    docs_url = models.URLField()
    driver = models.CharField(max_length=200)

    def load_driver(self):
        parts = self.driver.split('.')

        module = '.'.join(parts[0:-1])
        kls = parts[-1]

        try:
            return getattr(importlib.import_module(module), kls)
        except:
            return None

    def __unicode__(self):
        return self.label


# to get anything from a service, you need this information
# ex: FB always wants key/secret
# (instance of a service)
class Client(models.Model):
    label = models.CharField(max_length=200)
    uuid = models.CharField(max_length=36, db_index=True,
                            default=make_uuid, editable=False
                            )
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
    access_token = models.CharField(max_length=200)
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
            Api = self.load_api(obj.api_path)
            self.__api = Api(key=self, client=self.client)

        return self.__api

    def load_api(self, path):
        parts = path.split('.')

        module = '.'.join(parts[0:-1])
        kls = parts[-1]

        try:
            return getattr(importlib.import_module(module), kls)
        except:
            return None
