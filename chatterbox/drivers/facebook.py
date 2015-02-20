import logging
from six.moves.urllib.parse import parse_qsl
from .oauth import OAuth2
from .oauth import BEARER_URI


log = logging.getLogger(__name__)


class Facebook(OAuth2):

    # General info about the provider
    provider_url = 'https://facebook.com/'
    docs_url = 'https://developers.facebook.com/docs/'
    category = 'Social'
    api_path = 'chatterbox.api.facebook.Facebook'
    refresh_url = None

    # URLs to interact with the API
    authorize_url = 'https://www.facebook.com/dialog/oauth'
    access_token_url = 'https://graph.facebook.com/oauth/access_token'
    api_domain = 'graph.facebook.com'
    bearer_type = BEARER_URI

    available_permissions = [
        (None, 'read your basic, public information'),  # public_profile
        ('email', 'access your email address'),
        ('read_stream', 'access to read the posts your news feed, or your profile'),
        ('user_about_me', 'access your profile information'),
        ('user_checkins', 'access your checkins'),
        ('user_events', 'access your events'),
        ('user_groups', 'access your groups'),
        ('user_likes', 'access the things you like'),
        ('user_location', 'access your location'),
        ('user_photos', 'access your photos'),
        ('user_status', 'access your most recent status'),
    ]

    def parse_token(self, content):
        data = dict(parse_qsl(content))
        data['expires_in'] = data.get('expires', None)
        return data
