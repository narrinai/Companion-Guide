#!/usr/bin/env python3
"""
Remove Claude meta-text from all NL my_verdict fields
"""

import os
import requests
import time
import re

AIRTABLE_TOKEN = os.getenv('AIRTABLE_TOKEN_CG')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID_CG')
API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/Companion_Translations'
headers = {
    'Authorization': f'Bearer {AIRTABLE_TOKEN}',
    'Content-Type': 'application/json'
}

def clean_meta_text(text):
    """Remove Claude's meta-text from translation"""

    # Patterns to remove from START of text
    start_patterns = [
        r"^Here's the Dutch translation.*?:\s*\n+",
        r"^Here is the Dutch translation.*?:\s*\n+",
        r"^Hier is de Nederlandse vertaling.*?:\s*\n+",
    ]

    # Patterns to remove from END of text
    end_patterns = [
        r"\n*\[Note:.*?\]\s*$",
        r"\n*\[Continue.*?\]\s*$",
        r"\n*\[Would you like.*?\]\s*$",
        r"\n*\[Bericht me.*?\]\s*$",
    ]

    cleaned = text

    # Remove from start
    for pattern in start_patterns:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE | re.DOTALL)

    # Remove from end
    for pattern in end_patterns:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE | re.DOTALL)

    # Remove multiple consecutive newlines
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)

    return cleaned.strip()

print("🧹 Scanning all NL my_verdict fields for meta-text...")
print("=" * 70)

# Fetch all records
all_records = []
offset = None

while True:
    params = {}
    if offset:
        params['offset'] = offset

    response = requests.get(API_URL, headers=headers, params=params)
    data = response.json()
    all_records.extend(data.get('records', []))

    offset = data.get('offset')
    if not offset:
        break

    time.sleep(0.2)

# Filter NL records
nl_records = [r for r in all_records if r['fields'].get('language') == 'nl']

print(f"Found {len(nl_records)} NL records\n")

updated_count = 0
clean_count = 0

for record in nl_records:
    fields = record['fields']

    name_field = fields.get('name (from companion)', [])
    name = name_field[0] if isinstance(name_field, list) and name_field else 'Unknown'

    verdict = fields.get('my_verdict', '')

    if not verdict:
        continue

    # Clean the verdict
    cleaned = clean_meta_text(verdict)

    if cleaned != verdict:
        print(f"🧹 {name:30} - Cleaning meta-text")
        print(f"   Before: {len(verdict)} chars")
        print(f"   After:  {len(cleaned)} chars")

        # Update record
        url = f'{API_URL}/{record["id"]}'
        data = {'fields': {'my_verdict': cleaned}}
        response = requests.patch(url, headers=headers, json=data)

        if response.status_code == 200:
            print(f"   ✅ Updated")
            updated_count += 1
        else:
            print(f"   ❌ Update failed: {response.status_code}")

        time.sleep(0.3)
    else:
        clean_count += 1

print()
print("=" * 70)
print(f"✅ Cleanup completed!")
print(f"   Cleaned:  {updated_count} records")
print(f"   Already clean: {clean_count} records")
print(f"   Total:    {len(nl_records)} records")
print("=" * 70)
