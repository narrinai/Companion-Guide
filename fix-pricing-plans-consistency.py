#!/usr/bin/env python3
"""
Script to fix inconsistent Dutch translations in pricing_plans.
Makes them consistent: keep English AI/tech terms, translate only connecting words.
"""

import os
import json
import requests
import time

AIRTABLE_TOKEN = os.getenv('AIRTABLE_TOKEN_CG')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID_CG')
API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/Companion_Translations'

headers = {
    'Authorization': f'Bearer {AIRTABLE_TOKEN}',
    'Content-Type': 'application/json'
}

# Translation map for consistency
TRANSLATION_MAP = {
    # Field names
    'functies': 'features',
    
    # Period terms (keep English)
    'maandelijks': 'month',
    'jaarlijks': 'year',
    'per maand': 'per month',
    'per jaar': 'per year',
    
    # Common terms (keep English tech terms)
    'berichten': 'messages',
    'text berichten': 'text messages',
    'Beperkt text berichten': 'Beperkte text messages',
    'Onbeperkt text berichten': 'Onbeperkte text messages',
    'afbeeldingen': 'images',
    'in-chat afbeeldingen': 'in-chat images',
    
    # Billing terms
    'Billed jaarlijks at': 'Billed annually at',
    'Billed maandelijks at': 'Billed monthly at',
    
    # Other common patterns
    'Community functies': 'Community features',
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

def fix_pricing_plan(pricing_json_str):
    """Fix inconsistent translations in pricing plan"""
    try:
        # Parse JSON
        if isinstance(pricing_json_str, str):
            plans = json.loads(pricing_json_str)
        else:
            plans = pricing_json_str
        
        changed = False
        
        for plan in plans:
            # Fix 'functies' -> 'features'
            if 'functies' in plan:
                plan['features'] = plan.pop('functies')
                changed = True
            
            # Fix period terms
            if 'period' in plan:
                old_period = plan['period']
                new_period = TRANSLATION_MAP.get(old_period, old_period)
                if new_period != old_period:
                    plan['period'] = new_period
                    changed = True
            
            # Fix features list
            if 'features' in plan:
                new_features = []
                for feature in plan['features']:
                    new_feature = feature
                    
                    # Apply translation map
                    for nl_term, en_term in TRANSLATION_MAP.items():
                        if nl_term in new_feature:
                            new_feature = new_feature.replace(nl_term, en_term)
                    
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
    print("🚀 Starting pricing_plans consistency fix...")
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
        
        # Fix inconsistencies
        fixed_pricing, changed = fix_pricing_plan(pricing_raw)
        
        if not changed:
            print(f"   ✓ Already consistent")
            skipped += 1
            continue
        
        print(f"   🔧 Fixed inconsistencies")
        
        # Show preview of changes
        try:
            plans = json.loads(fixed_pricing)
            if plans and len(plans) > 0:
                first_plan = plans[0]
                print(f"   Preview: {first_plan.get('name', 'Unknown')}")
                if 'features' in first_plan:
                    print(f"            ✓ 'features' field (was 'functies')")
                    if len(first_plan['features']) > 0:
                        print(f"            {first_plan['features'][0][:60]}...")
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
