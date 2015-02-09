from .date import timestamp_to_datetime, datetime_to_string


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
        "@type": "Image",
        "displayName": "A Simple Image",
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

    return stream_object


"""

{
  "user_has_liked": false,
  "attribution": null,
  "tags": [
    "beautiful",
    "summer",
    "love",
    "beauty",
    "nature",
    "tree",
    "night",
    "mothernature",
    "weather",
    "skylovers",
    "twilight",
    "day",
    "sunrise",
    "blue",
    "flowers",
    "clouds",
    "cloudporn",
    "sun",
    "dusk",
    "sky",
    "iphonesia",
    "tagsforlikes",
    "green",
    "pretty",
    "light",
    "sunset",
    "beach",
    "red",
    "photooftheday"
  ],
  "user": {
    "username": "whitesuede9",
    "website": "",
    "bio": "",
    "profile_picture": "https://igcdn-photos-h-a.akamaihd.net/hphotos-ak-xpa1/t51.2885-19/1597589_1494165037524847_1639188279_a.jpg",
    "full_name": "whitesuede9",
    "id": "1204663994"
  },
  "comments": {
    "count": 2,
    "data": [
      {
        "created_time": "1423497435",
        "text": "Cool photo! Very best! Please check my profile :)",
        "from": {
          "username": "andrewthevegas",
          "profile_picture": "https://igcdn-photos-a-a.akamaihd.net/hphotos-ak-xap1/t51.2885-19/10683908_715376935178344_1583470107_a.jpg",
          "id": "516049153",
          "full_name": "Andrea Di Girolamo"
        },
        "id": "916685388934704609"
      },
      {
        "created_time": "1423501348",
        "text": "#nature #TagsForLikes #sky #sun #summer #beach #beautiful #pretty #sunset #sunrise #blue #flowers #night #tree #twilight #clouds #beauty #light #cloudporn #photooftheday #love #green #skylovers #dusk #weather #day #red #iphonesia #mothernature",
        "from": {
          "username": "whitesuede9",
          "profile_picture": "https://igcdn-photos-h-a.akamaihd.net/hphotos-ak-xpa1/t51.2885-19/1597589_1494165037524847_1639188279_a.jpg",
          "id": "1204663994",
          "full_name": "whitesuede9"
        },
        "id": "916718216409935607"
      }
    ]
  },
  "filter": "Lo-fi",
  "images": {
    "low_resolution": {
      "url": "http://scontent-a.cdninstagram.com/hphotos-xfa1/t51.2885-15/s306x306/e15/10948661_1503984183181725_1113799724_n.jpg",
      "width": 306,
      "height": 306
    },
    "thumbnail": {
      "url": "http://scontent-a.cdninstagram.com/hphotos-xfa1/t51.2885-15/s150x150/e15/10948661_1503984183181725_1113799724_n.jpg",
      "width": 150,
      "height": 150
    },
    "standard_resolution": {
      "url": "http://scontent-a.cdninstagram.com/hphotos-xfa1/t51.2885-15/e15/10948661_1503984183181725_1113799724_n.jpg",
      "width": 640,
      "height": 640
    }
  },
  "link": "http://instagram.com/p/y4qucBvmxW/",
  "location": null,
  "created_time": "1423495652",
  "users_in_photo": [],
  "caption": null,
  "type": "image",
  "id": "916670433313320022_1204663994",
  "likes": {
    "count": 7,
    "data": [
      {
        "username": "s_b_club",
        "profile_picture": "https://igcdn-photos-h-a.akamaihd.net/hphotos-ak-xaf1/t51.2885-19/10948534_309993959194111_1016689515_a.jpg",
        "id": "1580409280",
        "full_name": "\\u041a\\u043b\\u0430\\u0432\\u0434\\u0438\\u044f"
      },
      {
        "username": "cinderellaconny_",
        "profile_picture": "https://igcdn-photos-a-a.akamaihd.net/hphotos-ak-xaf1/t51.2885-19/10954368_1580463018836496_608749521_a.jpg",
        "id": "1253357290",
        "full_name": "cinderellaconny_"
      },
      {
        "username": "zizoza",
        "profile_picture": "https://igcdn-photos-g-a.akamaihd.net/hphotos-ak-xap1/t51.2885-19/10731537_736421293073774_741861996_a.jpg",
        "id": "33338836",
        "full_name": "Vitaly"
      },
      {
        "username": "joshpotter_23",
        "profile_picture": "https://igcdn-photos-c-a.akamaihd.net/hphotos-ak-xaf1/t51.2885-19/10948912_415116871997978_1649886420_a.jpg",
        "id": "230159126",
        "full_name": "Josh Potter \\ud83d\\udc8e"
      }
    ]
  }
}

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
