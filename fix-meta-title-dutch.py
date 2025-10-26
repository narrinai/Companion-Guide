#!/usr/bin/env python3
"""
Script to fix overly literal Dutch translations in meta_title and meta_description.
Keep English AI industry terms like "AI Companion", not "AI metgezelschap".
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

# Bad literal translations to fix
BAD_TRANSLATIONS = {
    'metgezelschap': 'Companion',
    'Metgezelschap': 'Companion',
    'metgezellen': 'Companions',
    'Metgezellen': 'Companions',
    'companionschapplatform': 'Companion Platform',
    'Companionschapplatform': 'Companion Platform',
    'companionschap platform': 'Companion Platform',
    'Companionschap Platform': 'Companion Platform',
    'companionschap': 'companion',
    'Companionschap': 'Companion',
    'AI-metgezelschap': 'AI Companion',
    'AI metgezelschap': 'AI Companion',
    'AI-companionschap': 'AI Companion',
    'AI companionschap': 'AI Companion',
}

def fetch_nl_records():
    """Fetch all NL records"""
    print("📥 Fetching NL records from Companion_Translations...")
    
    records = []
    offset = None
    
    while True:
        params = {
            'filterByFormula': "{language} = 'nl'"
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

def fix_literal_translations(text):
    """Replace bad literal Dutch translations with correct English terms"""
    if not text:
        return text
    
    fixed = text
    
    for bad_nl, good_en in BAD_TRANSLATIONS.items():
        # Case-insensitive replacement
        fixed = re.sub(r'\b' + re.escape(bad_nl) + r'\b', good_en, fixed, flags=re.IGNORECASE)
    
    return fixed

def update_record(record_id, fields_to_update):
    """Update record with fixed fields"""
    url = f'{API_URL}/{record_id}'
    
    data = {
        'fields': fields_to_update
    }
    
    response = requests.patch(url, headers=headers, json=data)
    
    if response.status_code != 200:
        print(f"   ❌ Update failed: {response.status_code}")
        print(response.text)
        return False
    
    return True

def main():
    print("🚀 Starting meta_title/meta_description Dutch translation fix...")
    print("=" * 60)
    
    records = fetch_nl_records()
    
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
        
        print(f"\n[{i}/{len(records)}] 📝 {companion_name}")
        
        # Check meta_title and meta_description
        meta_title = fields.get('meta_title', '')
        meta_desc = fields.get('meta_description', '')
        
        if not meta_title and not meta_desc:
            print(f"   ⏭️  No meta fields")
            skipped += 1
            continue
        
        # Fix both fields
        fixed_title = fix_literal_translations(meta_title)
        fixed_desc = fix_literal_translations(meta_desc)
        
        # Check if anything changed
        title_changed = fixed_title != meta_title
        desc_changed = fixed_desc != meta_desc
        
        if not title_changed and not desc_changed:
            print(f"   ✓ No bad translations found")
            skipped += 1
            continue
        
        # Show what changed
        if title_changed:
            print(f"   📝 meta_title:")
            print(f"      Before: {meta_title[:80]}...")
            print(f"      After:  {fixed_title[:80]}...")
        
        if desc_changed:
            print(f"   📝 meta_description:")
            print(f"      Before: {meta_desc[:80]}...")
            print(f"      After:  {fixed_desc[:80]}...")
        
        # Prepare update
        fields_to_update = {}
        if title_changed:
            fields_to_update['meta_title'] = fixed_title
        if desc_changed:
            fields_to_update['meta_description'] = fixed_desc
        
        # Update
        if update_record(record_id, fields_to_update):
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
