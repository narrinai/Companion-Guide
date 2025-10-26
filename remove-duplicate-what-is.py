#!/usr/bin/env python3
"""
Script to remove duplicate "Wat is [companion]?" / "O que é [companion]?"
heading from body_text field in NL and PT records.
"""

import os
import json
import requests
import time
import re

# Airtable configuration
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

def fetch_records_by_language(language):
    """Fetch all records for a specific language"""
    print(f"📥 Fetching {language.upper()} records from Companion_Translations...")
    
    records = []
    offset = None
    
    filter_formula = f"{{language}} = '{language}'"
    
    while True:
        params = {'filterByFormula': filter_formula}
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
        
        time.sleep(0.2)
    
    print(f"✅ Fetched {len(records)} {language.upper()} records")
    return records

def remove_first_heading(text, language, companion_name):
    """
    Remove first heading if it's "## Wat is X?" or "## O que é X?"
    Also handles variations without ##
    """
    if not text or len(text.strip()) == 0:
        return text

    # Patterns to match (with or without markdown ##)
    if language == 'nl':
        # Match: "## Wat is [Name]?" or "Wat is [Name]?" at the start
        pattern = r'^##?\s*Wat is [^?]+\?\s*\n*'
    elif language == 'pt':
        # Match: "## O que é [Name]?" or "O que é [Name]?" at the start
        pattern = r'^##?\s*O que é [^?]+\?\s*\n*'
    else:
        return text

    # Remove the pattern if found
    cleaned = re.sub(pattern, '', text, count=1)

    # Return cleaned text, or original if nothing changed
    return cleaned if cleaned != text else text

def update_record(record_id, body_text):
    """Update a record with cleaned body_text"""
    url = f'{API_URL}/{record_id}'

    data = {
        'fields': {
            'body_text': body_text
        }
    }

    response = requests.patch(url, headers=headers, json=data)

    if response.status_code != 200:
        print(f"❌ Error updating record {record_id}: {response.status_code}")
        print(response.text)
        return False

    return True

def process_language(language):
    """Process all records for a specific language"""
    print()
    print("=" * 60)
    print(f"Processing {language.upper()} records")
    print("=" * 60)
    
    records = fetch_records_by_language(language)
    if not records:
        return
    
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    for i, record in enumerate(records, 1):
        record_id = record['id']
        fields = record.get('fields', {})
        
        companion_name = fields.get('name', 'Unknown')
        body_text = fields.get('body_text', '')

        print(f"\n[{i}/{len(records)}] 📝 {companion_name}")

        # Skip if no body_text
        if not body_text or len(body_text.strip()) == 0:
            print(f"   ⏭️  No body_text - skipping")
            skipped_count += 1
            continue

        # Remove first heading if it matches pattern
        cleaned = remove_first_heading(body_text, language, companion_name)
        
        if cleaned == body_text:
            print(f"   ✓ No duplicate 'What is' heading found")
            skipped_count += 1
            continue

        # Show what was removed
        removed_part = body_text[:len(body_text) - len(cleaned)]
        print(f"   🗑️  Removing: {removed_part.strip()[:80]}...")
        print(f"   ✅ Cleaned ({len(body_text)} → {len(cleaned)} chars)")
        
        # Update the record
        if update_record(record_id, cleaned):
            print(f"   💾 Updated in Airtable")
            updated_count += 1
        else:
            print(f"   ❌ Failed to update")
            error_count += 1
        
        time.sleep(0.3)
    
    print()
    print("=" * 60)
    print(f"✅ {language.upper()} processing completed!")
    print(f"   Updated:  {updated_count} records")
    print(f"   Skipped:  {skipped_count} records")
    print(f"   Errors:   {error_count} records")
    print(f"   Total:    {len(records)} records")
    print("=" * 60)

def main():
    print("🚀 Starting duplicate 'What is' sentence removal script...")
    
    # Process NL records
    process_language('nl')
    
    # Process PT records
    process_language('pt')
    
    print()
    print("🎉 All done!")

if __name__ == '__main__':
    main()
