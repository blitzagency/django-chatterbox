from os import path
from fabric.api import local, lcd, task, settings, hide
from fabric.colors import yellow

from agency_vars import with_vars

import logging
logging.basicConfig()
log = logging.getLogger(__name__)

# paths
base_path = "./project/static"
css_path = base_path + "/css/"
config_path = "./config.rb"

# sass execs
exec_sass_watch = "nohup compass watch --poll {} -c {} 2>/dev/null &"
exec_sass_compile = "compass compile {} -c {} --trace --force -s compressed"


@task
@with_vars
def env_test():
    local('env | grep AGENCY')


@task
def runall():
    local('touch nohup.out')
    # celery()
    # celerybeat()
    css_watch()
    runserver()
    log.warning(yellow('\n\n\nRun `fab vagrant.console_log` to monitor log.'))


@task
def killall():
    log.warning(yellow('\n\nKilling all processes'))
    with settings(
        hide('warnings', 'running', 'stdout', 'stderr'),
        warn_only=True
    ):
        local("pkill -9 -f '[m]anage.py runserver'")
        local("pkill -9 -f '[m]anage.py run_gunicorn'")
        local("pkill -9 -f '[c]elery -A project worker -l info'")
        local("pkill -9 -f '[c]elery -A project beat'")
        local("pkill -9 -f 'compass'")
        local("pkill -9 -f '[m]anage.py compass'")
        local("pkill -9 -f '[m]anage.py sass'")


@task
def console_log():
    local('tail -f nohup.out')


@task
def runserver():
    with settings(
        hide('warnings', 'running', 'stdout', 'stderr'),
        warn_only=True
    ):
        local("pkill -9 -f '[m]anage.py runserver'")
    local('nohup ./manage.py runserver [::]:8000 &')


@task
def gunicorn():
    with settings(
        hide('warnings', 'running', 'stdout', 'stderr'),
        warn_only=True
    ):
        local("pkill -9 -f '[m]anage.py run_gunicorn'")
    local('nohup ./manage.py run_gunicorn [::]:8000 &')


@task
def celery():
    with settings(
        hide('warnings', 'running', 'stdout', 'stderr'),
        warn_only=True
    ):
        local("pkill -9 -f '[c]elery -A project worker -l info'")
    local('nohup celery -A project worker -l info &')


@task
def celerybeat():
    with settings(
        hide('warnings', 'running', 'stdout', 'stderr'),
        warn_only=True
    ):
        local("pkill -9 -f '[c]elery -A project beat'")
    local('nohup celery -A project beat -l info &')


@task
def initdb(load_images=False):
    local('yes no | python manage.py syncdb')
    local('python manage.py migrate')
    local('python manage.py createsuperuser')
    local('python ./manage.py loaddata ./project/apps/chatterbox/fixtures.json')

    if load_images:
        load_fixture_images()


@task
def syncdb():
    local('python manage.py syncdb')
    local('python manage.py migrate')


@task
def resetall():
    """Stop all services, destroy the database, restore it from fixtures, \
    remove all files in uploads directory and download assets."""
    killall()
    local('vagrant provision')
    resetdb(delete_images=True, load_images=True)


@task
def resetdb(load_images=False, delete_images=False):
    killall()

    local('dropdb django')
    local('createdb django')
    local('dropdb django')
    local('createdb django')

    # To use MySQL, comment the lines above and uncomment the lines below.
    # local("mysql -u vagrant -pvagrant -e 'drop database if exists django'")
    # local('mysql -u vagrant -pvagrant -e "create database django"')
    if delete_images:
        local("mkdir -p ./uploads")
        with lcd("./uploads"):
            local('rm -rf ./*')

    initdb(load_images)


@task
def load_fixture_images():
    # basic media fixture stub
    uploads_dir = path.abspath(path.join(path.dirname(__file__), '../uploads'))
    with lcd(uploads_dir):
        with settings(warn_only=True):
            local('rm -rf ./*')
        #local('curl -sLO https://domain/assets.tar.bz2')
        #local('tar xjvf assets.tar.bz2')
        #local('rm assets.tar.bz2')


@task
def collectstatic(no_input=False, skip_admin=False):
    local('python manage.py collectstatic {} {}'.format(
        '--noinput' if no_input else '',
        '-i "admin*" -i "grappelli*"' if skip_admin else ''))


@task
def css_watch(new_config=None):
    with settings(
        hide('warnings', 'running', 'stdout', 'stderr'),
        warn_only=True
    ):
        local("pkill -9 -f '[c]ompass'")
    local(exec_sass_watch.format(base_path, config_path))


@task
def pipinstall():
    local('/home/vagrant/.venv/bin/pip install \
        --use-mirrors -r ./requirements/local.txt')


@task
def css_compile():
    local(exec_sass_compile.format(base_path, config_path))


@task
def test():
    local('python manage.py test')
