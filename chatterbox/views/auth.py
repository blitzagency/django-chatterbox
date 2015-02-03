import json
from django.http import JsonResponse
from django.shortcuts import redirect
from oauthlib.common import generate_token
from chatterbox.models import Client


def authorize(request, uuid):
    client = None

    try:
        client = Client.objects.select_related('service').get(uuid=uuid)
    except:
        return JsonResponse({"error": True})

    driver = client.driver
    driver.request = request

    redirect_url = request.GET.get("redirect_url", None)
    scopes = request.GET.getlist("scope[]", None)
    scopes = [x for x in scopes if x != "None"]

    request.session['client_uuid'] = uuid
    url = driver.get_authorize_url(redirect_url, scopes)

    return redirect(url)
