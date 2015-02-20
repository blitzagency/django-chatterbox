import logging
from ..models import Activity
from .date import activity_stream_date_to_datetime, datetime_to_string


log = logging.getLogger(__name__)


def activity_from_dict(data):
    log.debug("Converting YouTube dict to Activity Model")
    activity_dict = activity_dict_from_dict(data)
    return Activity.from_activity_dict(activity_dict)


def activity_dict_from_dict(blob):
    log.debug("Converting YouTube dict to activity dict: %s", blob)

    stream_object = {}
    stream_object["@context"] = "http://www.w3.org/ns/activitystreams"
    stream_object["@type"] = "Activity"
    date = blob.get("snippet").get("publishedAt")
    date = activity_stream_date_to_datetime(date)
    stream_object["published"] = datetime_to_string(date)

    stream_object["provider"] = {
        "@type": "Service",
        "displayName": "YouTube"
    }
    snippet = blob.get("snippet")
    stream_object["actor"] = {
        "@type": "Person",
        "@id": "https://www.youtube.com/user/{}".format(snippet.get("channelTitle")),
        "displayName": snippet.get("channelTitle"),
    }

    stream_object["object"] = {
        "@id": "https://www.youtube.com/watch?v={}".format(blob.get("id").get("videoId")),
        "@type": "Video",
        "displayName": snippet.get("title"),
        "url": [{
            "href": "https://www.youtube.com/watch?v={}".format(blob.get("id").get("videoId")),
            "@type": "Link"
        }],
        "content": snippet.get("description"),
        "youtube:etag": blob.get("etag"),
        "youtube:kind": blob.get("kind"),
        "youtube:id:kind": blob.get("id").get("kind"),
        "youtube:channelId": snippet.get("channelId"),
        "youtube:liveBroadcastContent": snippet.get("liveBroadcastContent"),
        "image": [
            {
                "@type": "Link",
                "href": snippet.get("thumbnails").get("default").get("url"),
                "mediaType": "image/jpeg",
                "youtube:resolution": "default"
            },
            {
                "@type": "Link",
                "href": snippet.get("thumbnails").get("medium").get("url"),
                "mediaType": "image/jpeg",
                "youtube:resolution": "medium"
            },
            {
                "@type": "Link",
                "href": snippet.get("thumbnails").get("high").get("url"),
                "mediaType": "image/jpeg",
                "youtube:resolution": "high"
            },

        ]
    }
    return stream_object


"""

"""


"""
{
        "@context": "http://www.w3.org/ns/activitystreams",

        "@type": "Activity", ------ Abstract wrapper

        "published": "2015-02-10T15:04:55Z",

        "provider": {
            "@type": "Service",
            "displayName": "Twitter|FaceBook|Instagram|YouTube"
        },

        "actor": {
            "@type": "Person",
            "@id": "https://www.twitter.com/{{user.screen_name}}
            "displayName": "Martin Smith",
            "url": "http://example.org/martin",
            "image": {
                "@type": "Link",
                "href": "http://example.org/martin/image.jpg",
                "mediaType": "image/jpeg"
            }
        },

    ------------------------------------------------------

        "object" : {
            "@id": "urn:example:blog:abc123/xyz",
            "@type": "Note",
            "url": "http://example.org/blog/2011/02/entry",
            "content": "This is a short note"
        },

    ------------------------------------------------------

    "object" : {
        "@id": "urn:example:blog:abc123/xyz",
        "@type": "Video",
        "displayName": "A Simple Video",
        "url": "http://example.org/video.mkv",
        "duration": "PT2H"
    },

    ------------------------------------------------------

    "object" : {
        "@id": "urn:example:blog:abc123/xyz",
        "@type": "Image",
        "displayName": "A Simple Image",
        "content": "any messages?"
        "url": [
            {
                "@type": "Link",
                "href": "http://example.org/image.jpeg",
                "mediaType": "image/jpeg"
            },

            {
                "@type": "Link",
                "href": "http://example.org/image.png",
                "mediaType": "image/png"
            }
        ]
    },
}
"""
