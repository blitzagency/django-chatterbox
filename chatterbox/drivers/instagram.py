from .oauth import OAuth2

class Instagram(OAuth2):
    # General info about the provider
    provider_url = "http://instagram.com"
    docs_url = "http://instagram.com/developer/"

    # URLs to interact with the API
    authorize_url = "https://api.instagram.com/oauth/authorize/"
    access_token_url = "https://api.instagram.com/oauth/access_token"

    available_permissions = [
        (None, "read any and all data related to you"),
        ("comments", "create or delete comments"),
        ("relationships", "follow and unfollow users"),
        ("likes", "like and unlike items"),
    ]

    supports_state = False
