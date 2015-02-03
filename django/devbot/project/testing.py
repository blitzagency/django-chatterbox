import sys
import os
import logging
import unittest
import re
from cStringIO import StringIO

import coverage

from django.test.simple import DjangoTestSuiteRunner
from django.core.management.validation import get_validation_errors
from django.conf import settings

def is_in_packages(name, packages):
    for package in packages:
        if name == package or name.startswith(package + "."):
            return True
    return False

def report_coverage(packages):
    test_re = re.compile('.+test[^%s.]*\..+' % os.sep)
    coverage.stop()
    files = set()
    for name in sys.modules:
        mod = sys.modules.get(name)
        if mod == None:
            continue
        elif not is_in_packages(name, packages):
            continue
        elif is_in_packages(name, ['django']):
            continue

        filename = mod.__file__.replace('.pyc', '.py')

        if test_re.match(filename):
            continue

        st = os.stat(filename)
        if st.st_size > 1:
            files.add(filename)

    if files:
        coverage.report(list(files))
    coverage.erase()

class TestRunner(DjangoTestSuiteRunner):

    def run_tests(self, test_labels, extra_tests=[], **kwargs):

        # Shutup console logs
        logger = logging.getLogger()
        for h in logger.handlers:
            logger.removeHandler(h)

        import coverage
        coverage.erase()
        coverage.start()

        # If test_labels let django handle it
        if test_labels:
            return super(TestRunner, self).run_tests(test_labels, extra_tests)

        # Validate models
        s = StringIO()
        num_errors = get_validation_errors(s)
        if num_errors:
            raise Exception("%s error%s found:\n%s" %
                (num_errors, num_errors != 1 and 's' or '', s.getvalue()))

        # Use discover to find all the local tests
        loader = unittest.TestLoader()
        base = os.path.abspath(os.path.dirname(__file__))
        if not extra_tests:
            extra_tests = []

        tests = loader.discover(base)
        suite = unittest.TestSuite()
        if extra_tests:
            suite.addTests(extra_tests)
        suite.addTests(tests)

        local_dirs = [x for x in os.listdir(base) if os.path.isdir(os.path.join(base,x))]
        local_dirs.extend([x for x in os.listdir(os.path.join(base, 'apps')) \
                                if os.path.isdir(os.path.join(base,'apps', x))])

        self.setup_test_environment()
        old_config = self.setup_databases()
        result = self.run_suite(suite)
        self.teardown_databases(old_config)
        self.teardown_test_environment()

        result = self.suite_result(suite, result)

        if not result and self.verbosity >= 1:
            report_coverage(local_dirs)

        return result