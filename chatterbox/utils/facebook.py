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
        "image": {
            "@type": "Link",
            "href": "http://example.org/martin/image.jpg",
            "mediaType": "image/jpeg"
        },
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

    if blob.get('type') == 'link':
        stream_object['object']['@type'] = 'Link'
        stream_object['object']['href'] = blob.get('link')

    if blob.get('type') == 'photo':
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

    pprint(stream_object)
    return stream_object


"""

.{u'actions': [{u'link': u'https://www.facebook.com/11936081183/posts/10152357221236184',
               u'name': u'Comment'},
              {u'link': u'https://www.facebook.com/11936081183/posts/10152357221236184',
               u'name': u'Like'}],
 u'comments': {u'data': [{u'can_remove': False,
                          u'created_time': u'2014-11-26T15:15:22+0000',
                          u'from': {u'id': u'379031878944153',
                                    u'name': u'Tyler White'},
                          u'id': u'10152356267416184_10152357238791184',
                          u'like_count': 2,
                          u'message': u'I love naked juice',
                          u'user_likes': False},
                         {u'can_remove': False,
                          u'created_time': u'2014-11-28T14:05:04+0000',
                          u'from': {u'id': u'397935350383964',
                                    u'name': u'Jay Aguilar'},
                          u'id': u'10152356267416184_10152360782006184',
                          u'like_count': 0,
                          u'message': u"Pepsi owns this company.\nNot safe plus you're feeding money to corrupt corporations.",
                          u'user_likes': False},
                         {u'can_remove': False,
                          u'created_time': u'2014-11-27T14:46:16+0000',
                          u'from': {u'id': u'10205577914103400',
                                    u'name': u'Mary Singleton'},
                          u'id': u'10152356267416184_10152359195856184',
                          u'like_count': 0,
                          u'message': u'to work got it in my bag',
                          u'user_likes': False},
                         {u'can_remove': False,
                          u'created_time': u'2014-11-26T17:19:32+0000',
                          u'from': {u'id': u'645517292242136',
                                    u'name': u'Austin Rohweder'},
                          u'id': u'10152356267416184_10152357385771184',
                          u'like_count': 0,
                          u'message': u'Perishable and packed with GMOs',
                          u'user_likes': False},
                         {u'can_remove': False,
                          u'created_time': u'2014-11-26T17:21:40+0000',
                          u'from': {u'id': u'780193812065668',
                                    u'name': u'Adam Patterson'},
                          u'id': u'10152356267416184_10152357389276184',
                          u'like_count': 0,
                          u'message': u'yeaa keep cold naked juice in a warm vehicle while cold ice snow weather outside',
                          u'user_likes': False}],
               u'paging': {u'cursors': {u'after': u'MQ==',
                                        u'before': u'Ng=='}}},
 u'created_time': u'2014-11-26T15:00:00+0000',
 u'from': {u'category': u'Food/beverages',
           u'id': u'11936081183',
           u'name': u'Naked Juice'},
 u'icon': u'https://fbstatic-a.akamaihd.net/rsrc.php/v2/yz/r/StEh3RhPvjk.gif',
 u'id': u'11936081183_10152357221236184',
 u'likes': {u'data': [{u'id': u'861016117270765',
                       u'name': u'Amber Howell Smith'},
                      {u'id': u'1036645526349479',
                       u'name': u'Stacy L Montes'},
                      {u'id': u'626776847456195', u'name': u'Precious Love'},
                      {u'id': u'1551574618460727', u'name': u'Tami Gasper'},
                      {u'id': u'942250299118849',
                       u'name': u'Lori Michelle Edwards'},
                      {u'id': u'10203695538776953',
                       u'name': u'Karen Burgos-Zhernosek'},
                      {u'id': u'1591183777784939', u'name': u'Aisha Guzman'},
                      {u'id': u'816789395067416',
                       u'name': u'Matthew Bassett'},
                      {u'id': u'10202806954969403',
                       u'name': u'Carla Barnes'},
                      {u'id': u'10205525265472455', u'name': u'Dani Ochoa'},
                      {u'id': u'1551051788512885',
                       u'name': u'Marcella Werito'},
                      {u'id': u'540124972757501',
                       u'name': u'Babygold Bebek Ma\u011fazas\u0131 Kuyucak'},
                      {u'id': u'852419218153710',
                       u'name': u'Anapaula Cardoso'},
                      {u'id': u'931093190235816', u'name': u'Kevin Phung'},
                      {u'id': u'827389440640231',
                       u'name': u'Mary A Saldana'},
                      {u'id': u'10205059350476318',
                       u'name': u'Laurina Hinchey'},
                      {u'id': u'10203590386506724',
                       u'name': u'Bo Anastasova'},
                      {u'id': u'732344940218386',
                       u'name': u'Leslie Granchelli'},
                      {u'id': u'10203873830830554',
                       u'name': u'Deb Blackmon-Smith'},
                      {u'id': u'281862305247820', u'name': u'Suzana Uzelac'},
                      {u'id': u'301425036686152',
                       u'name': u'Gillian L Hanna'},
                      {u'id': u'1538865016392907',
                       u'name': u'Khadijah Craig-middlebrooks'},
                      {u'id': u'981989588485741',
                       u'name': u'Manuel Ray Rodriguez'},
                      {u'id': u'10203498117440274',
                       u'name': u'Janette Ortiz'},
                      {u'id': u'975104712518046',
                       u'name': u'Morton Hamlette'}],
            u'paging': {u'cursors': {u'after': u'OTc1MTA0NzEyNTE4MDQ2',
                                     u'before': u'ODYxMDE2MTE3MjcwNzY1'},
                        u'next': u'https://graph.facebook.com/v2.2/11936081183_10152357221236184/likes?access_token=CAALTIjkbkrEBANfEJZB6OTdQslVMsmHhBkavw0S7l51lf1Jk02WjTb0hZBcqUYcUXZAtycSvvYdZAGEK7JjVY3xJhgjAB0ipGC5M6oLgEtVsKxvObiu0XoOzKDWLMBmlw0y9rTtjZADPV7uXpP9x8tqU3H3rgk8zwy1sLurH2m2GZA3BSdOCGQAN2rUDnm3kOjXeN1LUupiYe9Y3d1ngbT&limit=25&after=OTc1MTA0NzEyNTE4MDQ2'}},
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
