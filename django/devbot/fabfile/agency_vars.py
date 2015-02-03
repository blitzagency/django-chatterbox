import functools
from json import load
from fabric.colors import red, yellow
from fabric.api import abort, local

from fabric.context_managers import shell_env


import os

import logging
logging.basicConfig()
log = logging.getLogger(__name__)

# Load/parse app_info.json
try:
    APP_INFO = load(open("app_info.json"))
except:
    print red("Failed to load app_info.json")
    abort()

# suppress tasks
__all__ = []


def parse_vars(string):
    """Parse a list of var/values separated by \\n"""
    d = {}
    for line in string.split('\n'):
        if '=' not in line:
            continue
        name, value = line.strip().split('=')
        value = value.strip('"')
        d[name] = value
    return d


def get_agency_vars():
    """parse environment vars for variables starting with AGENCY"""
    agency_vars = {}
    for k in os.environ:
        if k.startswith('AGENCY'):
            agency_vars[k] = os.environ[k]
    return agency_vars

AGENCY_VARS = get_agency_vars()


def get_static_url(d):
    """grab STATIC_URL from django settings"""
    with shell_env(**d):
        static_url = local('python -c \'import os; from django.conf import settings; os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings.local"); print settings.STATIC_URL\'',
                                    capture=True)
        # settings = parse_vars(static)
        # if 'STATIC_URL' not in settings:
        #     log.error('STATIC_URL lookup failed!!!')
        #     abort("STATIC_URL lookup failed!!!")
        return static_url


def with_vars(f):
    """Decorator adds AGENCY_VARS to environment variables, if an env argument
    is passed the corresponding values from app_info.json will also be added
    to the env vars"""

    @functools.wraps(f)
    def wrapper(*args, **kwargs):
        d = {}
        d.update(AGENCY_VARS)

        if 'asset_version' in kwargs:
            d['ASSET_VERSION'] = kwargs['asset_version']

        if 'env' in kwargs:
            d.update(APP_INFO[kwargs['env']])
            d['STATIC_URL'] = get_static_url(d)

        print yellow('using vars: {}'.format(d))

        for environment_var in d:
            os.environ[environment_var] = d[environment_var]

        kwargs['agency_vars'] = d
        return f(*args, **kwargs)
    return wrapper