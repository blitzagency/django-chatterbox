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
        "image": {
            "@type": "Link",
            "href": "http://example.org/martin/image.jpg",
            "mediaType": "image/jpeg"
        },
        'facebook:category': actor.get('category'),
        'facebook:id': actor.get('id'),
    }

    stream_object["object"] = {
        "@id": "https://www.facebook.com/{}".format(blob.get('id')),
        "content": blob.get('description'),
        "facebook:actions": blob.get('actions'),
        "facebook:caption": blob.get('caption'),
        "facebook:icon": blob.get('icon'),
        "facebook:id": blob.get('id'),
        # this is removed because it is never in real time, if you want likes
        # make an additiona request for them using the ID of this message
        # "facebook:likes": blob.get('likes'),
        "facebook:link": blob.get('link'),
        "facebook:message": blob.get('message'),
        "facebook:name": blob.get('name'),
        "facebook:picture": blob.get('picture'),
        "facebook:privacy": blob.get('privacy'),
        "facebook:to": blob.get('to'),
        "facebook:updated_time": blob.get('updated_time'),
        # this is removed because it is never in real time, if you want
        # messages make an additiona request for them using
        # the ID of this message
        # "facebook:comments": blob.get('comments'),
    }

    if blob.get('type') == 'link':
        stream_object['object']['@type'] = 'Link'
        stream_object['object']['href'] = blob.get('link')



    pprint(stream_object)
    return stream_object


"""
{
 u'link': u'https://www.facebook.com/nakedjuice/photos/a.103189721183.101057.11936081183/10152356267416184/?type=1&relevant_count=1',
 u'message': u'Before you tackle traffic, bring Naked Juice along for the ride.',
 u'object_id': u'10152356267416184',
 u'picture': u'https://scontent-a.xx.fbcdn.net/hphotos-xfa1/v/t1.0-9/p130x130/1506477_10152356267416184_1180324622756358039_n.png?oh=f1aa51607848c3595dec030500415964&oe=55555322',
 u'privacy': {u'value': u''},
 u'shares': {u'count': 3},
 u'status_type': u'added_photos',
 u'type': u'photo',
 u'updated_time': u'2014-11-28T14:05:04+0000'}
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
