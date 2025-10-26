#!/usr/bin/env python3
import os
import requests

AIRTABLE_TOKEN = os.getenv('AIRTABLE_TOKEN_CG')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID_CG')
API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/Companion_Translations'

headers = {'Authorization': f'Bearer {AIRTABLE_TOKEN}'}

response = requests.get(f'{API_URL}?maxRecords=1&filterByFormula={{language}}="nl"', headers=headers)
data = response.json()

if data.get('records'):
    fields = data['records'][0]['fields']
    print("Available fields in Companion_Translations (NL):")
    print("=" * 60)
    for field_name, value in sorted(fields.items()):
        value_preview = str(value)[:100] if value else "(empty)"
        print(f"  {field_name}: {value_preview}")
