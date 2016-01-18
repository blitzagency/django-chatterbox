import logging
import calendar
from datetime import datetime
from datetime import timedelta
import pytz


log = logging.getLogger(__name__)


def now():
    data = datetime.now(pytz.utc)
    return data - timedelta(microseconds=data.microsecond)


def timestamp_millis_to_datetime(timestamp):
    return datetime.fromtimestamp(float(timestamp / 1000.0), pytz.utc)


def datetime_to_timestamp_millis(obj):
    epoch = datetime.utcfromtimestamp(0).replace(tzinfo=pytz.utc)
    delta = obj - epoch
    return int(delta.total_seconds() * 1000.0)


def datetime_utc_to_pst(obj):
    return obj.astimezone(pytz.timezone("US/Pacific"))


def datetime_to_midnight(obj):
        details = obj.timetuple()
        hours_delta = -details.tm_hour
        minutes_delta = -details.tm_min
        seconds_delta = -details.tm_sec

        offset = timedelta(hours=hours_delta,
                           minutes=minutes_delta,
                           seconds=seconds_delta)

        return obj + offset


def datetime_to_timestamp(obj):
    return calendar.timegm(obj.timetuple())


def string_to_datetime(datetime_string):
    """
    Should be in the form:
    2012-08-29T04:00:00+0000

    This is the inverse of datetime_to_string
    """
    log.debug("Converting string: %s to datetime", datetime_string)
    dt = datetime.strptime(datetime_string, "%Y-%m-%dT%H:%M:%S+0000")
    return dt.replace(tzinfo=pytz.utc)


def datetime_to_string(obj):
    log.debug("Converting datetime to string: %s", obj)
    return obj.strftime("%Y-%m-%dT%H:%M:%S+0000")


def timestamp_to_datetime(timestamp):
    return datetime.fromtimestamp(float(timestamp), pytz.utc)


def aws_date_to_datetime(timestamp):
    """
    2013-04-22T17:24:39.000Z -> datetime()
    """

    log.debug("Converting aws date to datetime: %s", timestamp)
    return activity_stream_date_to_datetime(timestamp)


def twitter_date_to_datetime(timestamp):
    """
    Mon Mar 19 22:10:56 +0000 2012 -> datetime()
    """

    log.debug("Converting twitter date to datetime: %s", timestamp)
    dt = datetime.strptime(timestamp, "%a %b %d %H:%M:%S +0000 %Y")
    return dt.replace(tzinfo=pytz.utc)

def tumblr_date_to_datetime(timestamp):
    """
    2016-01-15 22:01:42 GMT -> datetime()
    """
    dt = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S GMT')
    return dt.replace(tzinfo=pytz.utc)


def activity_stream_date_to_datetime(timestamp):
    """
    2012-03-19T22:10:56.000Z -> datetime()
    """

    log.debug("Converting activity stream date to datetime: %s", timestamp)
    dt = datetime.strptime(timestamp, "%Y-%m-%dT%H:%M:%S.000Z")
    return dt.replace(tzinfo=pytz.utc)
