
# DJANGO IMPORTS
from django.conf import settings

# Admin Site Title
SUCCESS_REDIRECT_URL = getattr(settings,
                               "CHATTERBOX_SUCCESS_REDIRECT_URL",
                               '/admin/chatterbox/key/')
