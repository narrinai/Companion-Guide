#!/usr/bin/env python3
"""
Check how many NL/PT records have pricing_plans and which ones were skipped
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

print("📥 Fetching all records...")
records = fetch_all_records()

if not records:
    print("❌ Failed to fetch records")
    exit(1)

print(f"✅ Fetched {len(records)} total records\n")

# Count by language
nl_count = 0
pt_count = 0
nl_with_pricing = 0
pt_with_pricing = 0
nl_without_pricing = 0
pt_without_pricing = 0

nl_records = []
pt_records = []

for record in records:
    fields = record.get('fields', {})
    lang = fields.get('language', 'en')
    name = fields.get('name', 'Unknown')
    pricing = fields.get('pricing_plans')

    if lang == 'nl':
        nl_count += 1
        nl_records.append({
            'name': name,
            'has_pricing': bool(pricing),
            'pricing': pricing
        })
        if pricing:
            nl_with_pricing += 1
        else:
            nl_without_pricing += 1

    elif lang == 'pt':
        pt_count += 1
        pt_records.append({
            'name': name,
            'has_pricing': bool(pricing),
            'pricing': pricing
        })
        if pricing:
            pt_with_pricing += 1
        else:
            pt_without_pricing += 1

print("=" * 70)
print("📊 STATISTICS")
print("=" * 70)
print(f"\n🇳🇱 DUTCH (NL):")
print(f"   Total: {nl_count} records")
print(f"   With pricing_plans: {nl_with_pricing}")
print(f"   Without pricing_plans: {nl_without_pricing}")

print(f"\n🇧🇷 PORTUGUESE (PT):")
print(f"   Total: {pt_count} records")
print(f"   With pricing_plans: {pt_with_pricing}")
print(f"   Without pricing_plans: {pt_without_pricing}")

print(f"\n📈 TOTAL NL + PT: {nl_count + pt_count} records")
print(f"   With pricing_plans: {nl_with_pricing + pt_with_pricing}")
print(f"   Without pricing_plans: {nl_without_pricing + pt_without_pricing}")

print("\n" + "=" * 70)
print("🇳🇱 NL RECORDS WITHOUT PRICING_PLANS:")
print("=" * 70)
for rec in nl_records:
    if not rec['has_pricing']:
        print(f"   ❌ {rec['name']}")

print("\n" + "=" * 70)
print("🇧🇷 PT RECORDS WITHOUT PRICING_PLANS:")
print("=" * 70)
for rec in pt_records:
    if not rec['has_pricing']:
        print(f"   ❌ {rec['name']}")

print("\n" + "=" * 70)
print("✅ RECORDS WITH PRICING_PLANS (sample):")
print("=" * 70)
sample_count = 0
for rec in nl_records + pt_records:
    if rec['has_pricing'] and sample_count < 5:
        print(f"   ✅ {rec['name']}")
        print(f"      Pricing: {str(rec['pricing'])[:80]}...")
        sample_count += 1
