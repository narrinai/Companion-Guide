#!/usr/bin/env python3
"""
Quick check of NL my_verdict translation status
"""

import os
import requests

AIRTABLE_TOKEN = os.getenv('AIRTABLE_TOKEN_CG')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID_CG')
TRANSLATIONS_TABLE_NAME = 'Companion_Translations'

API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{TRANSLATIONS_TABLE_NAME}'
headers = {
    'Authorization': f'Bearer {AIRTABLE_TOKEN}',
    'Content-Type': 'application/json'
}

# Fetch all NL records
records = []
offset = None
filter_formula = "{language} = 'nl'"

while True:
    params = {'filterByFormula': filter_formula, 'fields[]': ['name', 'slug', 'my_verdict']}
    if offset:
        params['offset'] = offset

    response = requests.get(API_URL, headers=headers, params=params)
    data = response.json()
    records.extend(data.get('records', []))

    offset = data.get('offset')
    if not offset:
        break

print(f"Total NL records: {len(records)}\n")

# Check which need translation
needs_translation = []
completed = []

for record in records:
    fields = record['fields']
    name = fields.get('name', 'Unknown')
    slug = fields.get('slug', 'unknown')
    verdict = fields.get('my_verdict', '')

    if not verdict or len(verdict.strip()) < 100:
        needs_translation.append((name, slug, len(verdict)))
    else:
        completed.append((name, slug, len(verdict)))

print("=" * 70)
print(f"✅ COMPLETED: {len(completed)} records")
print("=" * 70)
for name, slug, length in completed:
    print(f"  ✓ {name:30} ({slug:25}) - {length:6} chars")

print()
print("=" * 70)
print(f"⏳ NEED TRANSLATION: {len(needs_translation)} records")
print("=" * 70)
for name, slug, length in needs_translation:
    print(f"  ⚠️  {name:30} ({slug:25}) - {length:6} chars")

print()
print(f"Progress: {len(completed)}/{len(records)} ({100*len(completed)//len(records)}%)")
