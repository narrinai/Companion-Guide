#!/usr/bin/env python3
"""
Translate all EN body_text to NL body_text in Companion_Translations
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

def translate_body_text(text):
    """Translate body_text using Claude API"""

    prompt = f"""Translate this AI companion description from English to Dutch.

CRITICAL TRANSLATION RULES - KEEP IN ENGLISH:
1. ALL AI terminology: AI girlfriend, AI companion, AI chatbot, AI boyfriend, AI porn, NSFW, SFW
2. Product terms: roleplay, chat, character creation, playground, chatbot, companion, image generation, video creation
3. Technical terms: Stable Diffusion, Deepseek, tokens, API, etc.
4. Brand names: OurDream AI, Character.AI, Replika, DreamGF, Candy AI, etc.
5. Feature names: playground, character creator, memory, personality, unlimited messaging, etc.

TRANSLATE TO DUTCH:
- Regular descriptive words and sentences
- User experience descriptions
- Platform capabilities

EXAMPLES:
❌ WRONG: "ongecensureerd AI metgezel speelterrein platform"
✅ CORRECT: "ongecensureerd AI companion playground platform"

❌ WRONG: "karakter creatie tools"
✅ CORRECT: "character creation tools"

Now translate this text. ONLY return the translation, NO meta-commentary:

{text}"""

    response = anthropic.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=2000,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text.strip()

print("🔄 Translating all NL body_text fields...")
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

# Group by slug
by_slug = {}
for record in all_records:
    fields = record['fields']
    lang = fields.get('language', '')
    slug_field = fields.get('slug (from companion)', [])
    slug = slug_field[0] if isinstance(slug_field, list) and slug_field else ''

    if not slug:
        continue

    if slug not in by_slug:
        by_slug[slug] = {}

    by_slug[slug][lang] = {
        'record_id': record['id'],
        'fields': fields
    }

# Translate NL body_text from EN
updated_count = 0
skipped_count = 0
error_count = 0

nl_slugs = [slug for slug in by_slug if 'nl' in by_slug[slug]]
print(f"Found {len(nl_slugs)} NL records\n")

for i, slug in enumerate(nl_slugs, 1):
    if 'en' not in by_slug[slug]:
        print(f"[{i}/{len(nl_slugs)}] ❌ {slug} - No EN version")
        error_count += 1
        continue

    en_body_text = by_slug[slug]['en']['fields'].get('body_text', '')
    nl_body_text = by_slug[slug]['nl']['fields'].get('body_text', '')
    nl_record_id = by_slug[slug]['nl']['record_id']

    name_field = by_slug[slug]['nl']['fields'].get('name (from companion)', [])
    name = name_field[0] if isinstance(name_field, list) and name_field else slug

    if not en_body_text:
        print(f"[{i}/{len(nl_slugs)}] ⚠️  {name:30} - EN body_text is empty")
        skipped_count += 1
        continue

    # Skip if NL already has body_text that's similar length to EN
    if nl_body_text and len(nl_body_text) > len(en_body_text) * 0.8:
        print(f"[{i}/{len(nl_slugs)}] ✓ {name:30} - Already translated ({len(nl_body_text)} chars)")
        skipped_count += 1
        continue

    print(f"[{i}/{len(nl_slugs)}] 🔄 {name:30} - EN: {len(en_body_text):4} chars... ", end='', flush=True)

    try:
        translated = translate_body_text(en_body_text)
        print(f"NL: {len(translated):4} chars")

        # Update Airtable
        url = f'{API_URL}/{nl_record_id}'
        data = {'fields': {'body_text': translated}}
        response = requests.patch(url, headers=headers, json=data)

        if response.status_code == 200:
            updated_count += 1
        else:
            print(f"    ❌ Update failed: {response.status_code}")
            error_count += 1

        time.sleep(2)  # Rate limiting

    except Exception as e:
        print(f"    ❌ Translation error: {str(e)}")
        error_count += 1

print()
print("=" * 70)
print(f"✅ Translation completed!")
print(f"   Updated:  {updated_count} records")
print(f"   Skipped:  {skipped_count} records (already translated or empty)")
print(f"   Errors:   {error_count} records")
print(f"   Total:    {len(nl_slugs)} records")
print("=" * 70)
