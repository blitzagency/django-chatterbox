from .date import timestamp_to_datetime, datetime_to_string
from pprint import pprint

def parse_to_activity(blob):
    stream_object = {}

    stream_object["@context"] = "http://www.w3.org/ns/activitystreams"
    stream_object["@type"] = "Activity"

    date = timestamp_to_datetime(blob.get('created_time'))
    stream_object["published"] = datetime_to_string(date)
    stream_object["provider"] = {
        "@type": "Service",
        "displayName": "Instagram"
    }

    user = blob.get('user')
    stream_object['actor'] = {
        "@type": "Person",
        "@id": "https://www.instagram.com/{}".format(user.get('username')),
        "displayName": user.get('full_name'),
        "image": {
            "@type": "Link",
            "href": user.get('profile_picture'),
            "mediaType": "image/jpeg"
        },
        "instagram:username": user.get('username'),
        "instagram:website": user.get('website'),
        "instagram:bio": user.get('bio'),
        "instagram:id": user.get('id'),
    },

    caption = blob.get('caption', {})
    images = blob.get('images')
    stream_object["object"] = {
        "@id": blob.get('link'),
        "@type": blob.get('type').title(),
        "content": caption and caption.get("text") or None,
        "url": [
            {
                "@type": "Link",
                "href": images.get('thumbnail').get('url'),
                "mediaType": "image/jpeg",
                "instagram:width": images.get('thumbnail').get('width'),
                "instagram:height": images.get('thumbnail').get('height'),
                "instagram:resolution": 'thumbnail'
            },
            {
                "@type": "Link",
                "href": images.get('low_resolution').get('url'),
                "mediaType": "image/jpeg",
                "instagram:width": images.get('low_resolution').get('width'),
                "instagram:height": images.get('low_resolution').get('height'),
                "instagram:resolution": 'low_resolution'
            },
            {
                "@type": "Link",
                "href": images.get('standard_resolution').get('url'),
                "mediaType": "image/jpeg",
                "instagram:width": images.get('standard_resolution').get('width'),
                "instagram:height": images.get('standard_resolution').get('height'),
                "instagram:resolution": 'standard_resolution'
            }
        ],
        "instagram:user_has_liked": blob.get('user_has_liked'),
        "instagram:attribution": blob.get('attribution'),
        "instagram:tags": blob.get('tags'),
        "instagram:comments": blob.get('comments'),
        "instagram:filter": blob.get('filter'),
        "instagram:location": blob.get('location'),
        "instagram:users_in_photo": blob.get('users_in_photo'),
        "instagram:id": blob.get('id'),
        "instagram:likes": blob.get('likes'),
    }

    if blob.get('type') == 'video':
        videos = blob.get('videos')
        stream_object['object']['image'] = stream_object['object']['url']
        stream_object['object']['url'] = [
            {
                "@type": "Link",
                "href": videos.get('low_bandwidth').get('url'),
                "mediaType": "video/mp4",
                "instagram:width": videos.get('low_bandwidth').get('width'),
                "instagram:height": videos.get('low_bandwidth').get('height'),
                "instagram:option": 'low_bandwidth'
            },
            {
                "@type": "Link",
                "href": videos.get('low_resolution').get('url'),
                "mediaType": "video/mp4",
                "instagram:width": videos.get('low_resolution').get('width'),
                "instagram:height": videos.get('low_resolution').get('height'),
                "instagram:option": 'low_resolution'
            },
            {
                "@type": "Link",
                "href": videos.get('standard_resolution').get('url'),
                "mediaType": "video/mp4",
                "instagram:width": videos.get('standard_resolution').get('width'),
                "instagram:height": videos.get('standard_resolution').get('height'),
                "instagram:option": 'standard_resolution'
            },

        ]
    return stream_object
