from django.contrib.staticfiles.storage import CachedFilesMixin
from django.core.files.base import ContentFile

from storages.backends.s3boto import S3BotoStorage

from require.storage import OptimizedFilesMixin


class OptimizedCachedS3BotoStorage(OptimizedFilesMixin, CachedFilesMixin, S3BotoStorage):
    pass

class OptimizedS3BotoStorage(OptimizedFilesMixin, S3BotoStorage):
    pass

MediaRootS3BotoStorage  = lambda: S3BotoStorage(location='uploads')