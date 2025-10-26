#!/usr/bin/env python3
"""
Script to fix remaining Dutch words in pricing_plans features.
Keep ONLY English AI/tech terms, replace ALL Dutch descriptive words.
"""

import os
import json
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

# Comprehensive translation map - Dutch to English
WORD_MAP = {
    # Quantity/limits
    'Onbeperkt': 'Unlimited',
    'Onbeperkte': 'Unlimited',
    'Beperkt': 'Limited',
    'Beperkte': 'Limited',
    'dagelijkse': 'daily',
    
    # Actions
    'Toegang tot': 'Access to',
    'toegang tot': 'access to',
    
    # Features
    'functies': 'features',
    
    # Time periods
    'maandelijks': 'monthly',
    'jaarlijks': 'annually',
    'per maand': 'per month',
    'per jaar': 'per year',
    '/maand': '/month',
    '/jaar': '/year',
    
    # Common terms
    'afbeeldingen': 'images',
    'berichten': 'messages',
    'gratis': 'free',
    'premium': 'premium',
}

def fetch_nl_records_with_pricing():
    """Fetch NL records with pricing_plans"""
    print("📥 Fetching NL records with pricing_plans...")
    
    records = []
    offset = None
    
    while True:
        params = {
            'filterByFormula': "AND({language} = 'nl', {pricing_plans} != '')"
        }
        if offset:
            params['offset'] = offset
        
        response = requests.get(API_URL, headers=headers, params=params)
        data = response.json()
        records.extend(data.get('records', []))
        
        offset = data.get('offset')
        if not offset:
            break
        time.sleep(0.2)
    
    print(f"✅ Fetched {len(records)} NL records")
    return records

def fix_dutch_in_feature(feature_text):
    """Replace Dutch words with English equivalents"""
    fixed = feature_text
    
    for nl_word, en_word in WORD_MAP.items():
        # Use word boundaries to avoid partial replacements
        fixed = re.sub(r'\b' + re.escape(nl_word) + r'\b', en_word, fixed)
    
    return fixed

def fix_pricing_plan_dutch(pricing_json_str):
    """Fix Dutch words in pricing plan features"""
    try:
        # Parse JSON
        if isinstance(pricing_json_str, str):
            plans = json.loads(pricing_json_str)
        else:
            plans = pricing_json_str
        
        changed = False
        
        for plan in plans:
            # Fix period
            if 'period' in plan:
                old_period = plan['period']
                new_period = fix_dutch_in_feature(old_period)
                if new_period != old_period:
                    plan['period'] = new_period
                    changed = True
            
            # Fix features list
            if 'features' in plan:
                new_features = []
                for feature in plan['features']:
                    new_feature = fix_dutch_in_feature(feature)
                    new_features.append(new_feature)
                    
                    if new_feature != feature:
                        changed = True
                
                plan['features'] = new_features
        
        if changed:
            return json.dumps(plans, ensure_ascii=False), True
        
        return pricing_json_str, False
        
    except Exception as e:
        print(f"   ❌ Error parsing JSON: {e}")
        return pricing_json_str, False

def update_record(record_id, pricing_plans):
    """Update record with fixed pricing_plans"""
    url = f'{API_URL}/{record_id}'
    
    data = {
        'fields': {
            'pricing_plans': pricing_plans
        }
    }
    
    response = requests.patch(url, headers=headers, json=data)
    
    if response.status_code != 200:
        print(f"   ❌ Update failed: {response.status_code}")
        return False
    
    return True

def main():
    print("🚀 Starting Dutch words removal from pricing_plans...")
    print("=" * 60)
    
    records = fetch_nl_records_with_pricing()
    
    print()
    print("🔄 Processing records...")
    print("=" * 60)
    
    updated = 0
    skipped = 0
    errors = 0
    
    for i, record in enumerate(records, 1):
        record_id = record['id']
        fields = record.get('fields', {})
        
        companion_name = fields.get('name (from companion)', ['Unknown'])[0]
        pricing_raw = fields.get('pricing_plans', '')
        
        print(f"\n[{i}/{len(records)}] 📝 {companion_name}")
        
        if not pricing_raw:
            print(f"   ⏭️  No pricing_plans")
            skipped += 1
            continue
        
        # Fix Dutch words
        fixed_pricing, changed = fix_pricing_plan_dutch(pricing_raw)
        
        if not changed:
            print(f"   ✓ No Dutch words found")
            skipped += 1
            continue
        
        print(f"   🔧 Fixed Dutch words → English")
        
        # Show preview
        try:
            plans = json.loads(fixed_pricing)
            if plans and len(plans) > 0:
                first_plan = plans[0]
                if 'features' in first_plan and len(first_plan['features']) > 0:
                    print(f"   Example: {first_plan['features'][0][:70]}...")
        except:
            pass
        
        # Update
        if update_record(record_id, fixed_pricing):
            print(f"   💾 Updated in Airtable")
            updated += 1
        else:
            errors += 1
        
        time.sleep(0.3)
    
    print()
    print("=" * 60)
    print("✅ Fix completed!")
    print(f"   Updated:  {updated} records")
    print(f"   Skipped:  {skipped} records")
    print(f"   Errors:   {errors} records")
    print(f"   Total:    {len(records)} records")
    print("=" * 60)

if __name__ == '__main__':
    main()
