postgresql:
  users:
    vagrant:
      password: vagrant
      createdb: true

  databases:
    django:
      owner: vagrant
    test_django:
      owner: vagrant

  hba:
   - type: local
     database: django
     user: vagrant
     method: ident

   - type: local
     database: test_django
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

   - type: host
     database: test_django
     user: vagrant
     address: 0.0.0.0/0
     method: md5
