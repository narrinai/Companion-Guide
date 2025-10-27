#!/usr/bin/env python3
"""
Translate all EN companion data to PT in Companion_Translations
Fields to translate: tagline, description, best_for
"""

import os
import requests
import time
from anthropic import Anthropic

AIRTABLE_TOKEN = os.getenv('AIRTABLE_TOKEN_CG')
AIRTABLE_BASE_ID = os.getenv('AIRTABLE_BASE_ID_CG')
API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/Companion_Translations'
headers = {
    'Authorization': f'Bearer {AIRTABLE_TOKEN}',
    'Content-Type': 'application/json'
}

anthropic = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

def translate_to_portuguese(text, field_name):
    """Translate text to Portuguese using Claude"""

    prompt = f"""Translate this {field_name} from English to Portuguese (Brazil).

CRITICAL RULES:
1. Keep ALL AI industry terms in English: AI girlfriend, AI companion, AI chatbot, AI boyfriend, roleplay, chat, NSFW, SFW, character creation, playground, image generation, video generation
2. Only translate regular Portuguese words and explanatory text
3. Keep brand names in English (Character.AI, Replika, Stable Diffusion, etc.)
4. DO NOT add any meta-commentary or notes
5. ONLY return the pure Portuguese translation

Text to translate:

{text}"""

    response = anthropic.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text.strip()

print("🇵🇹 Translating all companions to Portuguese...")
print("=" * 70)

# Fetch all records
all_records = []
offset = None

while True:
    params = {}
    if offset:
        params['offset'] = offset

    response = requests.get(API_URL, headers=headers, params=params)
    data = response.json()
    all_records.extend(data.get('records', []))

    offset = data.get('offset')
    if not offset:
        break
    time.sleep(0.2)

print(f"✅ Fetched {len(all_records)} total records\n")

# Group by companion ID
by_companion = {}
for record in all_records:
    fields = record['fields']
    lang = fields.get('language', '')
    companion_id = fields.get('companion', [None])[0]

    if not companion_id:
        continue

    if companion_id not in by_companion:
        by_companion[companion_id] = {}

    by_companion[companion_id][lang] = {
        'record_id': record['id'],
        'fields': fields
    }

# Find companions that need PT translation
needs_translation = []
for companion_id, langs in by_companion.items():
    if 'en' in langs and 'pt' not in langs:
        needs_translation.append(companion_id)

print(f"Found {len(needs_translation)} companions needing PT translation\n")

if not needs_translation:
    print("✅ All companions already have PT translations!")
    exit(0)

# Translate each companion
updated_count = 0
error_count = 0

for i, companion_id in enumerate(needs_translation, 1):
    en_data = by_companion[companion_id]['en']
    en_fields = en_data['fields']

    name_field = en_fields.get('name (from companion)', [])
    name = name_field[0] if isinstance(name_field, list) and name_field else 'Unknown'

    print(f"[{i}/{len(needs_translation)}] 🔄 {name}")

    # Get fields to translate
    en_tagline = en_fields.get('tagline', '')
    en_description = en_fields.get('description', '')
    en_best_for = en_fields.get('best_for', '')

    if not en_tagline and not en_description and not en_best_for:
        print(f"   ⚠️  No content to translate")
        continue

    try:
        # Translate each field
        pt_data = {}

        if en_tagline:
            print(f"   📝 Translating tagline... ", end='', flush=True)
            pt_data['tagline'] = translate_to_portuguese(en_tagline, 'tagline')
            print(f"✅ {len(pt_data['tagline'])} chars")
            time.sleep(1.5)

        if en_description:
            print(f"   📝 Translating description... ", end='', flush=True)
            pt_data['description'] = translate_to_portuguese(en_description, 'description')
            print(f"✅ {len(pt_data['description'])} chars")
            time.sleep(1.5)

        if en_best_for:
            print(f"   📝 Translating best_for... ", end='', flush=True)
            pt_data['best_for'] = translate_to_portuguese(en_best_for, 'best for')
            print(f"✅ {len(pt_data['best_for'])} chars")
            time.sleep(1.5)

        # Create new PT record
        new_record = {
            'fields': {
                'companion': [companion_id],
                'language': 'pt',
                **pt_data
            }
        }

        response = requests.post(API_URL, headers=headers, json=new_record)

        if response.status_code == 200:
            print(f"   ✅ Created PT record")
            updated_count += 1
        else:
            print(f"   ❌ Failed to create record: {response.status_code}")
            print(f"   {response.text[:200]}")
            error_count += 1

        time.sleep(0.5)

    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        error_count += 1
        time.sleep(1)

print()
print("=" * 70)
print(f"✅ Translation completed!")
print(f"   Created:  {updated_count} PT records")
print(f"   Errors:   {error_count} records")
print(f"   Total:    {len(needs_translation)} companions")
print("=" * 70)
