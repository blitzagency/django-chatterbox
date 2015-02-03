from heroku import CustomTask, deploy, deploy_source, deploy_static_media, deploy_user_media, sync_prod_db

deploy = CustomTask(deploy, 'dev')
deploy_source = CustomTask(deploy_source, 'dev')
deploy_static_media = CustomTask(deploy_static_media, 'dev')
deploy_user_media = CustomTask(deploy_user_media, 'dev')
sync_prod_db = CustomTask(sync_prod_db, 'dev')