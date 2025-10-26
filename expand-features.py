#!/usr/bin/env python3
"""
Script to expand the features field in Companion_Translations table for EN, NL, and PT.

This script will:
1. Connect to Airtable
2. Fetch all records from Companion_Translations
3. Parse existing features JSON
4. Expand/enhance the features with more details
5. Update the records back to Airtable
"""

import os
import json
import requests
from datetime import datetime

# Airtable configuration
AIRTABLE_TOKEN = os.getenv('AIRTABLE_TOKEN_CG')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID_CG')
TRANSLATIONS_TABLE_NAME = 'Companion_Translations'

if not AIRTABLE_TOKEN or not AIRTABLE_BASE_ID:
    print("❌ Error: AIRTABLE_TOKEN_CG and AIRTABLE_BASE_ID_CG must be set")
    exit(1)

# Airtable API base URL
API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{TRANSLATIONS_TABLE_NAME}'

headers = {
    'Authorization': f'Bearer {AIRTABLE_TOKEN}',
    'Content-Type': 'application/json'
}

def fetch_all_records():
    """Fetch all records from Companion_Translations table"""
    print("📥 Fetching records from Companion_Translations...")
    
    records = []
    offset = None
    
    while True:
        params = {}
        if offset:
            params['offset'] = offset
        
        response = requests.get(API_URL, headers=headers, params=params)
        
        if response.status_code != 200:
            print(f"❌ Error fetching records: {response.status_code}")
            print(response.text)
            return None
        
        data = response.json()
        records.extend(data.get('records', []))
        
        offset = data.get('offset')
        if not offset:
            break
    
    print(f"✅ Fetched {len(records)} records")
    return records

def parse_features(features_field):
    """Parse features field (could be JSON string or array)"""
    if not features_field:
        return []
    
    if isinstance(features_field, str):
        try:
            return json.loads(features_field)
        except json.JSONDecodeError:
            return []
    
    return features_field if isinstance(features_field, list) else []

def expand_features(features, lang='en'):
    """
    Expand features with more detailed information
    
    Current structure:
    [
        {"icon": "🎭", "title": "Title", "description": "Description"}
    ]
    
    Expanded structure (same but with better descriptions):
    [
        {"icon": "🎭", "title": "Title", "description": "More detailed description"}
    ]
    """
    if not features or len(features) == 0:
        return features
    
    # For now, just ensure each feature has proper structure
    # You can customize this to add more details per language
    expanded = []
    
    for feature in features:
        if isinstance(feature, dict):
            # Ensure all required fields exist
            expanded_feature = {
                'icon': feature.get('icon', ''),
                'title': feature.get('title', ''),
                'description': feature.get('description', feature.get('text', ''))
            }
            expanded.append(expanded_feature)
    
    return expanded

def update_record(record_id, fields):
    """Update a single record in Airtable"""
    url = f'{API_URL}/{record_id}'
    
    data = {
        'fields': fields
    }
    
    response = requests.patch(url, headers=headers, json=data)
    
    if response.status_code != 200:
        print(f"❌ Error updating record {record_id}: {response.status_code}")
        print(response.text)
        return False
    
    return True

def main():
    print("🚀 Starting features expansion script...")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Fetch all records
    records = fetch_all_records()
    if not records:
        return
    
    print()
    print("🔄 Processing records...")
    
    updated_count = 0
    skipped_count = 0
    
    for record in records:
        record_id = record['id']
        fields = record.get('fields', {})
        
        companion_name = fields.get('name', 'Unknown')
        language = fields.get('language', 'en')
        
        print(f"\n📝 Processing: {companion_name} ({language})")
        
        # Check if features field exists
        features_raw = fields.get('features')
        
        if not features_raw:
            print(f"   ⏭️  No features field - skipping")
            skipped_count += 1
            continue
        
        # Parse existing features
        features = parse_features(features_raw)
        
        if not features or len(features) == 0:
            print(f"   ⏭️  Empty features - skipping")
            skipped_count += 1
            continue
        
        print(f"   📊 Current features: {len(features)} items")
        
        # Expand features
        expanded_features = expand_features(features, language)
        
        if expanded_features == features:
            print(f"   ✓ Features already optimal")
            skipped_count += 1
            continue
        
        # Update the record
        update_fields = {
            'features': json.dumps(expanded_features, ensure_ascii=False)
        }
        
        if update_record(record_id, update_fields):
            print(f"   ✅ Updated successfully")
            updated_count += 1
        else:
            print(f"   ❌ Update failed")
    
    print()
    print("=" * 50)
    print(f"✅ Script completed!")
    print(f"   Updated: {updated_count} records")
    print(f"   Skipped: {skipped_count} records")
    print(f"   Total: {len(records)} records")
    print("=" * 50)

if __name__ == '__main__':
    main()
