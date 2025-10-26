#!/usr/bin/env python3
"""
Check which NL/PT pricing_plans still contain English terms that should be translated
"""

import os
import json
import requests

AIRTABLE_TOKEN = os.getenv('AIRTABLE_TOKEN_CG')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID_CG')
TRANSLATIONS_TABLE_NAME = 'Companion_Translations'

if not AIRTABLE_TOKEN or not AIRTABLE_BASE_ID:
    print("❌ Error: AIRTABLE_TOKEN_CG and AIRTABLE_BASE_ID_CG must be set")
    exit(1)

API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{TRANSLATIONS_TABLE_NAME}'
headers = {
    'Authorization': f'Bearer {AIRTABLE_TOKEN}',
    'Content-Type': 'application/json'
}

# English terms that SHOULD be translated (not technical terms)
SHOULD_TRANSLATE = [
    'monthly', 'yearly', 'annually', 'per month', 'per year',
    'Unlimited messages', 'Limited messages',
    'messages per', 'credits per',
    'Cancel anytime', 'No ads', 'Ad-free',
    'Priority support', 'Customer support',
    'Includes', 'Access to', 'features included'
]

def fetch_all_records():
    """Fetch all records"""
    records = []
    offset = None

    while True:
        params = {}
        if offset:
            params['offset'] = offset

        response = requests.get(API_URL, headers=headers, params=params)

        if response.status_code != 200:
            print(f"❌ Error: {response.status_code}")
            return None

        data = response.json()
        records.extend(data.get('records', []))

        offset = data.get('offset')
        if not offset:
            break

    return records

def check_needs_translation(pricing_json, lang):
    """Check if pricing still contains English terms that should be translated"""
    if not pricing_json:
        return False, []

    try:
        if isinstance(pricing_json, str):
            pricing = json.loads(pricing_json)
        else:
            pricing = pricing_json
    except:
        return False, []

    pricing_str = json.dumps(pricing).lower()
    found_terms = []

    for term in SHOULD_TRANSLATE:
        if term.lower() in pricing_str:
            found_terms.append(term)

    return len(found_terms) > 0, found_terms

print("📥 Fetching all records...")
records = fetch_all_records()

if not records:
    print("❌ Failed to fetch records")
    exit(1)

print(f"✅ Fetched {len(records)} total records\n")

nl_needs_update = []
pt_needs_update = []

for record in records:
    fields = record.get('fields', {})
    lang = fields.get('language', 'en')
    name = fields.get('name', 'Unknown')
    pricing = fields.get('pricing_plans')

    if lang not in ['nl', 'pt']:
        continue

    needs_translation, found_terms = check_needs_translation(pricing, lang)

    if needs_translation:
        if lang == 'nl':
            nl_needs_update.append({
                'name': name,
                'terms': found_terms,
                'pricing': pricing
            })
        else:
            pt_needs_update.append({
                'name': name,
                'terms': found_terms,
                'pricing': pricing
            })

print("=" * 70)
print("📊 RESULTS")
print("=" * 70)
print(f"\n🇳🇱 NL records that still need translation: {len(nl_needs_update)}")
print(f"🇧🇷 PT records that still need translation: {len(pt_needs_update)}")
print(f"\n📈 Total needing translation: {len(nl_needs_update) + len(pt_needs_update)}")

if nl_needs_update:
    print("\n" + "=" * 70)
    print("🇳🇱 NL RECORDS WITH UNTRANSLATED TERMS:")
    print("=" * 70)
    for rec in nl_needs_update[:10]:  # Show first 10
        print(f"\n   📝 {rec['name']}")
        print(f"      English terms found: {', '.join(rec['terms'])}")
        print(f"      Pricing preview: {str(rec['pricing'])[:120]}...")

if pt_needs_update:
    print("\n" + "=" * 70)
    print("🇧🇷 PT RECORDS WITH UNTRANSLATED TERMS:")
    print("=" * 70)
    for rec in pt_needs_update[:10]:  # Show first 10
        print(f"\n   📝 {rec['name']}")
        print(f"      English terms found: {', '.join(rec['terms'])}")
        print(f"      Pricing preview: {str(rec['pricing'])[:120]}...")

print("\n" + "=" * 70)
