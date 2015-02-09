from pprint import pprint


def parse_to_activity(blob):
    stream_object = {}

    stream_object["@context"] = "http://www.w3.org/ns/activitystreams"
    stream_object["@type"] = "Activity"
    stream_object["published"] = "2015-02-10T15:04:55Z"
    stream_object["provider"] = {
        "@type": "Service",
        "displayName": "Instagram"
    }

    # "actor": {
    #     "@type": "Person",
    #     "@id": "https://www.twitter.com/{{user.screen_name}}
    #     "displayName": "Martin Smith",
    #     "url": "http://example.org/martin",
    #     "image": {
    #         "@type": "Link",
    #         "href": "http://example.org/martin/image.jpg",
    #         "mediaType": "image/jpeg"
    #     }
    # },

    pprint(blob)
    return stream_object


"""

{u'attribution': None,
 u'caption': {u'created_time': u'1423268095',
              u'from': {u'full_name': u'Simen Hed\\u00e9n',
                        u'id': u'329874088',
                        u'profile_picture': u'https://igcdn-photos-b-a.akamaihd.net/hphotos-ak-xap1/t51.2885-19/925284_260137407523385_961509360_a.jpg',
                        u'username': u'simen_heden'},
              u'id': u'914761544854660532',
              u'text': u'Verdens beste hund #dino'},
 u'comments': {u'count': 0, u'data': []},
 u'created_time': u'1423268095',
 u'filter': u'Normal',
 u'id': u'914761544611390689_329874088',
 u'images': {u'low_resolution': {u'height': 306,
                                 u'url': u'http://scontent-b.cdninstagram.com/hphotos-xaf1/t51.2885-15/s306x306/e15/10956858_826025797434851_1839483439_n.jpg',
                                 u'width': 306},
             u'standard_resolution': {u'height': 640,
                                      u'url': u'http://scontent-b.cdninstagram.com/hphotos-xaf1/t51.2885-15/e15/10956858_826025797434851_1839483439_n.jpg',
                                      u'width': 640},
             u'thumbnail': {u'height': 150,
                            u'url': u'http://scontent-b.cdninstagram.com/hphotos-xaf1/t51.2885-15/s150x150/e15/10956858_826025797434851_1839483439_n.jpg',
                            u'width': 150}},
 u'likes': {u'count': 1,
            u'data': [{u'full_name': u'Simen Hed\\u00e9n',
                       u'id': u'329874088',
                       u'profile_picture': u'https://igcdn-photos-b-a.akamaihd.net/hphotos-ak-xap1/t51.2885-19/925284_260137407523385_961509360_a.jpg',
                       u'username': u'simen_heden'}]},
 u'link': u'http://instagram.com/p/yx4sc4v-Th/',
 u'location': None,
 u'tags': [u'dino'],
 u'type': u'image',
 u'user': {u'bio': u'',
           u'full_name': u'Simen Hed\\u00e9n',
           u'id': u'329874088',
           u'profile_picture': u'https://igcdn-photos-b-a.akamaihd.net/hphotos-ak-xap1/t51.2885-19/925284_260137407523385_961509360_a.jpg',
           u'username': u'simen_heden',
           u'website': u''},
 u'user_has_liked': False,
 u'users_in_photo': []}
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
