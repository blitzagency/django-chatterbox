mysql:
  grants:
    - user: vagrant
      host: localhost
      grant: all privileges
      database: django.*
    - user: vagrant
      host: '%'
      grant: all privileges
      database: django.*

  users:
    vagrant:
      - host: localhost
        password: vagrant

      - host: '%'
        password: vagrant

  databases:
    django: