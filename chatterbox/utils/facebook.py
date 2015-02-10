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
        "facebook:likes": blob.get('likes'),
        "facebook:link": blob.get('link'),
        "facebook:message": blob.get('message'),
        "facebook:name": blob.get('name'),
        "facebook:picture": blob.get('picture'),
        "facebook:privacy": blob.get('privacy'),
        "facebook:to": blob.get('to'),
        "facebook:updated_time": blob.get('updated_time'),
    }

    if blob.get('type') == 'link':
        stream_object['object']['@type'] = 'Link'
        stream_object['object']['href'] = blob.get('link')



    pprint(blob)
    return stream_object


# link
"""
{u'actions': [{u'link': u'https://www.facebook.com/11936081183/posts/1563765100521916',
               u'name': u'Comment'},
              {u'link': u'https://www.facebook.com/11936081183/posts/1563765100521916',
               u'name': u'Like'}],
 u'caption': u'www.jasoncouponking.com',

 u'created_time': u'2014-11-20T22:59:32+0000',
 u'description': u'Naked Juice Smoothie $1.00 off (1) Printable Coupon - Nice!',
 u'from': {u'category': u'Community',
           u'id': u'1375557242676037',
           u'name': u'Jason the Coupon King'},
 u'icon': u'https://fbstatic-a.akamaihd.net/rsrc.php/v2/yD/r/aS8ecmYRys0.gif',
 u'id': u'11936081183_1563765100521916',
 u'likes': {u'data': [{u'id': u'397935350383964', u'name': u'Jay Aguilar'}],
            u'paging': {u'cursors': {u'after': u'Mzk3OTM1MzUwMzgzOTY0',
                                     u'before': u'Mzk3OTM1MzUwMzgzOTY0'}}},
 u'link': u'http://wp.me/p3vAqZ-3KS',
 u'message': u'Naked Juice Smoothie $1.00 off (1) Printable Coupon \u2013 Nice!  http://wp.me/p3vAqZ-3KS',
 u'name': u'Naked Juice Smoothie $1.00 off (1) Printable Coupon - Nice! | Jason the Coupon King',
 u'picture': u'https://fbexternal-a.akamaihd.net/safe_image.php?d=AQCse2eyp3UYASlP&w=158&h=158&url=http%3A%2F%2Fwww.jasoncouponking.com%2Fwp-content%2Fuploads%2F2014%2F11%2Fnaked-juice-400x400.png',
 u'privacy': {u'value': u''},
 u'to': {u'data': [{u'category': u'Food/beverages',
                    u'id': u'11936081183',
                    u'name': u'Naked Juice'}]},
 u'type': u'link',
 u'updated_time': u'2014-11-20T22:59:32+0000'}
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
