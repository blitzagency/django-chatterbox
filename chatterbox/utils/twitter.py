import logging
from chatterbox.models import Activity
from .date import twitter_date_to_datetime, datetime_to_string


log = logging.getLogger(__name__)


def activity_from_dict(data):
    log.debug("Converting Twitter dict to Activity Model")
    activity_dict = activity_dict_from_dict(data)
    return Activity.from_activity_dict(activity_dict)


def activity_dict_from_dict(blob):
    log.debug("Converting Twitter dict to activity dict: %s", blob)

    stream_object = {}
    stream_object["@context"] = "http://www.w3.org/ns/activitystreams"
    stream_object["@type"] = "Activity"
    date = twitter_date_to_datetime(blob["created_at"])

    stream_object["published"] = datetime_to_string(date)

    stream_object["provider"] = {
        "@type": "Service",
        "displayName": "Twitter"
    }
    screen_name = blob.get("user").get("screen_name")
    user = blob.get("user")
    stream_object["actor"] = {
        "@type": "Person",
        "@id": "https://www.twitter.com/{}".format(screen_name),
        "displayName": user.get("name"),
        "twitter:contributors_enabled": user.get("contributors_enabled"),
        "twitter:created_at": user.get("created_at"),
        "twitter:default_profile": user.get("default_profile"),
        "twitter:default_profile_image": user.get("default_profile_image"),
        "twitter:description": user.get("description"),
        "twitter:entities": user.get("entities"),
        "twitter:favourites_count": user.get("favourites_count"),
        "twitter:follow_request_sent": user.get("follow_request_sent"),
        "twitter:followers_count": user.get("followers_count"),
        "twitter:following": user.get("following"),
        "twitter:friends_count": user.get("friends_count"),
        "twitter:geo_enabled": user.get("geo_enabled"),
        "twitter:id": user.get("id"),
        "twitter:id_str": user.get("id_str"),
        "twitter:is_translation_enabled": user.get("is_translation_enabled"),
        "twitter:is_translator": user.get("is_translator"),
        "twitter:lang": user.get("lang"),
        "twitter:listed_count": user.get("listed_count"),
        "twitter:location": user.get("location"),
        "twitter:notifications": user.get("notifications"),
        "twitter:profile_background_color": user.get("profile_background_color"),
        "twitter:profile_background_image_url": user.get("profile_background_image_url"),
        "twitter:profile_background_image_url_https": user.get("profile_background_image_url_https"),
        "twitter:profile_background_tile": user.get("profile_background_tile"),
        "twitter:profile_banner_url": user.get("profile_banner_url"),
        "twitter:profile_image_url": user.get("profile_image_url"),
        "twitter:profile_image_url_https": user.get("profile_image_url_https"),
        "twitter:profile_link_color": user.get("profile_link_color"),
        "twitter:profile_location": user.get("profile_location"),
        "twitter:profile_sidebar_border_color": user.get("profile_sidebar_border_color"),
        "twitter:profile_sidebar_fill_color": user.get("profile_sidebar_fill_color"),
        "twitter:profile_text_color": user.get("profile_text_color"),
        "twitter:profile_use_background_image": user.get("profile_use_background_image"),
        "twitter:protected": user.get("protected"),
        "twitter:screen_name": user.get("screen_name"),
        "twitter:statuses_count": user.get("statuses_count"),
        "twitter:time_zone": user.get("time_zone"),
        "twitter:url": user.get("url"),
        "twitter:utc_offset": user.get("utc_offset"),
        "twitter:verified": user.get("verified"),
        "image": {
            "@type": "Link",
            "href": blob.get("user").get("profile_image_url"),
            "mediaType": "image/jpeg",
        },

    }

    stream_object["object"] = {
        "@id": "https://twitter.com/{}/status/{}".format(screen_name, blob.get("id")),
        "@type": "Note",
        "content": blob.get("text"),
        "twitter:entities": blob.get("entities"),
        "twitter:extended_entities": blob.get("extended_entities"),
        "twitter:contributors": blob.get("contributors"),
        "twitter:coordinates": blob.get("coordinates"),
        "twitter:favorite_count": blob.get("favorite_count"),
        "twitter:favorited": blob.get("favorited"),
        "twitter:geo": blob.get("geo"),
        "twitter:id": blob.get("id"),
        "twitter:id_str": blob.get("id_str"),
        "twitter:in_reply_to_screen_name": blob.get("in_reply_to_screen_name"),
        "twitter:in_reply_to_status_id": blob.get("in_reply_to_status_id"),
        "twitter:in_reply_to_status_id_str": blob.get("in_reply_to_status_id_str"),
        "twitter:in_reply_to_user_id": blob.get("in_reply_to_user_id"),
        "twitter:in_reply_to_user_id_str": blob.get("in_reply_to_user_id_str"),
        "twitter:lang": blob.get("lang"),
        "twitter:place": blob.get("place"),
        "twitter:possibly_sensitive": blob.get("possibly_sensitive"),
        "twitter:retweet_count": blob.get("retweet_count"),
        "twitter:retweeted": blob.get("retweeted"),
        "twitter:source": blob.get("source"),
        "twitter:text": blob.get("text"),
        "twitter:truncated": blob.get("truncated"),
    }
    return stream_object
