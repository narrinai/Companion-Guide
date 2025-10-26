#!/usr/bin/env python3
"""
Script to translate my_verdict field from English to Dutch for NL records in Companion_Translations.
Uses Claude API for high-quality translations.
"""

import os
import json
import requests
import time
from anthropic import Anthropic

# Airtable configuration
AIRTABLE_TOKEN = os.getenv('AIRTABLE_TOKEN_CG')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID_CG')
TRANSLATIONS_TABLE_NAME = 'Companion_Translations'

# Anthropic API configuration
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

if not AIRTABLE_TOKEN or not AIRTABLE_BASE_ID:
    print("❌ Error: AIRTABLE_TOKEN_CG and AIRTABLE_BASE_ID_CG must be set")
    exit(1)

if not ANTHROPIC_API_KEY:
    print("❌ Error: ANTHROPIC_API_KEY must be set")
    exit(1)

# Initialize Anthropic client
anthropic = Anthropic(api_key=ANTHROPIC_API_KEY)

# Airtable API
API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{TRANSLATIONS_TABLE_NAME}'
headers = {
    'Authorization': f'Bearer {AIRTABLE_TOKEN}',
    'Content-Type': 'application/json'
}

def fetch_nl_records():
    """Fetch all NL records from Companion_Translations"""
    print("📥 Fetching NL records from Companion_Translations...")
    
    records = []
    offset = None
    
    # Filter for language = 'nl'
    filter_formula = "{language} = 'nl'"
    
    while True:
        params = {
            'filterByFormula': filter_formula
        }
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
    
    print(f"✅ Fetched {len(records)} NL records")
    return records

def translate_to_dutch(english_text, companion_name):
    """Translate English my_verdict text to Dutch using Claude API"""
    
    prompt = f"""Translate this AI companion review text from English to Dutch. This is a personal review/verdict section for {companion_name}.

IMPORTANT TRANSLATION RULES:
1. Keep English AI industry terms: "AI companion", "AI girlfriend", "AI boyfriend", "NSFW", "roleplay", "chat", etc.
2. Translate conversational/review language naturally to Dutch
3. Maintain the same paragraph structure and formatting
4. Keep any markdown formatting (**, ##, etc.)
5. Translate section headers like "My 1-Week Experience with X" to "Mijn 1 Week Ervaring met X"
6. Keep brand names and product names in English
7. Use natural Dutch expressions, not literal translations

English text to translate:
{english_text}

Respond with ONLY the Dutch translation, no explanations or comments."""

    try:
        response = anthropic.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=4000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )
        
        dutch_text = response.content[0].text.strip()
        return dutch_text
        
    except Exception as e:
        print(f"❌ Translation error: {e}")
        return None

def update_record(record_id, my_verdict_nl):
    """Update a record with translated my_verdict"""
    url = f'{API_URL}/{record_id}'
    
    data = {
        'fields': {
            'my_verdict': my_verdict_nl
        }
    }
    
    response = requests.patch(url, headers=headers, json=data)
    
    if response.status_code != 200:
        print(f"❌ Error updating record {record_id}: {response.status_code}")
        print(response.text)
        return False
    
    return True

def main():
    print("🚀 Starting my_verdict Dutch translation script...")
    print("=" * 60)
    
    # Fetch all NL records
    records = fetch_nl_records()
    if not records:
        return
    
    print()
    print("🔄 Processing records...")
    print("=" * 60)
    
    updated_count = 0
    skipped_count = 0
    error_count = 0
    
    for i, record in enumerate(records, 1):
        record_id = record['id']
        fields = record.get('fields', {})
        
        companion_name = fields.get('name', 'Unknown')
        my_verdict_text = fields.get('my_verdict', '')
        
        print(f"\n[{i}/{len(records)}] 📝 {companion_name}")
        
        # Skip if no my_verdict
        if not my_verdict_text or len(my_verdict_text.strip()) == 0:
            print(f"   ⏭️  No my_verdict content - skipping")
            skipped_count += 1
            continue
        
        # Check if already translated (contains Dutch words)
        # Simple heuristic: if it contains "Mijn" or "Week Ervaring" it's likely already Dutch
        if 'Mijn ' in my_verdict_text or 'Week Ervaring' in my_verdict_text:
            print(f"   ✓ Already appears to be in Dutch - skipping")
            skipped_count += 1
            continue
        
        print(f"   🌍 Translating to Dutch... ({len(my_verdict_text)} chars)")
        
        # Translate to Dutch
        dutch_verdict = translate_to_dutch(my_verdict_text, companion_name)
        
        if not dutch_verdict:
            print(f"   ❌ Translation failed")
            error_count += 1
            continue
        
        print(f"   ✅ Translated ({len(dutch_verdict)} chars)")
        
        # Show preview
        preview = dutch_verdict[:150].replace('\n', ' ')
        print(f"   Preview: {preview}...")
        
        # Update the record
        if update_record(record_id, dutch_verdict):
            print(f"   💾 Updated in Airtable")
            updated_count += 1
        else:
            print(f"   ❌ Failed to update")
            error_count += 1
        
        # Rate limiting - be nice to both APIs
        time.sleep(1)
    
    print()
    print("=" * 60)
    print("✅ Translation completed!")
    print(f"   Updated:  {updated_count} records")
    print(f"   Skipped:  {skipped_count} records")
    print(f"   Errors:   {error_count} records")
    print(f"   Total:    {len(records)} records")
    print("=" * 60)

if __name__ == '__main__':
    main()
