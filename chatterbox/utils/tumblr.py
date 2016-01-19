import os
import logging
from chatterbox.models import Activity
from .date import tumblr_date_to_datetime, datetime_to_string


log = logging.getLogger(__name__)


def activity_from_dict(data):
    log.debug("Converting Tumblr dict to Activity Model")
    activity_dict = activity_dict_from_dict(data)
    return Activity.from_activity_dict(activity_dict)


def activity_dict_from_dict(blob):
    log.debug("Converting Tumblr dict to activity dict: %s", blob)
    stream_object = {}
    stream_object["@context"] = "http://www.w3.org/ns/activitystreams"
    stream_object["@type"] = "Activity"

    date = tumblr_date_to_datetime(blob.get('date'))
    stream_object["published"] = datetime_to_string(date)

    stream_object["provider"] = {
        "@type": "Service",
        "displayName": "Tumblr"
    }

    stream_object["actor"] = {
        "@type": "Person",
        "@id": "https://{}.tumblr.com".format(blob.get("blog_name")),
        "displayName": blob.get("blog_name"),
    }

    stream_object["object"] = {
        "@id": blob.get('post_url'),
        "content": blob.get("caption"),
        "url": [],
        "tumblr:can_reply": blob.get("can_reply"),
        "tumblr:can_send_in_message": blob.get("can_send_in_message"),
        "tumblr:followed": blob.get("followed"),
        "tumblr:format": blob.get("format"),
        "tumblr:highlighted": blob.get("highlighted"),
        "tumblr:id": blob.get("id"),
        "tumblr:image_permalink": blob.get("image_permalink"),
        "tumblr:liked": blob.get("liked"),
        "tumblr:note_count": blob.get("note_count"),
        "tubmlr:reblog": blob.get('reblog'),
        "tubmlr:reblog_key": blob.get('reblog_key'),
        "tubmlr:recommended_color": blob.get('recommended_color'),
        "tubmlr:recommended_source": blob.get('recommended_source'),
        "tubmlr:short_url": blob.get('short_url'),
        "tubmlr:slug": blob.get('slug'),
        "tubmlr:state": blob.get('state'),
        "tubmlr:summary": blob.get('summary'),
        "tubmlr:tags": blob.get('tags'),
        "tubmlr:timestamp": blob.get('timestamp'),
        "tubmlr:trail": blob.get('trail'),
        "tubmlr:type": blob.get('type'),
        # link only
        "tubmlr:description": blob.get('description'),
        "tubmlr:link_image": blob.get('link_image'),
        "tubmlr:link_image_dimensions": blob.get('link_image_dimensions'),
        "tubmlr:publisher": blob.get('publisher'),
        "tubmlr:title": blob.get('title'),
    }

    stream_type = blob.get('type')
    photos = blob.get("photos", [])
    if len(photos):
        for photo in photos:
            _, ext = os.path.splitext(photo.get('original_size').get('url'))
            media_type = "png" if ext.startswith(".png") else "jpeg"
            stream_object["object"]["url"].append({
                "@type": "Link",
                "href": photo.get('original_size').get('url'),
                "mediaType": "image/{}".format(media_type),
                "tubmlr:alt_sizes": photo.get('alt_sizes'),
                "tubmlr:caption": photo.get('caption'),
                "tubmlr:height": photo.get('original_size').get('height'),
                "tubmlr:width": photo.get('original_size').get('width'),
            })

    if stream_type == "photo":
        stream_object["object"]["@type"] = "Image"
    elif stream_type == "link":
        stream_object["object"]["@type"] = "Link"
        stream_object["object"]["href"] = blob.get('url')
    elif stream_type == "text":
        stream_object["object"]["@type"] = "Note"
        stream_object["object"]["content"] = blob.get("body")
    elif stream_type == "video":
        stream_object["object"]["@type"] = "Video"
        stream_object["object"]["tumblr:player"] = blob.get("player")
        stream_object["object"]["tumblr:duration"] = blob.get("duration")
        stream_object["object"]["tumblr:html5_capable"] = blob.get("html5_capable")
        stream_object["object"]["tumblr:thumbnail_height"] = blob.get("thumbnail_height")
        stream_object["object"]["tumblr:thumbnail_width"] = blob.get("thumbnail_width")
        stream_object["object"]["tumblr:thumbnail_url"] = blob.get("thumbnail_url")
        stream_object["object"]["tumblr:video_type"] = blob.get("video_type")
        stream_object["object"]["url"] = [{
            "href": blob.get("video_url"),
            "@type": "Link"
        }]

    elif stream_type == "answer":
        stream_object["object"]["@type"] = "Note"
        stream_object["object"]["content"] = blob.get("answer")
        stream_object["object"]["tumblr:asking_name"] = blob.get("asking_name")
        stream_object["object"]["tumblr:asking_url"] = blob.get("asking_url")
        stream_object["object"]["tumblr:question"] = blob.get("question")

    elif stream_type == "chat":
        stream_object["object"]["@type"] = "Note"
        stream_object["object"]["content"] = blob.get("body")
        stream_object["object"]["tumblr:dialogue"] = blob.get("dialogue")

    elif stream_type == "quote":
        stream_object["object"]["@type"] = "Note"
        stream_object["object"]["content"] = blob.get("text")
        stream_object["object"]["tumblr:source"] = blob.get("source")

    elif stream_type == "audio":
        stream_object["object"]["@type"] = "Audio"
        stream_object["object"]["url"] = [{
            "href": blob.get("audio_url"),
            "@type": "Link"
        }]
        stream_object["object"]["tumblr:audio_source_url"] = blob.get("audio_source_url")
        stream_object["object"]["tumblr:audio_type"] = blob.get("audio_type")
        stream_object["object"]["tumblr:embed"] = blob.get("embed")
        stream_object["object"]["tumblr:player"] = blob.get("player")
        stream_object["object"]["tumblr:plays"] = blob.get("plays")
        stream_object["object"]["tumblr:source_title"] = blob.get("source_title")
        stream_object["object"]["tumblr:source_url"] = blob.get("source_url")

    else:
        # GOTTA UPATE FEADER!
        log.error("tumlr: Update utils/tubmlr.py activity_dict_from_dict method")
        log.error(blob)
        import pdb; pdb.set_trace()

    return stream_object


"""
AUDIO

{u'audio_source_url': u'https://www.tumblr.com/audio_file/pitchersandpoets/25448766013/tumblr_m5vo97tJ3L1qfnhhq',
 u'audio_type': u'tumblr',
 u'audio_url': u'https://www.tumblr.com/audio_file/pitchersandpoets/25448766013/tumblr_m5vo97tJ3L1qfnhhq',
 u'blog_name': u'pitchersandpoets',
 u'can_reply': False,
 u'can_send_in_message': True,
 u'caption': u'<p><a class="tumblr_blog" href="http://toddzwillich.tumblr.com/post/25447401556/sen-harry-reid-d-nev-channels-nationals">toddzwillich</a>:</p>\n<blockquote>\n<p>Sen. Harry Reid (D-Nev.) channels Nationals outfielder Bryce Harper in a press availability with reporters.</p>\n</blockquote>\n<p>Mitch McConnell would never do this. </p>',
 u'date': u'2012-06-19 19:11:05 GMT',
 u'embed': u'<iframe class="tumblr_audio_player tumblr_audio_player_25448766013" src="http://pitchersandpoets.tumblr.com/post/25448766013/audio_player_iframe/pitchersandpoets/tumblr_m5vo97tJ3L1qfnhhq?audio_file=https%3A%2F%2Fwww.tumblr.com%2Faudio_file%2Fpitchersandpoets%2F25448766013%2Ftumblr_m5vo97tJ3L1qfnhhq" frameborder="0" allowtransparency="true" scrolling="no" width="540" height="85"></iframe>',
 u'followed': False,
 u'format': u'html',
 u'highlighted': [],
 u'id': 25448766013,
 u'liked': False,
 u'note_count': 63,
 u'player': u'<embed type="application/x-shockwave-flash" src="https://secure.assets.tumblr.com/swf/audio_player.swf?audio_file=https%3A%2F%2Fwww.tumblr.com%2Faudio_file%2Fpitchersandpoets%2F25448766013%2Ftumblr_m5vo97tJ3L1qfnhhq&color=FFFFFF" height="27" width="207" quality="best" wmode="opaque"></embed>',
 u'plays': 10389,
 u'post_url': u'http://pitchersandpoets.tumblr.com/post/25448766013/toddzwillich-sen-harry-reid-d-nev-channels',
 u'reblog': {u'comment': u'<p>Mitch McConnell would never do this. </p>',
             u'tree_html': u'<p><a class="tumblr_blog" href="http://toddzwillich.tumblr.com/post/25447401556/sen-harry-reid-d-nev-channels-nationals">toddzwillich</a>:</p><blockquote>\n<p>Sen. Harry Reid (D-Nev.) channels Nationals outfielder Bryce Harper in a press availability with reporters.</p>\n</blockquote>'},
 u'reblog_key': u'UEJl4zYV',
 u'recommended_color': None,
 u'recommended_source': None,
 u'short_url': u'http://tmblr.co/ZhSWUxNitLez',
 u'slug': u'toddzwillich-sen-harry-reid-d-nev-channels',
 u'source_title': u'toddzwillich',
 u'source_url': u'http://toddzwillich.tumblr.com/post/25447401556/sen-harry-reid-d-nev-channels-nationals',
 u'state': u'published',
 u'summary': u'Sen. Harry Reid (D-Nev.) channels Nationals outfielder Bryce Harper in a press availability with reporters.',
 u'tags': [],
 u'timestamp': 1340133065,
 u'trail': [{u'blog': {u'active': True,
                       u'name': u'toddzwillich',
                       u'theme': {u'avatar_shape': u'square',
                                  u'background_color': u'#FAFAFA',
                                  u'body_font': u'Helvetica Neue',
                                  u'header_bounds': u'',
                                  u'header_image': u'https://secure.assets.tumblr.com/images/default_header/optica_pattern_10.png?_v=eafbfb1726b334d86841955ae7b9221c',
                                  u'header_image_focused': u'https://secure.assets.tumblr.com/images/default_header/optica_pattern_10_focused_v3.png?_v=eafbfb1726b334d86841955ae7b9221c',
                                  u'header_image_scaled': u'https://secure.assets.tumblr.com/images/default_header/optica_pattern_10_focused_v3.png?_v=eafbfb1726b334d86841955ae7b9221c',
                                  u'header_stretch': True,
                                  u'link_color': u'#529ECC',
                                  u'show_avatar': True,
                                  u'show_description': True,
                                  u'show_header_image': True,
                                  u'show_title': True,
                                  u'title_color': u'#444444',
                                  u'title_font': u'Gibson',
                                  u'title_font_weight': u'bold'}},
             u'content': u'<p>Sen. Harry Reid (D-Nev.) channels Nationals outfielder Bryce Harper in a press availability with reporters.</p>',
             u'content_raw': u'<p>Sen. Harry Reid (D-Nev.) channels Nationals outfielder Bryce Harper in a press availability with reporters.</p>',
             u'is_root_item': True,
             u'post': {u'id': u'25447401556'}},
            {u'blog': {u'active': True,
                       u'name': u'pitchersandpoets',
                       u'theme': {u'avatar_shape': u'square',
                                  u'background_color': u'#FAFAFA',
                                  u'body_font': u'Helvetica Neue',
                                  u'header_bounds': u'',
                                  u'header_image': u'https://secure.assets.tumblr.com/images/default_header/optica_pattern_02.png?_v=b976ee00195b1b7806c94ae285ca46a7',
                                  u'header_image_focused': u'https://secure.assets.tumblr.com/images/default_header/optica_pattern_02_focused_v3.png?_v=b976ee00195b1b7806c94ae285ca46a7',
                                  u'header_image_scaled': u'https://secure.assets.tumblr.com/images/default_header/optica_pattern_02_focused_v3.png?_v=b976ee00195b1b7806c94ae285ca46a7',
                                  u'header_stretch': True,
                                  u'link_color': u'#529ECC',
                                  u'show_avatar': True,
                                  u'show_description': True,
                                  u'show_header_image': True,
                                  u'show_title': True,
                                  u'title_color': u'#444444',
                                  u'title_font': u'Gibson',
                                  u'title_font_weight': u'bold'}},
             u'content': u'<p>Mitch McConnell would never do this. </p>',
             u'content_raw': u'<p>Mitch McConnell would never do this. </p>',
             u'is_current_item': True,
             u'post': {u'id': u'25448766013'}}],
 u'type': u'audio'}


QUOTE
 {u'blog_name': u'pitchersandpoets',
 u'can_reply': False,
 u'can_send_in_message': True,
 u'date': u'2014-04-07 17:19:57 GMT',
 u'followed': False,
 u'format': u'html',
 u'highlighted': [],
 u'id': 82004716592,
 u'liked': False,
 u'note_count': 7,
 u'post_url': u'http://pitchersandpoets.tumblr.com/post/82004716592/to-the-17-full-fledged-members-of-the-giib-the',
 u'reblog': {u'comment': u'<p>I wrote about the budding sabermetrics movement in Cuba<a href="http://sportsillustrated.cnn.com/vault/article/magazine/MAG1210053/index.htm"> for Sports Illustrated</a>.\xa0 (via <a class="tumblr_blog" href="http://ericnus.com/">ericnus</a>)</p>',
             u'tree_html': u''},
 u'reblog_key': u'GLDJmljD',
 u'recommended_color': None,
 u'recommended_source': None,
 u'short_url': u'http://tmblr.co/ZhSWUx1CNtAmm',
 u'slug': u'to-the-17-full-fledged-members-of-the-giib-the',
 u'source': u'I wrote about the budding sabermetrics movement in Cuba<a href="http://sportsillustrated.cnn.com/vault/article/magazine/MAG1210053/index.htm"> for Sports Illustrated</a>.\xa0 (via <a class="tumblr_blog" href="http://ericnus.com/">ericnus</a>)',
 u'state': u'published',
 u'summary': u'To the 17 full-fledged members of the GIIB, the feeling and understanding of baseball are inseparable from one another. They\u2019re...',
 u'tags': [],
 u'text': u'To the 17 full-fledged members of the GIIB, the feeling and understanding of baseball are inseparable from one another. They\u2019re intellectuals, empiricists, the kind of guys who believe that the best way to express your love of something is to spend years studying and arguing about it. They talk about sabermetrics in the context of classic economists: \u201cMarx\u2019s economic theories are basically sabermetrics,\u201d says Aldama. \u201cIt\u2019s the elimination of subjectivity.\u201d',
 u'timestamp': 1396891197,
 u'type': u'quote'}

CHAT:
{u'blog_name': u'raspberryninjas',
 u'body': u'Jeonghan:\nSeventeen fans:*flips a table* LOOK AT HIM. THIS IS TRUE ART, I CANNOT BELIEVE *cries*',
 u'date': u'2016-01-18 06:14:28 GMT',
 u'dialogue': [{u'label': u'Jeonghan:', u'name': u'Jeonghan', u'phrase': u''}, {u'label': u'Seventeen fans:', u'name': u'Seventeen fans', u'phrase': u'*flips a table* LOOK AT HIM. THIS IS TRUE ART, I CANNOT BELIEVE *cries*'}],
 u'format': u'html',
 u'highlighted': [],
 u'id': 137534944663,
 u'note_count': 81,
 u'post_url': u'http://raspberryninjas.tumblr.com/post/137534944663/jeonghan-seventeen-fansflips-a-table-look-at',
 u'reblog_key': u'yG2VW12O',
 u'recommended_color': None,
 u'recommended_source': None,
 u'short_url': u'http://tmblr.co/ZsOe6q205kBMN',
 u'slug': u'jeonghan-seventeen-fansflips-a-table-look-at',
 u'state': u'published',
 u'summary': u'Jeonghan:\nSeventeen fans:*flips a table* LOOK AT HIM. THIS IS TRUE ART, I CANNOT BELIEVE *cries*',
 u'tags': [u'seventeen', u'jeonghan', u'dk', u'dino', u'woozi', u'seungkwan', u'scoups', u'hansol vernon chwe', u'joshua', u'jisoo', u'wonwoo', u'minggyu', u'hoshi', u'the8', u'jun'],
 u'timestamp': 1453097668,
 u'title': None,
 u'type': u'chat'}



ANSWER:
{u'answer': u'<p>\u201cCan we get these?\u201d Chan asks, coming up to you with a pair of sweaters. They were the same shirt with slightly different patterns on them. Micky and Minnie.<br/></p><p>\u201cNo, couple things are cheesy. And besides, what happens if we break up?\u201d You say. He pouts.<br/></p><p>\u201cThat won\u2019t happen, right? You won\u2019t break up with me, right?\u201d He asks, worry starting to settle in his gut. You breathe out a laugh and pull him into your arms.<br/></p><p>\u201cOf course not, Chan. The only reason we\u2019d ever break up is if you got incredibly bored of me.\u201d You say.<br/></p><p>\u201cThat won\u2019t happen. Ever.\u201d<br/></p><hr><p><i>it\u2019s 2:30 in the morning forgive me for this mess</i></p><p><i><b>don\u2019t send any more please ^-^</b></i></p>',
 u'asking_name': u'Anonymous',
 u'asking_url': None,
 u'blog_name': u'mingyoozi',
 u'date': u'2016-01-18 10:51:50 GMT',
 u'format': u'html',
 u'highlighted': [],
 u'id': 137544693488,
 u'note_count': 12,
 u'post_url': u'http://mingyoozi.tumblr.com/post/137544693488/dino-couple-items',
 u'question': u'Dino + couple items',
 u'reblog': {u'comment': u'<p>\u201cCan we get these?\u201d Chan asks, coming up to you with a pair of sweaters. They were the same shirt with slightly different patterns on them. Micky and Minnie.<br></p><p>\u201cNo, couple things are cheesy. And besides, what happens if we break up?\u201d You say. He pouts.<br></p><p>\u201cThat won\u2019t happen, right? You won\u2019t break up with me, right?\u201d He asks, worry starting to settle in his gut. You breathe out a laugh and pull him into your arms.<br></p><p>\u201cOf course not, Chan. The only reason we\u2019d ever break up is if you got incredibly bored of me.\u201d You say.<br></p><p>\u201cThat won\u2019t happen. Ever.\u201d<br></p><hr><p><i>it\u2019s 2:30 in the morning forgive me for this mess</i></p><p><i><b>don\u2019t send any more please ^-^</b></i></p>',
             u'tree_html': u''},
 u'reblog_key': u'FSZesRbV',
 u'recommended_color': None,
 u'recommended_source': None,
 u'short_url': u'http://tmblr.co/ZKgZsk206JNRm',
 u'slug': u'dino-couple-items',
 u'state': u'published',
 u'summary': u'Dino + couple items',
 u'tags': [u'dino scenarios', u'dino', u'seventeen scenarios', u'drabble game 2', u'x', u'anon'],
 u'timestamp': 1453114310,
 u'trail': [{u'blog': {u'active': True,
                       u'name': u'mingyoozi',
                       u'theme': {u'avatar_shape': u'circle',
                                  u'background_color': u'#FBFBFB',
                                  u'body_font': u'Helvetica Neue',
                                  u'header_bounds': u'0,435,242,5',
                                  u'header_focus_height': 242,
                                  u'header_focus_width': 430,
                                  u'header_full_height': 242,
                                  u'header_full_width': 500,
                                  u'header_image': u'https://secure.static.tumblr.com/ab1baf2a8bd404117b373a26c766ca56/rcprpj9/dainzinpj/tumblr_static_.gif',
                                  u'header_image_focused': u'https://secure.static.tumblr.com/ab1baf2a8bd404117b373a26c766ca56/rcprpj9/ftenzinpl/tumblr_static_tumblr_static__focused_v3.gif',
                                  u'header_image_scaled': u'https://secure.static.tumblr.com/ab1baf2a8bd404117b373a26c766ca56/rcprpj9/dainzinpj/tumblr_static__2048_v2.gif',
                                  u'header_stretch': True,
                                  u'link_color': u'#F9D3AB',
                                  u'show_avatar': True,
                                  u'show_description': True,
                                  u'show_header_image': False,
                                  u'show_title': True,
                                  u'title_color': u'#888888',
                                  u'title_font': u'Lorimer No 2',
                                  u'title_font_weight': u'regular'}},
             u'content': u'<p>\u201cCan we get these?\u201d Chan asks, coming up to you with a pair of sweaters. They were the same shirt with slightly different patterns on them. Micky and Minnie.<br /></p><p>\u201cNo, couple things are cheesy. And besides, what happens if we break up?\u201d You say. He pouts.<br /></p><p>\u201cThat won\u2019t happen, right? You won\u2019t break up with me, right?\u201d He asks, worry starting to settle in his gut. You breathe out a laugh and pull him into your arms.<br /></p><p>\u201cOf course not, Chan. The only reason we\u2019d ever break up is if you got incredibly bored of me.\u201d You say.<br /></p><p>\u201cThat won\u2019t happen. Ever.\u201d<br /></p><hr /><p><i>it\u2019s 2:30 in the morning forgive me for this mess</i></p><p><i><b>don\u2019t send any more please ^-^</b></i></p>',
             u'content_raw': u'<p>\u201cCan we get these?\u201d Chan asks, coming up to you with a pair of sweaters. They were the same shirt with slightly different patterns on them. Micky and Minnie.<br></p><p>\u201cNo, couple things are cheesy. And besides, what happens if we break up?\u201d You say. He pouts.<br></p><p>\u201cThat won\u2019t happen, right? You won\u2019t break up with me, right?\u201d He asks, worry starting to settle in his gut. You breathe out a laugh and pull him into your arms.<br></p><p>\u201cOf course not, Chan. The only reason we\u2019d ever break up is if you got incredibly bored of me.\u201d You say.<br></p><p>\u201cThat won\u2019t happen. Ever.\u201d<br></p><hr><p><i>it\u2019s 2:30 in the morning forgive me for this mess</i></p><p><i><b>don\u2019t send any more please ^-^</b></i></p>',
             u'is_current_item': True,
             u'is_root_item': True,
             u'post': {u'id': u'137544693488'}}],
 u'type': u'answer'}



IMAGE:
{
u'blog_name': u'fellowslave',
 u'can_reply': False,
 u'can_send_in_message': True,
 u'caption': u'<p>That must be some perfect chicken</p>\n\n<p><br/>\nFellowslave staff</p>',
 u'date': u'2016-01-15 22:01:42 GMT',
 u'followed': False,
 u'format': u'html',
 u'highlighted': [],
 u'id': 137369495122,
 u'image_permalink': u'http://fellowslave.tumblr.com/image/137369495122',
 u'liked': False,
 u'note_count': 0,
 u'photos': [{u'alt_sizes': [{u'height': 1080, u'url': u'https://41.media.tumblr.com/72f14921c33d535b62319e0a11100d55/tumblr_o10l6uLVyC1v2eea6o1_1280.jpg', u'width': 1080},
                             {u'height': 500, u'url': u'https://41.media.tumblr.com/72f14921c33d535b62319e0a11100d55/tumblr_o10l6uLVyC1v2eea6o1_500.jpg', u'width': 500},
                             {u'height': 400, u'url': u'https://41.media.tumblr.com/72f14921c33d535b62319e0a11100d55/tumblr_o10l6uLVyC1v2eea6o1_400.jpg', u'width': 400},
                             {u'height': 250, u'url': u'https://40.media.tumblr.com/72f14921c33d535b62319e0a11100d55/tumblr_o10l6uLVyC1v2eea6o1_250.jpg', u'width': 250},
                             {u'height': 100, u'url': u'https://40.media.tumblr.com/72f14921c33d535b62319e0a11100d55/tumblr_o10l6uLVyC1v2eea6o1_100.jpg', u'width': 100},
                             {u'height': 75, u'url': u'https://40.media.tumblr.com/72f14921c33d535b62319e0a11100d55/tumblr_o10l6uLVyC1v2eea6o1_75sq.jpg', u'width': 75}],
              u'caption': u'',
              u'original_size': {u'height': 1080, u'url': u'https://41.media.tumblr.com/72f14921c33d535b62319e0a11100d55/tumblr_o10l6uLVyC1v2eea6o1_1280.jpg', u'width': 1080}}],
 u'post_url': u'http://fellowslave.tumblr.com/post/137369495122/that-must-be-some-perfect-chicken-fellowslave',
 u'reblog': {u'comment': u'<p>That must be some perfect chicken</p>\n\n<p><br>\nFellowslave staff</p>', u'tree_html': u''},
 u'reblog_key': u'ZQXn5Y6F',
 u'recommended_color': None,
 u'recommended_source': None,
 u'short_url': u'http://tmblr.co/ZA2eWi1-xt2PI',
 u'slug': u'that-must-be-some-perfect-chicken-fellowslave',
 u'state': u'published',
 u'summary': u'That must be some perfect chicken\n\n\nFellowslave staff',
 u'tags': [u'mistakes', u'food', u'oops', u'chicken', u'menu', u'funny'],
 u'timestamp': 1452895302,
 u'trail': [{u'blog': {u'active': True,
                       u'name': u'fellowslave',
                       u'theme': {u'avatar_shape': u'square',
                                  u'background_color': u'#000000',
                                  u'body_font': u'Helvetica Neue',
                                  u'header_bounds': u'',
                                  u'header_image': u'https://secure.static.tumblr.com/2b440c5a3c485396fb68d84fb0966ee1/dc2vqoe/rpgnzthk0/tumblr_static_filename.jpg',
                                  u'header_image_focused': u'https://secure.static.tumblr.com/2b440c5a3c485396fb68d84fb0966ee1/dc2vqoe/rpgnzthk0/tumblr_static_filename_2048_v2.jpg',
                                  u'header_image_scaled': u'https://secure.static.tumblr.com/2b440c5a3c485396fb68d84fb0966ee1/dc2vqoe/rpgnzthk0/tumblr_static_filename_2048_v2.jpg',
                                  u'header_stretch': True,
                                  u'link_color': u'#FFFFFF',
                                  u'show_avatar': True,
                                  u'show_description': True,
                                  u'show_header_image': True,
                                  u'show_title': True,
                                  u'title_color': u'#FFFFFF',
                                  u'title_font': u'Grumpy Black 48',
                                  u'title_font_weight': u'bold'}},
             u'content': u'<p>That must be some perfect chicken</p>\n\n<p><br />\nFellowslave staff</p>',
             u'content_raw': u'<p>That must be some perfect chicken</p>\n\n<p><br>\nFellowslave staff</p>',
             u'is_current_item': True,
             u'is_root_item': True,
             u'post': {u'id': 137369495122}}],
 u'type': u'photo'}




LINK:
{u'blog_name': u'sociologicallyinsignificant',
 u'can_reply': False,
 u'can_send_in_message': True,
 u'date': u'2016-01-15 21:48:36 GMT',
 u'description': u'',
 u'excerpt': u'Try the recipe for Slow-Cooker Chicken Thigh Hot Pot.',
 u'followed': False,
 u'format': u'html',
 u'highlighted': [],
 u'id': 137368752004,
 u'liked': False,
 u'link_author': None,
 u'link_image': u'https://41.media.tumblr.com/c7d377bf9839748e32feb9936345f2fc/tumblr_nwlk4w2vu81s3jzxo_r1_og_540.jpg',
 u'link_image_dimensions': {u'height': 304, u'width': 540},
 u'note_count': 0,
 u'photos': [{u'alt_sizes': [{u'height': 304, u'url': u'https://41.media.tumblr.com/c7d377bf9839748e32feb9936345f2fc/tumblr_nwlk4w2vu81s3jzxo_r1_og_1280.jpg', u'width': 540},
                             {u'height': 304, u'url': u'https://41.media.tumblr.com/c7d377bf9839748e32feb9936345f2fc/tumblr_nwlk4w2vu81s3jzxo_r1_og_540.jpg', u'width': 540},
                             {u'height': 281, u'url': u'https://36.media.tumblr.com/c7d377bf9839748e32feb9936345f2fc/tumblr_nwlk4w2vu81s3jzxo_r1_og_500.jpg', u'width': 500},
                             {u'height': 225, u'url': u'https://41.media.tumblr.com/c7d377bf9839748e32feb9936345f2fc/tumblr_nwlk4w2vu81s3jzxo_r1_og_400.jpg', u'width': 400},
                             {u'height': 141, u'url': u'https://41.media.tumblr.com/c7d377bf9839748e32feb9936345f2fc/tumblr_nwlk4w2vu81s3jzxo_r1_og_250.jpg', u'width': 250},
                             {u'height': 56, u'url': u'https://41.media.tumblr.com/c7d377bf9839748e32feb9936345f2fc/tumblr_nwlk4w2vu81s3jzxo_r1_og_100.jpg', u'width': 100},
                             {u'height': 75, u'url': u'https://40.media.tumblr.com/c7d377bf9839748e32feb9936345f2fc/tumblr_nwlk4w2vu81s3jzxo_r1_og_75sq.jpg', u'width': 75}],
              u'caption': u'',
              u'original_size': {u'height': 304, u'url': u'https://41.media.tumblr.com/c7d377bf9839748e32feb9936345f2fc/tumblr_nwlk4w2vu81s3jzxo_r1_og_1280.jpg', u'width': 540}}],
 u'post_url': u'http://sociologicallyinsignificant.tumblr.com/post/137368752004/slow-cooker-chicken-thigh-hot-pot-recipe',
 u'publisher': u'oprah.com',
 u'reblog': {u'comment': u'', u'tree_html': u''},
 u'reblog_key': u'ecV4PuRP',
 u'recommended_color': None,
 u'recommended_source': None,
 u'short_url': u'http://tmblr.co/Z1OLDt1-xqC_4',
 u'slug': u'slow-cooker-chicken-thigh-hot-pot-recipe',
 u'state': u'published',
 u'summary': u'Slow-Cooker Chicken Thigh Hot Pot Recipe',
 u'tags': [u'chicken', u'dinner', u'crockpot', u'soup'],
 u'timestamp': 1452894516,
 u'title': u'Slow-Cooker Chicken Thigh Hot Pot Recipe',
 u'trail': [],
 u'type': u'link',
 u'url': u'http://www.oprah.com/food/Slow-Cooker-Chicken-Thigh-Hot-Pot-Recipe'}


TEXT:
{u'blog_name': u'tobbminthobbi',
 u'body': u'<img src="http://ift.tt/1xIEzU6"/><br/><br/>\n9.50 USD, by 1127handcrafter<br/><br/>\nfrom Etsy <a href="http://ift.tt/1jiqOIR">http://ift.tt/1jiqOIR</a><br/>\nvia <a href="http://ift.tt/18ufGjY">IFTTT</a>',
 u'can_reply': False,
 u'can_send_in_message': True,
 u'date': u'2016-01-15 21:22:33 GMT',
 u'followed': False,
 u'format': u'html',
 u'highlighted': [],
 u'id': 137367285703,
 u'liked': False,
 u'note_count': 0,
 u'post_url': u'http://tobbminthobbi.tumblr.com/post/137367285703/needle-felting-craft-kit-diy-handmade-felt-wool',
 u'reblog': {u'comment': u'<p><img src="http://ift.tt/1xIEzU6"><br><br>\n9.50 USD, by 1127handcrafter<br><br>\nfrom Etsy <a href="http://ift.tt/1jiqOIR">http://ift.tt/1jiqOIR</a><br>\nvia <a href="http://ift.tt/18ufGjY">IFTTT</a></p>',
             u'tree_html': u''},
 u'reblog_key': u'sw0vp7QT',
 u'recommended_color': None,
 u'recommended_source': None,
 u'short_url': u'http://tmblr.co/ZrERXn1-xkc-7',
 u'slug': u'needle-felting-craft-kit-diy-handmade-felt-wool',
 u'state': u'published',
 u'summary': u'Needle Felting Craft Kit DIY handmade felt wool Strawberry Rabbit & Chicken --- Japanese kit package http://ift.tt/1jiqOIR',
 u'tags': [u'IFTTT', u'Etsy', u'rabbit', u'chicken', u'felt', u'felting', u'needle', u'craft', u'pet', u'japanese', u'diy', u'wool', u'wool felt', u'fel'],
 u'timestamp': 1452892953,
 u'title': u'Needle Felting Craft Kit DIY handmade felt wool Strawberry Rabbit & Chicken --- Japanese kit package http://ift.tt/1jiqOIR',
 u'trail': [{u'blog': {u'active': True,
                       u'name': u'tobbminthobbi',
                       u'theme': {u'avatar_shape': u'square',
                                  u'background_color': u'#FAFAFA',
                                  u'body_font': u'Helvetica Neue',
                                  u'header_bounds': 0,
                                  u'header_image': u'https://secure.assets.tumblr.com/images/default_header/optica_pattern_04.png?_v=7c4e5e82cf797042596e2e64af1c383f',
                                  u'header_image_focused': u'https://secure.assets.tumblr.com/images/default_header/optica_pattern_04.png?_v=7c4e5e82cf797042596e2e64af1c383f',
                                  u'header_image_scaled': u'https://secure.assets.tumblr.com/images/default_header/optica_pattern_04.png?_v=7c4e5e82cf797042596e2e64af1c383f',
                                  u'header_stretch': True,
                                  u'link_color': u'#529ECC',
                                  u'show_avatar': True,
                                  u'show_description': True,
                                  u'show_header_image': True,
                                  u'show_title': True,
                                  u'title_color': u'#444444',
                                  u'title_font': u'Gibson',
                                  u'title_font_weight': u'bold'}},
             u'content': u'<p><div class="external-image-wrapper" data-loading-text="Loading..." data-src="http://ift.tt/1xIEzU6">External image</div><br /><br />\n9.50 USD, by 1127handcrafter<br /><br />\nfrom Etsy <a href="http://ift.tt/1jiqOIR">http://ift.tt/1jiqOIR</a><br />\nvia <a href="http://ift.tt/18ufGjY">IFTTT</a></p>',
             u'content_raw': u'<p><img src="http://ift.tt/1xIEzU6"><br><br>\n9.50 USD, by 1127handcrafter<br><br>\nfrom Etsy <a href="http://ift.tt/1jiqOIR">http://ift.tt/1jiqOIR</a><br>\nvia <a href="http://ift.tt/18ufGjY">IFTTT</a></p>',
             u'is_current_item': True,
             u'is_root_item': True,
             u'post': {u'id': u'137367285703'}}],
 u'type': u'text'}


 VIDEO:
 {u'blog_name': u'becausebirds',
 u'can_reply': False,
 u'can_send_in_message': True,
 u'caption': u'<p>Chicken agility course. \U0001f413\xa0The ending is the best! [<a href="https://www.facebook.com/sarah.koski.37/videos/525054834317512/" target="_blank">via Facebook</a>]</p>',
 u'date': u'2016-01-15 20:07:34 GMT',
 u'duration': 17,
 u'followed': False,
 u'format': u'html',
 u'highlighted': [],
 u'html5_capable': True,
 u'id': 137363180405,
 u'liked': False,
 u'note_count': 3202,
 u'player': [{u'embed_code': u'\n<video  id=\'embed-56996c492d834868386475\' class=\'crt-video crt-skin-default\' width=\'250\' height=\'138\' poster=\'https://31.media.tumblr.com/tumblr_o10fwitAfe1s9rrcg_frame1.jpg\' preload=\'none\' data-crt-video data-crt-options=\'{"autoheight":null,"duration":17,"hdUrl":false,"filmstrip":{"url":"https:\\/\\/33.media.tumblr.com\\/previews\\/tumblr_o10fwitAfe1s9rrcg_filmstrip.jpg","width":"200","height":"110"}}\' >\n    <source src="https://api.tumblr.com/video_file/137363180405/tumblr_o10fwitAfe1s9rrcg" type="video/mp4">\n</video>\n',
              u'width': 250},
             {u'embed_code': u'\n<video  id=\'embed-56996c492e610295035901\' class=\'crt-video crt-skin-default\' width=\'400\' height=\'222\' poster=\'https://31.media.tumblr.com/tumblr_o10fwitAfe1s9rrcg_frame1.jpg\' preload=\'none\' data-crt-video data-crt-options=\'{"autoheight":null,"duration":17,"hdUrl":false,"filmstrip":{"url":"https:\\/\\/33.media.tumblr.com\\/previews\\/tumblr_o10fwitAfe1s9rrcg_filmstrip.jpg","width":"200","height":"110"}}\' >\n    <source src="https://api.tumblr.com/video_file/137363180405/tumblr_o10fwitAfe1s9rrcg" type="video/mp4">\n</video>\n',
              u'width': 400},
             {u'embed_code': u'\n<video  id=\'embed-56996c492f638918001367\' class=\'crt-video crt-skin-default\' width=\'500\' height=\'277\' poster=\'https://31.media.tumblr.com/tumblr_o10fwitAfe1s9rrcg_frame1.jpg\' preload=\'none\' data-crt-video data-crt-options=\'{"autoheight":null,"duration":17,"hdUrl":false,"filmstrip":{"url":"https:\\/\\/33.media.tumblr.com\\/previews\\/tumblr_o10fwitAfe1s9rrcg_filmstrip.jpg","width":"200","height":"110"}}\' >\n    <source src="https://api.tumblr.com/video_file/137363180405/tumblr_o10fwitAfe1s9rrcg" type="video/mp4">\n</video>\n',
              u'width': 500}],
 u'post_url': u'http://tumblr.becausebirds.com/post/137363180405/chicken-agility-course-the-ending-is-the-best',
 u'reblog': {u'comment': u'<p>Chicken agility course. \U0001f413\xa0The ending is the best! [<a href="https://www.facebook.com/sarah.koski.37/videos/525054834317512/" target="_blank">via Facebook</a>]</p>', u'tree_html': u''},
 u'reblog_key': u'vunAnRop',
 u'recommended_color': None,
 u'recommended_source': None,
 u'short_url': u'http://tmblr.co/ZxW8gs1-xUyjr',
 u'slug': u'chicken-agility-course-the-ending-is-the-best',
 u'state': u'published',
 u'summary': u'Chicken agility course. \U0001f413\xa0The ending is the best! [via Facebook]',
 u'tags': [u'birds', u'lol', u'cute', u'chicken', u'video', u'animals', u'funny', u'gladiator'],
 u'thumbnail_height': 236,
 u'thumbnail_url': u'https://31.media.tumblr.com/tumblr_o10fwitAfe1s9rrcg_frame1.jpg',
 u'thumbnail_width': 426,
 u'timestamp': 1452888454,
 u'trail': [{u'blog': {u'active': True,
                       u'name': u'becausebirds',
                       u'theme': {u'avatar_shape': u'square',
                                  u'background_color': u'#222222',
                                  u'body_font': u'Helvetica Neue',
                                  u'header_bounds': u'0,798,438,19',
                                  u'header_focus_height': 438,
                                  u'header_focus_width': 779,
                                  u'header_full_height': 654,
                                  u'header_full_width': 937,
                                  u'header_image': u'https://secure.static.tumblr.com/a532a5e9978d733124a1bffc8c86c8c9/ne7adjq/7r8n7gb03/tumblr_static_.jpg',
                                  u'header_image_focused': u'https://secure.static.tumblr.com/a532a5e9978d733124a1bffc8c86c8c9/ne7adjq/4tun7gb04/tumblr_static_tumblr_static__focused_v3.jpg',
                                  u'header_image_scaled': u'https://secure.static.tumblr.com/a532a5e9978d733124a1bffc8c86c8c9/ne7adjq/7r8n7gb03/tumblr_static__2048_v2.jpg',
                                  u'header_stretch': True,
                                  u'link_color': u'#FFF148',
                                  u'show_avatar': True,
                                  u'show_description': True,
                                  u'show_header_image': True,
                                  u'show_title': True,
                                  u'title_color': u'#FFFFFF',
                                  u'title_font': u'Ziclets',
                                  u'title_font_weight': u'bold'}},
             u'content': u'<p>Chicken agility course. \U0001f413\xa0The ending is the best! [<a href="https://www.facebook.com/sarah.koski.37/videos/525054834317512/" target="_blank">via Facebook</a>]</p>',
             u'content_raw': u'<p>Chicken agility course. \U0001f413\xa0The ending is the best! [<a href="https://www.facebook.com/sarah.koski.37/videos/525054834317512/" target="_blank">via Facebook</a>]</p>',
             u'is_current_item': True,
             u'is_root_item': True,
             u'post': {u'id': 137363180405}}],
 u'type': u'video',
 u'video_type': u'tumblr',
 u'video_url': u'https://vt.tumblr.com/tumblr_o10fwitAfe1s9rrcg.mp4'}

 """
