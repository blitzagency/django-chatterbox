import base64
from django.http import HttpResponse
from django.middleware.common import CommonMiddleware
from django.conf import settings

import os

class AuthMiddleware(CommonMiddleware):
    """
Add this to middleware:
'utils.basic_auth_middleware.AuthMiddleware',


Add these settings:
USE_BASIC_AUTH = True # This setting is optionally settable as an env var,  env var will override whatever is set in settings
BASIC_AUTH_USER = 'user'
BASIC_AUTH_PASS = 'password'

"""

    def process_request(self, request):
        if (getattr(settings, 'USE_BASIC_AUTH', False) or os.environ.get('USE_BASIC_AUTH', 'False')=='True') and not os.environ.get('USE_BASIC_AUTH', None)=='False':
            if request.META.get('HTTP_AUTHORIZATION', False):
                authtype, auth = request.META['HTTP_AUTHORIZATION'].split(' ')
                auth = base64.b64decode(auth)
                username, password = auth.split(':')
                if (username == getattr(settings, 'BASIC_AUTH_USER', None) 
                    and password == getattr(settings, 'BASIC_AUTH_PASS', None)):
                    return
            r = HttpResponse("Auth Required", status = 401)
            r['WWW-Authenticate'] = 'Basic realm="bat"'
            return r