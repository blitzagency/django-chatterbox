from fabric.api import local
from fabric.tasks import Task

from vagrant import collectstatic, css_compile, killall
from fabric.colors import red, green, yellow

from agency_vars import with_vars, APP_INFO


import logging
logging.basicConfig()
log = logging.getLogger(__name__)

# suppress tasks
__all__ = []




def get_hash(env):
    # print red("CHECKING OUT BRANCH: {}".format(APP_INFO[env]["branch_name"]))
    # local('git checkout {}'.format(APP_INFO[env]["branch_name"]))
    return local('git rev-parse HEAD', capture=True).strip()[:20]

def get_heroku_asset_version(env):
    git_hash = local('heroku config:get ASSET_VERSION -a {}'.format(APP_INFO[env]["heroku_app_name"]), capture=True)
    print "got hash: ", yellow('{}'.format(git_hash))
    return git_hash


def set_heroku_asset_version(env, git_hash):
    local('heroku config:set ASSET_VERSION={} -a {}'.format(git_hash, APP_INFO[env]["heroku_app_name"]))

def set_heroku_maintenance_page(env, url):
    local('heroku config:set MAINTENANCE_PAGE_URL={} -a {}'.format(url, APP_INFO[env]["heroku_app_name"]))

def set_heroku_error_page(env, url):
    local('heroku config:set ERROR_PAGE_URL={} -a {}'.format(url, APP_INFO[env]["heroku_app_name"]))


def current_asset_version(env, ):
    return get_hash(env)



class CustomTask(Task):

    def __init__(self, func, env, *args, **kwargs):
        super(CustomTask, self).__init__(*args, **kwargs)
        self.func = func
        self.env = env
        self.name = func.__name__
        self.__doc__ = func.__doc__

    def run(self, *args, **kwargs):
        if 'env' not in kwargs:
            kwargs['env'] = self.env
        return self.func(*args, **kwargs)



def deploy(env=None, quick=False):
    """Deploy static and source to heroku environment"""
    local('sudo ntpdate -u 0.pool.ntp.org')
    local('pip install -r requirements/production.txt')
    version = get_heroku_asset_version(env) if quick else current_asset_version(env=env)
    current_branch = local('git rev-parse --abbrev-ref HEAD',capture=True)
    if current_branch != APP_INFO[env]['branch_name']:
        print red("NOT ON DESIRED DEPLOY BRANCH: {}".format(APP_INFO[env]["branch_name"]))
    compile_env_css(env=env, asset_version=version)
    deploy_static_media(env=env, asset_version=version, quick=quick)
    deploy_maintenance_pages(env=env, asset_version=version, quick=quick)
    deploy_source(env=env, asset_version=version, quick=quick)
    clear_cache(env=env, asset_version=version, quick=quick)

@with_vars
def deploy_maintenance_pages(env=None, asset_version='', quick=False, agency_vars={}):
    url = "{}error.html".format(agency_vars['STATIC_URL'])
    print(agency_vars)
    set_heroku_error_page(env, url)
    set_heroku_maintenance_page(env, url)

@with_vars
def deploy_source(env=None, asset_version='', quick=False, agency_vars={}):
    """Deploy source to heroku environment"""
    print green('Deploying source to Heroku')
    local('git push {} {}:master'.format(APP_INFO[env]["heroku_remote_name"], APP_INFO[env]["branch_name"]))
    sync_prod_db(env=env)
    if not quick:
        set_heroku_asset_version(env, asset_version)

@with_vars
def clear_cache(env=None, asset_version='', quick=False, agency_vars={}):
    local('heroku run ./manage.py clear_cache -a {}'.format(APP_INFO[env]["heroku_app_name"]))

@with_vars
def deploy_static_media(env=None, asset_version='', quick=False, agency_vars={}):
    """Deploy static (runs collectstatic within given environment)"""
    print green('Deploying static media {}'.format('__quick__' if quick else ''))
    collectstatic(no_input=True, skip_admin=quick)


@with_vars
def deploy_user_media(env=None, agency_vars={} ):
    """Deploy user media to media location on s3"""
    print green('Deploying user media')
    local('./manage.py sync_media_s3 --prefix=uploads')


@with_vars
def sync_prod_db(env=None, reset_db=False, agency_vars={}):
    """Run syncdb and migrate within given environment"""
    print green('sync/migrate DB')
    if reset_db:
        # uncomment below and replace DATABSE_URL with the prod database url
        # note that this is destructive of the PROD DB
        #local('heroku pg:reset DATABASE_URL') #add "--confirm haus" to remove required input
        pass
    local('heroku run ./manage.py syncdb -a {}'.format(APP_INFO[env]["heroku_app_name"]))
    local('heroku run ./manage.py migrate -a {}'.format(APP_INFO[env]["heroku_app_name"]))

@with_vars
def compile_env_css(env=None, asset_version='', agency_vars={}):
    log.warning(red('Calling killall,  all process will be killed!'))
    killall()
    css_compile()
    log.warning(red('Note killall was called so vagrant server/compass will be down'))