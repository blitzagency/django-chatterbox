'''
Created on Sep 26, 2013

@author: joshua
'''

from django.utils.cache import patch_response_headers

class CacheHeadersMiddleware(object):
    """ overrides all Cache-Control settings on responses and injects headers from django.utils.cach.patch_response_headers """

    def process_response(self, request, response):
        if request.method in ['GET', 'HEAD']:
            # dump current Cache-Control headers
            del response['Cache-Control']
            # inject headers
            patch_response_headers(response)

        return response