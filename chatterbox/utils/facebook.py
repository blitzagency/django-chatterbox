import os
from chatterbox.models import Activity


def activity_from_dict(data):
    activity_dict = activity_dict_from_dict(data)
    return Activity.from_activity_dict(activity_dict)


def activity_dict_from_dict(blob):
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
        "facebook:message_tags": blob.get('message_tags'),
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
        stream_object['object']['content'] = blob.get('message')

    if msg_type == 'video':
        stream_object['object']['@type'] = 'Video'
        stream_object['object']['facebook:duration'] = blob.get('duration')
        stream_object['object']['url'] = [{
            "href": blob.get('source'),
            "@type": "Link"
        }]

    return stream_object
