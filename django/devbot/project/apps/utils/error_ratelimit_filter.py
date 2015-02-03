
# Based on code from: http://djangosnippets.org/snippets/2242/

import traceback
try:
    from hashlib import md5
except ImportError:
    from md5 import md5
from datetime import datetime, timedelta


class RateLimitFilter(object):
    
    _errors = {}
        
    def filter(self, record):
        from django.conf import settings
        from django.core.cache import cache                               

        # Track duplicate errors
        duplicate = False
        rate = getattr(settings, 'ERROR_RATE_LIMIT', 10)  # seconds

        if rate > 0:
            if record.exc_info is not None:
                tb = '\n'.join(traceback.format_exception(*record.exc_info))
            else:
                tb = '{} {} {}'.format(record.name, record.msg, record.args)
            
            key = md5(tb).hexdigest()
            prefix = getattr(settings, 'ERROR_RATE_CACHE_PREFIX', 'ERROR_RATE')

            # Test if the cache works
            cache_key = '%s_%s' % (prefix, key)
            try:
                cache.set(prefix, 1, 1)
                use_cache = cache.get(prefix) == 1
            except:
                use_cache = False

            # debugging purposes...
            #print "Error Rate Limit: {} Error Prefix: {} Use Cache: {} Key: {}".format(rate, prefix, use_cache, key)
            
            if use_cache:
                duplicate = cache.get(cache_key) == 1
                if not duplicate:
                    cache.set(cache_key, 1, rate)
            else:
                min_date = datetime.now() - timedelta(seconds=rate)
                max_keys = getattr(settings, 'ERROR_RATE_KEY_LIMIT', 100)
                duplicate = (key in self._errors and self._errors[key] >= min_date)
                self._errors = dict(filter(lambda x: x[1] >= min_date, 
                                          sorted(self._errors.items(), 
                                                 key=lambda x: x[1]))[0-max_keys:])
                if not duplicate:
                    self._errors[key] = datetime.now()

            # debugging purposes...
            #print "Duplicate: {}".format(duplicate)
        return not duplicate