import logging
from chatterbox.models import Activity


log = logging.getLogger(__name__)


def activity_from_dict(data):
    log.debug("Converting Twitter dict to Activity Model")
    activity_dict = activity_dict_from_dict(data)
    return Activity.from_activity_dict(activity_dict)


def activity_dict_from_dict(blob):
    log.debug("Converting Twitter dict to activity dict: %s", blob)
    stream_object = {}
    import pdb; pdb.set_trace()

    return stream_object
