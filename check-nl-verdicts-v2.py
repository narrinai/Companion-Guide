#!/usr/bin/env python3
"""
Check NL my_verdict translation status
"""

import os
import requests
import time

AIRTABLE_TOKEN = os.getenv('AIRTABLE_TOKEN_CG')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID_CG')
API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/Companion_Translations'
headers = {'Authorization': f'Bearer {AIRTABLE_TOKEN}'}

print("📥 Fetching all Companion_Translations records...")

# Fetch all records
all_records = []
offset = None

while True:
    params = {}
    if offset:
        params['offset'] = offset

    response = requests.get(API_URL, headers=headers, params=params)

    if response.status_code != 200:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        break

    data = response.json()
    all_records.extend(data.get('records', []))

    offset = data.get('offset')
    if not offset:
        break

    time.sleep(0.2)

print(f"✅ Fetched {len(all_records)} total records\n")

# Filter for NL records
nl_records = []
for record in all_records:
    fields = record['fields']
    lang = fields.get('language', '')

    if lang == 'nl':
        nl_records.append(record)

print(f"Found {len(nl_records)} NL records\n")

# Check status
needs_translation = []
completed = []

for record in nl_records:
    fields = record['fields']

    # Get name and slug from lookup fields
    name_field = fields.get('name (from companion)', [])
    slug_field = fields.get('slug (from companion)', [])

    name = name_field[0] if isinstance(name_field, list) and name_field else 'Unknown'
    slug = slug_field[0] if isinstance(slug_field, list) and slug_field else 'unknown'

    verdict = fields.get('my_verdict', '')

    if not verdict or len(verdict.strip()) < 100:
        needs_translation.append((name, slug, len(verdict), record['id']))
    else:
        completed.append((name, slug, len(verdict)))

print("=" * 80)
print(f"✅ COMPLETED: {len(completed)} records")
print("=" * 80)
for name, slug, length in sorted(completed):
    print(f"  ✓ {name:30} ({slug:30}) - {length:6,} chars")

if needs_translation:
    print()
    print("=" * 80)
    print(f"⏳ NEED TRANSLATION: {len(needs_translation)} records")
    print("=" * 80)
    for name, slug, length, rec_id in sorted(needs_translation):
        print(f"  ⚠️  {name:30} ({slug:30}) - {length:6} chars")

    print("\nRecord IDs to translate:")
    for name, slug, length, rec_id in needs_translation:
        print(f"  {slug}: {rec_id}")

print()
print(f"Progress: {len(completed)}/{len(nl_records)} ({100*len(completed)//len(nl_records) if nl_records else 0}%)")
