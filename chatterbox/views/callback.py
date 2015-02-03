from chatterbox.models import Client, Key


def callback(request):
    # expected_state = request.session.get('chatterbox_state', None)
    # request.session.pop('chatterbox_state', None)

    # query_state = request.GET.get('state', None)
    # import pdb; pdb.set_trace()

    # candidate_state, client_uuid = query_state.split('|')
    client_uuid = request.session.pop('client_uuid', None)
    client = None

    # code = None
    # error = request.GET.get('error', None)

    # if error:
    #     # User declined authentication
    #     # TODO Add Error Handling
    #     print("USER DECLIEND AUTH!!!!!")
    #     pass

    # if candidate_state != expected_state:
    #     # potential CSRF, bail out.
    #     # TODO Add ERROR Handling
    #     print("CSRF!!!!!! OH NO!!!")
    #     pass
    try:
        client = Client.objects.select_related("service").get(uuid=client_uuid)
    except:
        print("ERROR!!!!!!!! INVALID CLIENT")
        # TODO Add Error Handling, invalid client
        pass

    # code = request.GET.get('code', None)

    # if code is None:
    #     # TODO Bail out, we didn't get a code back from the
    #     # provider, nothing we can do here.
    #     pass

    driver = client.driver
    driver.request = request

    # TODO try/except this...
    data = driver.callback(request.GET, client.redirect_url)

    key = Key.objects.create(
        access_token=data["access_token"],
        expires=data.get("expires_at", None),
        refresh_token=data.get("refresh_token", None),
        client=client,
        service=client.service,
        user=request.user
    )

    api = key.api
    profile = api.simple_profile()

    key.service_username = profile.name
    key.service_user_id = profile.id
    key.save()
