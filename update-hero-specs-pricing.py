#!/usr/bin/env python3
"""
Script to update hero_specs pricing field to show "Gratis + vanaf $X/month" format
instead of vague terms like "Premium Plans" or "Free with premium options".
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

def fetch_nl_records_with_pricing():
    """Fetch NL records that have both hero_specs and pricing_plans"""
    print("📥 Fetching NL records with hero_specs and pricing_plans...")
    
    records = []
    offset = None
    
    while True:
        params = {
            'filterByFormula': "AND({language} = 'nl', {pricing_plans} != '', {hero_specs} != '')"
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

def get_pricing_info_from_plans(pricing_plans_str):
    """Extract free tier existence and lowest paid price from pricing_plans"""
    try:
        if isinstance(pricing_plans_str, str):
            plans = json.loads(pricing_plans_str)
        else:
            plans = pricing_plans_str
        
        has_free = False
        lowest_paid_price = None
        lowest_paid_period = None
        
        for plan in plans:
            price = plan.get('price', 0)
            period = plan.get('period', 'month')
            
            # Check if free
            if price == 0 or price == 'Free' or price == 'free' or plan.get('name', '').lower().startswith('free'):
                has_free = True
            else:
                # Track lowest paid price
                try:
                    price_num = float(price)
                    if lowest_paid_price is None or price_num < lowest_paid_price:
                        lowest_paid_price = price_num
                        lowest_paid_period = period
                except:
                    pass
        
        return has_free, lowest_paid_price, lowest_paid_period
        
    except Exception as e:
        print(f"   ❌ Error parsing pricing_plans: {e}")
        return False, None, None

def create_pricing_text(has_free, lowest_paid_price, lowest_paid_period, language='nl'):
    """Create pricing text in format: 'Gratis + vanaf $X/month'"""
    
    if language == 'nl':
        if has_free and lowest_paid_price:
            return f"Gratis + vanaf ${lowest_paid_price:.2f}/{lowest_paid_period}"
        elif has_free:
            return "Gratis"
        elif lowest_paid_price:
            return f"Vanaf ${lowest_paid_price:.2f}/{lowest_paid_period}"
        else:
            return "Pricing varies"
    else:  # English
        if has_free and lowest_paid_price:
            return f"Free + from ${lowest_paid_price:.2f}/{lowest_paid_period}"
        elif has_free:
            return "Free"
        elif lowest_paid_price:
            return f"From ${lowest_paid_price:.2f}/{lowest_paid_period}"
        else:
            return "Pricing varies"

def update_record(record_id, hero_specs_json):
    """Update record with new hero_specs"""
    url = f'{API_URL}/{record_id}'
    
    data = {
        'fields': {
            'hero_specs': hero_specs_json
        }
    }
    
    response = requests.patch(url, headers=headers, json=data)
    
    if response.status_code != 200:
        print(f"   ❌ Update failed: {response.status_code}")
        return False
    
    return True

def main():
    print("🚀 Starting hero_specs pricing update...")
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
        pricing_plans = fields.get('pricing_plans', '')
        hero_specs_raw = fields.get('hero_specs', '')
        
        print(f"\n[{i}/{len(records)}] 📝 {companion_name}")
        
        # Parse hero_specs
        try:
            if isinstance(hero_specs_raw, str):
                hero_specs = json.loads(hero_specs_raw)
            else:
                hero_specs = hero_specs_raw
        except:
            print(f"   ⏭️  Invalid hero_specs JSON")
            skipped += 1
            continue
        
        # Get current pricing text
        current_pricing = hero_specs.get('pricing', '')
        
        # Extract pricing info from pricing_plans
        has_free, lowest_price, period = get_pricing_info_from_plans(pricing_plans)
        
        if lowest_price is None and not has_free:
            print(f"   ⏭️  Could not determine pricing from pricing_plans")
            skipped += 1
            continue
        
        # Create new pricing text
        new_pricing = create_pricing_text(has_free, lowest_price, period, 'nl')
        
        # Check if already correct
        if current_pricing == new_pricing:
            print(f"   ✓ Pricing already correct: {new_pricing}")
            skipped += 1
            continue
        
        # Update hero_specs
        hero_specs['pricing'] = new_pricing
        
        print(f"   📝 Pricing:")
        print(f"      Before: {current_pricing}")
        print(f"      After:  {new_pricing}")
        
        # Update in Airtable
        hero_specs_json = json.dumps(hero_specs, ensure_ascii=False)
        
        if update_record(record_id, hero_specs_json):
            print(f"   💾 Updated in Airtable")
            updated += 1
        else:
            errors += 1
        
        time.sleep(0.3)
    
    print()
    print("=" * 60)
    print("✅ Update completed!")
    print(f"   Updated:  {updated} records")
    print(f"   Skipped:  {skipped} records")
    print(f"   Errors:   {errors} records")
    print(f"   Total:    {len(records)} records")
    print("=" * 60)

if __name__ == '__main__':
    main()
