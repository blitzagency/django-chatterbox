class ChatterboxException(Exception):
    pass


class RateLimitException(ChatterboxException):
    pass


class KeyInvalidationException(ChatterboxException):
    pass
