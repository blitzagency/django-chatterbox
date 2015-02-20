import json
import os.path
import mock


def mock_request_response():
    response = mock.Mock()
    request = mock.Mock(return_value=response)

    return request, response


def mock_json_response(response, data):
    response.content = data
    response.json = mock.Mock(return_value=json.loads(data))

    return response


def mock_request_with_json_response(data):
    request, response = mock_request_response()
    mock_json_response(response, data)

    return request


def mock_request_with_json_response_from_file(filename):
    data = load_data(filename)
    return mock_request_with_json_response(data)


def load_data(name):
    data = None

    if not name.endswith(".json"):
        name = "{}.json".format(name)

    tests_folder = os.path.dirname(os.path.realpath(__file__))
    path = os.path.join(tests_folder, "data", name)

    with open(path) as f:
        data = f.read()

    return data


def load_json(name):
    return json.loads(load_data(name))
