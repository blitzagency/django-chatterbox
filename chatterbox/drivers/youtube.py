import logging
from .oauth import OAuth2

log = logging.getLogger(__name__)


class YouTube(OAuth2):
    authorize_url = "https://accounts.google.com/o/oauth2/auth"
    access_token_url = "https://accounts.google.com/o/oauth2/token"
    refresh_url = "https://www.googleapis.com/oauth2/v3/token"
    provider_url = "http://www.youtube.com"
    docs_url = "http://www.youtube.com"
    api_path = 'chatterbox.api.youtube.YouTube'

    available_permissions = [
        ('https://www.googleapis.com/auth/userinfo.profile', 'Read your basic profile information'),
        ("https://www.googleapis.com/auth/youtube", "Manage your YouTube account"),
        ("https://www.googleapis.com/auth/youtube.readonly", "View your YouTube account"),
        ("https://www.googleapis.com/auth/youtube.upload", "Manage your YouTube videos"),
        ("https://www.googleapis.com/auth/youtubepartner", "View and manage your assets and associated content on YouTube"),
        ("https://www.googleapis.com/auth/youtubepartner-channel-audit", "View private information of your YouTube channel relevant during the audit process with a YouTube partner"),
    ]

    def get_authorize_params(self, redirect_url, scopes):
        params = super(YouTube, self).get_authorize_params(redirect_url, scopes)
        params['access_type'] = 'offline'
        params['approval_prompt'] = 'force'
        return params
