
{% from "python/map.jinja" import python with context %}
{% set user = 'vagrant' %}
{% set home = '/home/%s'|format(user) %}
{% set envpath = '%s/project-env'|format(home)  %}


include:
  - vim
  - build-tools
  - python.virtualenv
  - ruby
  - node
  - node.requirejs
  - redis
  - heroku
  - git
  - rabbitmq
  - memcached
  - postgresql
  - postgresql.dev
  

app.virtualenv:
  virtualenv.managed:
    - name: {{ envpath }}
    - user: {{ user }}
    - require:
      - pip: python.virtualenv

app.gevent.libevent:
  pkg:
    - installed
    - name: {{ python.libevent_dev }}

app.heroku.path:
  cmd.wait_script:
    - source: salt://heroku/files/add_to_path.py
    - user: vagrant
    - args: {{ home }}
    - require:
      - pkg: python.core
    - watch:
      - cmd: heroku.core

app.ps1:
  file.append:
    - name: "/home/{{ user }}/.bashrc"
    - text: |
            purple='\[\e[0;35m\]'
            yellow='\[\e[0;33m\]'
            Bwhite='\[\e[0;37m\]'
            reset='\[\e[0m\]'
            export  PS1="\[[${purple}\u@\h ${Bwhite}\w${reset}\$(__git_ps1 \" (${yellow}%s${reset})\")]\n\$(date +%H:%M) \$ "

app.cdwww:
  file.append:
    - name: "/home/{{ user }}/.bashrc"
    - text: 'cd /var/www'

app.virtualenv.source:
  file.append:
    - name: "/home/{{ user }}/.bashrc"
    - text: "source {{ envpath }}/bin/activate"
    - require:
      - virtualenv: app.virtualenv
      - file: app.cdwww
      - file: app.ps1

app.pip.install:
  pip:
    - installed
    - name: requirements
    - requirements: /var/www/requirements/local.txt
    - bin_env: {{ envpath }}
    - exists_action: w
    - require:
      - pkg: build-tools.core
      - pkg: postgresql.dev
      - virtualenv: app.virtualenv
      - pkg: app.gevent.libevent
      - pkg: app.memcachedev.install
      - file: app.ps1

app.compassremove:
  gem:
    - removed
    - name: compass

app.compass:
  gem:
    - installed
    - name: compass
    - version: 1.0.3
    - require:
        - gem: app.compassremove

app.susy:
  gem:
    - installed
    - name: susy
    - require:
      - pkg: ruby.gem

app.breakpoint:
  gem:
    - installed
    - name: breakpoint
    - require:
      - pkg: ruby.gem

app.memcachedev.install:
  pkg:
     - installed
     - name: libmemcached-dev


