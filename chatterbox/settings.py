
# DJANGO IMPORTS
from django.conf import settings

# Admin Site Title
AUTO_APPROVE = getattr(settings, "CHATTERBOX_AUTO_APPROVE", True)
SUCCESS_REDIRECT_URL = getattr(settings,
                               "CHATTERBOX_SUCCESS_REDIRECT_URL",
                               '/admin/chatterbox/key/')
