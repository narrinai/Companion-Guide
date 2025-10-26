#!/usr/bin/env python3
"""
Script to translate pricing_plans from EN to NL in Companion_Translations.
Keeps AI industry terms in English (AI companion, AI girlfriend, etc.)
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

# Anthropic API
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

if not all([AIRTABLE_TOKEN, AIRTABLE_BASE_ID, ANTHROPIC_API_KEY]):
    print("❌ Error: Required environment variables not set")
    exit(1)

anthropic = Anthropic(api_key=ANTHROPIC_API_KEY)

API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{TRANSLATIONS_TABLE_NAME}'
headers = {
    'Authorization': f'Bearer {AIRTABLE_TOKEN}',
    'Content-Type': 'application/json'
}

def fetch_records_with_pricing():
    """Fetch EN and NL record pairs that have pricing_plans"""
    print("📥 Fetching records with pricing_plans...")
    
    # Fetch EN records with pricing_plans
    en_records = {}
    offset = None
    
    while True:
        params = {
            'filterByFormula': "AND({language} = 'en', {pricing_plans} != '')"
        }
        if offset:
            params['offset'] = offset
        
        response = requests.get(API_URL, headers=headers, params=params)
        data = response.json()
        
        for record in data.get('records', []):
            slug = record['fields'].get('slug (from companion)', [''])[0]
            if slug:
                en_records[slug] = record
        
        offset = data.get('offset')
        if not offset:
            break
        time.sleep(0.2)
    
    # Fetch corresponding NL records
    nl_records = {}
    offset = None
    
    while True:
        params = {
            'filterByFormula': "{language} = 'nl'"
        }
        if offset:
            params['offset'] = offset
        
        response = requests.get(API_URL, headers=headers, params=params)
        data = response.json()
        
        for record in data.get('records', []):
            slug = record['fields'].get('slug (from companion)', [''])[0]
            if slug:
                nl_records[slug] = record
        
        offset = data.get('offset')
        if not offset:
            break
        time.sleep(0.2)
    
    # Match EN and NL pairs
    pairs = []
    for slug in en_records:
        if slug in nl_records:
            pairs.append({
                'slug': slug,
                'en_record': en_records[slug],
                'nl_record': nl_records[slug]
            })
    
    print(f"✅ Found {len(pairs)} EN/NL pairs with pricing_plans")
    return pairs

def translate_pricing_plan_to_dutch(plan_json_str, companion_name):
    """Translate pricing plan features from English to Dutch"""
    
    prompt = f"""Translate this pricing plan features list from English to Dutch for {companion_name}.

CRITICAL RULES:
1. Keep ALL AI industry terms in English: "AI companion", "AI girlfriend", "AI boyfriend", "AI chat", "NSFW", "chat", "roleplay", etc.
2. Translate descriptive words naturally to Dutch
3. Keep ✅ and ❌ symbols exactly as they are
4. Maintain exact JSON structure
5. Keep plan names mostly in English (Free, Premium, Pro, etc.)
6. Keep technical terms in English (API access, tokens, credits, etc.)

Examples:
- "✅ Unlimited AI chat" → "✅ Onbeperkte AI chat"
- "✅ NSFW content generation" → "✅ NSFW content generatie"  
- "❌ Premium AI models" → "❌ Premium AI models"
- "Voice conversations" → "Voice gesprekken"
- "Character creation" → "Character creatie"

English pricing_plans JSON:
{plan_json_str}

Respond with ONLY the Dutch JSON, no explanations."""

    try:
        response = anthropic.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}]
        )
        
        dutch_json = response.content[0].text.strip()
        
        # Remove markdown code blocks if present
        if dutch_json.startswith('```'):
            dutch_json = dutch_json.split('\n', 1)[1]
            dutch_json = dutch_json.rsplit('```', 1)[0].strip()
        if dutch_json.startswith('json'):
            dutch_json = dutch_json[4:].strip()
        
        # Validate JSON
        json.loads(dutch_json)
        
        return dutch_json
        
    except Exception as e:
        print(f"❌ Translation error: {e}")
        return None

def update_nl_record(record_id, pricing_plans_nl):
    """Update NL record with translated pricing_plans"""
    url = f'{API_URL}/{record_id}'
    
    data = {
        'fields': {
            'pricing_plans': pricing_plans_nl
        }
    }
    
    response = requests.patch(url, headers=headers, json=data)
    
    if response.status_code != 200:
        print(f"❌ Update failed: {response.status_code}")
        print(response.text)
        return False
    
    return True

def main():
    print("🚀 Starting pricing_plans Dutch translation...")
    print("=" * 60)
    
    pairs = fetch_records_with_pricing()
    
    if not pairs:
        print("No records to process")
        return
    
    print()
    print("🔄 Translating pricing_plans...")
    print("=" * 60)
    
    updated = 0
    skipped = 0
    errors = 0
    
    for i, pair in enumerate(pairs, 1):
        slug = pair['slug']
        en_record = pair['en_record']
        nl_record = pair['nl_record']
        
        companion_name = en_record['fields'].get('name (from companion)', ['Unknown'])[0]
        
        print(f"\n[{i}/{len(pairs)}] 📝 {companion_name} ({slug})")
        
        # Get EN pricing_plans
        en_pricing = en_record['fields'].get('pricing_plans', '')
        
        if not en_pricing:
            print(f"   ⏭️  No EN pricing_plans")
            skipped += 1
            continue
        
        # Check if NL already has pricing_plans
        nl_pricing = nl_record['fields'].get('pricing_plans', '')
        
        if nl_pricing and len(nl_pricing) > 100:
            print(f"   ✓ NL pricing_plans already exists ({len(nl_pricing)} chars)")
            skipped += 1
            continue
        
        # Translate
        print(f"   🌍 Translating pricing_plans...")
        
        dutch_pricing = translate_pricing_plan_to_dutch(en_pricing, companion_name)
        
        if not dutch_pricing:
            print(f"   ❌ Translation failed")
            errors += 1
            continue
        
        print(f"   ✅ Translated ({len(en_pricing)} → {len(dutch_pricing)} chars)")
        
        # Preview
        try:
            preview = json.loads(dutch_pricing)
            if preview and len(preview) > 0:
                first_plan = preview[0]
                print(f"   Preview: {first_plan.get('name', 'Unknown plan')}")
                if 'features' in first_plan and len(first_plan['features']) > 0:
                    print(f"            {first_plan['features'][0][:60]}...")
        except:
            pass
        
        # Update
        if update_nl_record(nl_record['id'], dutch_pricing):
            print(f"   💾 Updated in Airtable")
            updated += 1
        else:
            errors += 1
        
        time.sleep(1.5)  # Rate limiting
    
    print()
    print("=" * 60)
    print("✅ Translation completed!")
    print(f"   Updated:  {updated} records")
    print(f"   Skipped:  {skipped} records")
    print(f"   Errors:   {errors} records")
    print(f"   Total:    {len(pairs)} records")
    print("=" * 60)

if __name__ == '__main__':
    main()
