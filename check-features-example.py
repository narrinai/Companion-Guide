#!/usr/bin/env python3
"""Quick script to check current features structure"""

import os
import json
import requests

AIRTABLE_TOKEN = os.getenv('AIRTABLE_TOKEN_CG')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID_CG')
API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/Companion_Translations'

headers = {
    'Authorization': f'Bearer {AIRTABLE_TOKEN}',
}

response = requests.get(f'{API_URL}?maxRecords=3', headers=headers)
data = response.json()

for record in data.get('records', []):
    fields = record['fields']
    name = fields.get('name', 'Unknown')
    lang = fields.get('language', 'en')
    features = fields.get('features')
    
    print(f"\n{'='*60}")
    print(f"Companion: {name} ({lang})")
    print(f"{'='*60}")
    
    if features:
        if isinstance(features, str):
            try:
                features_parsed = json.loads(features)
                print(json.dumps(features_parsed, indent=2, ensure_ascii=False))
            except:
                print(f"String (not JSON): {features[:200]}...")
        else:
            print(json.dumps(features, indent=2, ensure_ascii=False))
    else:
        print("No features field")
    
    break  # Just show first one with features

