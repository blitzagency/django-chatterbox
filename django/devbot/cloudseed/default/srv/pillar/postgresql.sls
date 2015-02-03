postgresql:
  users:
    vagrant:
      password: vagrant
      createdb: true

  databases:
    django:
      owner: vagrant

  hba:
   - type: local
     database: django
     user: vagrant
     method: ident

   - type: local
     database: postgres
     user: vagrant
     method: ident

   - type: host
     database: django
     user: vagrant
     address: 0.0.0.0/0
     method: md5
