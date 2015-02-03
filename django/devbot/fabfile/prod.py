from heroku import CustomTask, deploy, deploy_source, deploy_static_media, deploy_user_media, sync_prod_db

deploy = CustomTask(deploy, 'prod')
deploy_source = CustomTask(deploy_source, 'prod')
deploy_static_media = CustomTask(deploy_static_media, 'prod')
deploy_user_media = CustomTask(deploy_user_media, 'prod')
sync_prod_db = CustomTask(sync_prod_db, 'prod')