import logging
import traceback


class InvalidHostHeaderFilter(logging.Filter):

    def filter(self, record):
        _filter = True
        traceback.format_exception(*record.exc_info)[-1]
        if record.exc_info is not None:
            if traceback.format_exception(*record.exc_info)[-1] \
                    .find('Invalid HTTP_HOST header') >= 0:
                _filter = False

        return _filter