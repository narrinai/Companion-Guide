#!/usr/bin/env python3
"""
Resume NL verdict translation from record 10 onwards
"""

import os
import json
import requests
import time
import re
from anthropic import Anthropic

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

# Initialize Anthropic client
anthropic = Anthropic(api_key=os.getenv('ANTHROPIC_API_KEY'))

# Records that still need translation (from check script)
RECORDS_TO_TRANSLATE = [
    'nectar-ai',
    'ourdream-ai',
    'pornpen-ai',
    'penly-ai',
    'promptchan-ai',
    'seduced-ai',
    'soulgen-ai',
    'spicychat-ai',
    'undress-ai',
    'vanna-ai'
]

def clean_translation(text):
    """Remove Claude's instruction/meta text from translation"""

    # Remove common instruction phrases
    patterns_to_remove = [
        r"Here's the Dutch translation.*?:\s*\n*",
        r"Here is the Dutch translation.*?:\s*\n*",
        r"Hier is de Nederlandse vertaling.*?:\s*\n*",
        r"\[Note:.*?\]",
        r"\[Continue.*?\]",
        r"\[Would you like.*?\]",
        r"\[Bericht me.*?\]",
        r"Note: Would you like.*",
        r"Would you like me to continue.*",
        r"I can do it in parts if you prefer.*",
        r"Due to length limitations.*",
        r"I've shown.*example.*",
        r"Continued translation follows.*",
    ]

    cleaned = text
    for pattern in patterns_to_remove:
        cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE | re.DOTALL)

    # Remove multiple consecutive newlines
    cleaned = re.sub(r'\n{3,}', '\n\n', cleaned)

    return cleaned.strip()

def translate_with_claude(text_chunk, chunk_num=None):
    """Translate a text chunk using Claude API with cleanup"""

    prompt = f"""Translate this companion review text from English to Dutch.

CRITICAL RULES:
1. Keep ALL AI industry terms in English: AI girlfriend, AI companion, AI chatbot, roleplay, chat, NSFW, character creation, etc.
2. Only translate regular Dutch words and sentences
3. Keep brand names in English (Character.AI, Replika, etc.)
4. DO NOT add any meta-commentary or instructions
5. DO NOT add phrases like "Here's the translation" or "Note: Would you like me to continue"
6. ONLY return the pure translated text, nothing else

Text to translate:

{text_chunk}"""

    try:
        response = anthropic.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=8000,
            messages=[{
                "role": "user",
                "content": prompt
            }]
        )

        translated = response.content[0].text.strip()

        # Clean any meta-text that Claude might have added
        translated = clean_translation(translated)

        chunk_info = f"[{chunk_num}] " if chunk_num else ""
        print(f"      {chunk_info}✅ {len(translated)} chars")

        return translated

    except Exception as e:
        print(f"      ❌ Translation error: {str(e)}")
        return None

def chunk_text(text, max_chars=9000):
    """Split text into chunks at paragraph boundaries"""
    if len(text) <= max_chars:
        return [text]

    chunks = []
    current_chunk = ""

    # Split by paragraphs (double newline)
    paragraphs = text.split('\n\n')

    for para in paragraphs:
        # If adding this paragraph would exceed max, save current chunk
        if len(current_chunk) + len(para) + 2 > max_chars and current_chunk:
            chunks.append(current_chunk.strip())
            current_chunk = para
        else:
            if current_chunk:
                current_chunk += '\n\n' + para
            else:
                current_chunk = para

    # Add remaining chunk
    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

def fetch_records_needing_translation():
    """Fetch specific records by slug"""
    print(f"📥 Fetching {len(RECORDS_TO_TRANSLATE)} records from Companion_Translations...")

    records = []

    for slug in RECORDS_TO_TRANSLATE:
        filter_formula = f"AND({{language}} = 'nl', {{slug}} = '{slug}')"

        params = {'filterByFormula': filter_formula}
        response = requests.get(API_URL, headers=headers, params=params)

        if response.status_code != 200:
            print(f"❌ Error fetching {slug}: {response.status_code}")
            continue

        data = response.json()
        if data.get('records'):
            records.extend(data['records'])

        time.sleep(0.2)

    print(f"✅ Fetched {len(records)} NL records needing translation")
    return records

def update_record(record_id, my_verdict):
    """Update a record with translated my_verdict"""
    url = f'{API_URL}/{record_id}'

    data = {
        'fields': {
            'my_verdict': my_verdict
        }
    }

    response = requests.patch(url, headers=headers, json=data)

    if response.status_code != 200:
        print(f"❌ Error updating record: {response.status_code}")
        print(response.text)
        return False

    return True

def main():
    print("🚀 Resuming NL verdict translation from record 10...")
    print("=" * 70)

    records = fetch_records_needing_translation()

    if not records:
        print("❌ No records found to translate")
        return

    updated_count = 0
    error_count = 0

    for i, record in enumerate(records, 10):  # Start counting from 10
        record_id = record['id']
        fields = record.get('fields', {})

        companion_name = fields.get('name', 'Unknown')
        companion_slug = fields.get('slug', 'unknown')

        print(f"\n[{i}/{9 + len(records)}] 📝 {companion_name} ({companion_slug})")

        # Fetch English version to translate
        en_filter = f"AND({{language}} = 'en', {{slug}} = '{companion_slug}')"
        en_params = {'filterByFormula': en_filter}
        en_response = requests.get(API_URL, headers=headers, params=en_params)

        if en_response.status_code != 200:
            print(f"   ❌ Could not fetch EN version")
            error_count += 1
            continue

        en_data = en_response.json()
        if not en_data.get('records'):
            print(f"   ❌ No EN version found")
            error_count += 1
            continue

        en_verdict = en_data['records'][0]['fields'].get('my_verdict', '')

        if not en_verdict:
            print(f"   ❌ EN verdict is empty")
            error_count += 1
            continue

        print(f"   📊 EN: {len(en_verdict)} chars")

        # Chunk and translate
        chunks = chunk_text(en_verdict, max_chars=9000)
        print(f"   🔄 Translating {len(chunks)} chunk(s)...")

        translated_chunks = []
        for chunk_idx, chunk in enumerate(chunks, 1):
            print(f"      [{chunk_idx}/{len(chunks)}] {len(chunk)} chars... ", end='', flush=True)

            translated = translate_with_claude(chunk, f"{chunk_idx}/{len(chunks)}")

            if translated is None:
                print(f"   ❌ Translation failed for chunk {chunk_idx}")
                error_count += 1
                break

            translated_chunks.append(translated)
            time.sleep(2)  # Rate limiting

        if len(translated_chunks) != len(chunks):
            print(f"   ❌ Translation incomplete")
            continue

        # Combine chunks
        full_translation = '\n\n'.join(translated_chunks)
        print(f"   ✅ NL: {len(full_translation)} chars")

        # Update record
        if update_record(record_id, full_translation):
            print(f"   💾 Updated")
            updated_count += 1
        else:
            print(f"   ❌ Update failed")
            error_count += 1

        time.sleep(0.5)

    print()
    print("=" * 70)
    print(f"✅ Translation completed!")
    print(f"   Updated:  {updated_count} records")
    print(f"   Errors:   {error_count} records")
    print(f"   Total:    {len(records)} records")
    print("=" * 70)

if __name__ == '__main__':
    main()
