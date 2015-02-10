import os
from pprint import pprint


def parse_to_activity(blob):
    stream_object = {}

    stream_object["@context"] = "http://www.w3.org/ns/activitystreams"
    stream_object["@type"] = "Activity"
    stream_object["published"] = blob.get('created_time')
    stream_object["provider"] = {
        "@type": "Service",
        "displayName": "Facebook"
    }
    actor = blob.get('from')
    stream_object["actor"] = {
        "@type": "Person",
        "@id": "https://www.facebook.com/{}".format(actor.get('id')),
        "displayName": actor.get('name'),
        'facebook:category': actor.get('category'),
        'facebook:id': actor.get('id'),
    }

    obj_id = blob.get('object_id') or blob.get('id')
    stream_object["object"] = {
        "@id": "https://www.facebook.com/{}".format(obj_id),
        "content": blob.get('description'),
        "facebook:actions": blob.get('actions'),
        "facebook:caption": blob.get('caption'),
        "facebook:icon": blob.get('icon'),
        "facebook:id": blob.get('id'),
        # this is removed because it is never in real time, if you want likes
        # make an additional request for them using the ID of this message
        # "facebook:likes": blob.get('likes'),
        "facebook:link": blob.get('link'),
        "facebook:message": blob.get('message'),
        "facebook:name": blob.get('name'),
        "facebook:picture": blob.get('picture'),
        "facebook:privacy": blob.get('privacy'),
        "facebook:to": blob.get('to'),
        "facebook:updated_time": blob.get('updated_time'),
        "facebook:shares": blob.get('shares'),
        "facebook:status_type": blob.get('status_type'),
        # this is removed because it is never in real time, if you want
        # messages make an additional request for them using
        # the ID of this message
        # "facebook:comments": blob.get('comments'),
    }
    msg_type = blob.get('type')
    if msg_type == 'link':
        stream_object['object']['@type'] = 'Link'
        stream_object['object']['href'] = blob.get('link')

    if msg_type == 'photo':
        stream_object['object']['@type'] = 'Image'
        _, ext = os.path.splitext(blob.get('picture'))
        media_type = 'png' if ext.startswith('.png') else 'jpeg'
        stream_object['object']['url'] = [
            {
                "@type": "Link",
                "href": blob.get('picture'),
                "mediaType": "image/{}".format(media_type),
                "facebook:resolution": 'thumbnail'
            }
        ]

    if msg_type == 'status':
        stream_object['object']['@type'] = 'Note'

    pprint(stream_object)
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
