#!/usr/bin/env python3
"""Test script to check pricing_plans structure"""
import os
import json
from pyairtable import Api

# Initialize Airtable
AIRTABLE_PAT = os.getenv('AIRTABLE_PAT')
BASE_ID = 'appQujAKR9hjDLN7I'
api = Api(AIRTABLE_PAT)

# Get tables
companions_table = api.table(BASE_ID, 'Companions')
translations_table = api.table(BASE_ID, 'Companion_Translations')

# Get one record to see structure
record = companions_table.first()
if record:
    fields = record['fields']
    if 'pricing_plans' in fields:
        print("English pricing_plans structure:")
        print(json.dumps(fields['pricing_plans'], indent=2))
        print("\n" + "="*50 + "\n")

# Get a translation record
trans_record = translations_table.first()
if trans_record:
    fields = trans_record['fields']
    print("Translation record fields:")
    print(json.dumps({k: v for k, v in fields.items() if 'pricing' in k.lower()}, indent=2))
