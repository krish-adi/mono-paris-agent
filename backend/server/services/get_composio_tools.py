import json
import requests

import os


def get_apps():
    url = "https://backend.composio.dev/api/v1/apps"
    headers = {"x-api-key": os.getenv("COMPOSIO_API_KEY")}
    response = requests.request("GET", url, headers=headers)
    data = json.loads(response.text)
    filtered_data = [{"name": item["name"], "description": item["description"].replace("\t", "").replace("\n", "").strip()} for item in data["items"]]

    # pprint(filtered_data)
    return filtered_data