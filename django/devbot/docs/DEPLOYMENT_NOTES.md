# Deployment Notes



Project specific instructions would be included in this file as well.

-----

# Ensure you are logged in
```
vagrant ssh
heroku login
heroku keys:add
```

# Heroku quick start
- create your heroku app,
- setup the DJANGO_SETTINGS_MODULE to heroku to use the project.settings.prod settings file.
- create a dev db (or provision a larger db as necessary
- promote db to be default
- deploy to heroku
- syncdb (this step will require creation of an admin user)
- page should serve



```
vagrant ssh
git add .
git commit -a -m 'initial commit'
heroku create app-name
heroku config:set DISABLE_COLLECTSTATIC=1
heroku config:set DJANGO_SETTINGS_MODULE=project.settings.prod
heroku config:set BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git
heroku addons:add heroku-postgresql:dev
heroku pg:promote HEROKU_POSTGRESQL_(use result from last command)
git push heroku master
heroku run ./manage.py syncdb
```


# setup app_info.json
Each heroku environment must have a corresponding entry in app_info.json.  This config file is responsible for defining the heroku app name, corresponding app_env name and git remote name.  This is used in the fab deploy scripts

```
{
	"dev": {
		"heroku_app_name": "app-name-dev",
		"APP_ENV": "heroku_dev",
		"heroku_remote_name": "dev"
	},
	"staging": {
		"heroku_app_name": "app-name-staging",
		"APP_ENV": "heroku_staging",
		"heroku_remote_name": "staging"
	},
	"prod": {
		"heroku_app_name": "app-name",
		"APP_ENV": "heroku",
		"heroku_remote_name": "production"
	}
}
```

# experimental deploy process
[labs-preboot](https://devcenter.heroku.com/articles/labs-preboot/)