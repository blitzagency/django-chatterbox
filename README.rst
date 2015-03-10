Django Chatterbox: Social listening made easy
=========================

.. image:: https://img.shields.io/pypi/v/django-chatterbox.svg
    :target: https://pypi.python.org/pypi/django-chatterbox

.. image:: https://img.shields.io/pypi/dm/django-chatterbox.svg
        :target: https://pypi.python.org/pypi/django-chatterbox


Django Chatterbox is an Apache2 Licensed Social aggregation tool written with
modularity in mind.

Aggregating content from multiple social networks is not so much fun.  First
you have to handle OAuth, then acquiring keys, managing keys, writing api's
to get data out of each social network, and then once you have it all, each
social activity looks different.

This is a pain...a huge pain.

Enter Django Chatterbox.  Chatterbox handles all of the oauth, keys, job
creation, api's, response iteration, and normalizing for you.  All you have to
provide is a social network key/secret, and Django Chatterbox does the rest.

Installation
=============

Install using `pip`...

.. code-block:: bash

    pip install django-chatterbox

Add `'chatterbox'` to your `INSTALLED_APPS` setting.

.. code-block:: python

    INSTALLED_APPS = (
        ...
        'chatterbox',
    )


Append urls to urls.py

.. code-block:: python

    urlpatterns = patterns(
        ...
        `(r'^chatterbox/', include('chatterbox.urls', namespace="chatterbox")),`
        ...
    )


EXAMPLE TIME!!
=============


Video demo here_.

.. _here: https://www.youtube.com/embed/g5q4FBLctvE

or:

- Go to instagram: https://instagram.com/developer/clients/manage/ and register an App
- Once you have the app created, go here: `/admin/chatterbox/client/add/`
- Fill out all Client model info using key/secret from instagram.com
- Once the Model is created, click on it in the admin. It should look like this:
.. image:: https://www.evernote.com/shard/s503/sh/e3a0b4d3-8445-4e0e-953c-b170015f5c79/04111dcbb150cd0eb0c41bb760b224fe/deep/0/Change-client---Django-site-admin.png

- Select the permissions you require (most likely just read permissions)
- Click 'get authorization'
- Follow the prompts redirecting you back to the admin
- You now have a key model added to the admin
- Next lets create a job, go here: `/admin/chatterbox/job/add/`
- Select Instagram, Instagram tag search, highlight your key, and add a search term
- You now have everything you need to run a job.  Lets execute it!

.. code-block:: python

    ./manage.py shell
    from chatterbox.models import Job
    jobs = Job.objects.all()
    job = jobs[0]
    job.run()
    # you will see...lots of stuff happen :)



How does it work?
==========================

Chatterbox comes with a few built in models and features.  Here is a
quick run down of what you all get...

Services
--------
A service is basically a social network and it's associated interactions.
Chatterbox ships with 4 services out the box: Facebook, Twitter, Instagram,
and YouTube.  Additional services will likely be added but this is what
comes for free atm.

Each service has an associated driver which is the underlying code used
to interact with that social nework.

Clients
--------
If you have ever worked with any of the social networks you know that
to interact with it, you need to go grab a key/secret for that social
network.  Chatterbox clients are the model representation of that key and
secret.

Keys
-----
Keys are the result of a client and a user.  Once a Client is created,
you use that client to authenticate a user and create a key.  This key
has an access token attribute on it used to make outgoing requests.

Collectors
-----
Chatterbox ships with a few built in collectors.  Think of collectors as
the thing that goes out, collects the social activites, and then saves them.
For every social networks possible collection point, we have build out a
collector.  ex: i want to search instagram for all activites flagged with
the hash #cheese.  This would use the collector 'Instagram Tag Search'


Jobs
-----
A job is everything you need to go out, grab data, and bring it back.
A job holds a collector, key, and any associated arguments needed to
query that social network.

Activities
----------
Activities are what is returned from each social network.  It holds a
normalized 'blob' object on it (among other things) that can be used
to access all associated social response
