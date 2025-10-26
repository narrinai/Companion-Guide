#!/usr/bin/env python3
import os
import json
import requests

# Use the correct env variable names
AIRTABLE_TOKEN = os.getenv('AIRTABLE_TOKEN_CG')
BASE_ID = os.getenv('AIRTABLE_BASE_ID_CG', 'appQujAKR9hjDLN7I')

if not AIRTABLE_TOKEN:
    print("Please set AIRTABLE_TOKEN_CG")
    exit(1)

headers = {
    'Authorization': f'Bearer {AIRTABLE_TOKEN}',
    'Content-Type': 'application/json'
}

# Get one companion record
url = f'https://api.airtable.com/v0/{BASE_ID}/Companions?maxRecords=1'
response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    if data['records']:
        record = data['records'][0]
        fields = record['fields']
        print(f"Companion: {fields.get('name', 'Unknown')}")
        print("\nPricing plans structure:")
        if 'pricing_plans' in fields:
            print(json.dumps(fields['pricing_plans'], indent=2))
        else:
            print("No pricing_plans field found")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
