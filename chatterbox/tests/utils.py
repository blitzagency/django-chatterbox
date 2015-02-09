import json
import os.path


def load_json(name):
    data = None

    if not name.endswith(".json"):
        name = "{}.json".format(name)

    tests_folder = os.path.dirname(os.path.realpath(__file__))
    path = os.path.join(tests_folder, "data", name)

    with open(path) as data_file:
        data = json.load(data_file)

    return data
