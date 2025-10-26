#!/usr/bin/env python3
"""
Script to translate pricing_plans from English to NL and PT in Companion_Translations table.

Preserves English technical terms like:
- AI Chat, AI Character Chat, Companions
- Kiss Video Generator, early access, etc.
- Plan names (Basic, Premium, etc.)

Only translates descriptive text and features.
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

# API setup
API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{TRANSLATIONS_TABLE_NAME}'
headers = {
    'Authorization': f'Bearer {AIRTABLE_TOKEN}',
    'Content-Type': 'application/json'
}

# Terms to NEVER translate (keep in English)
PRESERVE_TERMS = [
    'AI Chat', 'AI Character Chat', 'AI Companions', 'AI Companion', 'Companions',
    'Kiss Video Generator', 'early access', 'Early Access',
    'AI girlfriend', 'AI boyfriend', 'NSFW', 'SFW',
    'Premium', 'Basic', 'Free', 'Pro', 'Plus', 'Ultimate',
    'Standard', 'Advanced', 'Elite', 'VIP', 'Gold', 'Silver',
    'Bronze', 'Starter', 'Enterprise', 'Business',
    'AI', 'API', 'GPT', 'SDK', 'Beta', 'Alpha',
    'video generation', 'voice chat', 'voice calls',
    'roleplay', 'character creation', 'memory', 'chat history',
]

# Dutch translations for common pricing terms
NL_TRANSLATIONS = {
    'per month': 'per maand',
    'per year': 'per jaar',
    'per day': 'per dag',
    'monthly': 'maandelijks',
    'yearly': 'jaarlijks',
    'annually': 'jaarlijks',
    'daily': 'dagelijks',
    'Unlimited': 'Onbeperkt',
    'unlimited': 'onbeperkt',
    'Limited': 'Beperkt',
    'limited': 'beperkt',
    'messages': 'berichten',
    'message': 'bericht',
    'credits': 'credits',
    'images': 'afbeeldingen',
    'videos': 'videos',
    'features': 'functies',
    'feature': 'functie',
    'access to': 'toegang tot',
    'Access to': 'Toegang tot',
    'includes': 'inclusief',
    'Includes': 'Inclusief',
    'support': 'ondersteuning',
    'priority support': 'prioriteitsondersteuning',
    'Priority support': 'Prioriteitsondersteuning',
    'customer support': 'klantenondersteuning',
    'Customer support': 'Klantenondersteuning',
    'No ads': 'Geen advertenties',
    'Ad-free': 'Advertentievrij',
    'Cancel anytime': 'Elk moment opzegbaar',
    'conversations': 'gesprekken',
    'interactions': 'interacties',
    'customization': 'aanpassing',
}

# Portuguese translations for common pricing terms
PT_TRANSLATIONS = {
    'per month': 'por mês',
    'per year': 'por ano',
    'per day': 'por dia',
    'monthly': 'mensal',
    'yearly': 'anual',
    'annually': 'anualmente',
    'daily': 'diário',
    'Unlimited': 'Ilimitado',
    'unlimited': 'ilimitado',
    'Limited': 'Limitado',
    'limited': 'limitado',
    'messages': 'mensagens',
    'message': 'mensagem',
    'credits': 'créditos',
    'images': 'imagens',
    'videos': 'vídeos',
    'features': 'recursos',
    'feature': 'recurso',
    'access to': 'acesso a',
    'Access to': 'Acesso a',
    'includes': 'inclui',
    'Includes': 'Inclui',
    'support': 'suporte',
    'priority support': 'suporte prioritário',
    'Priority support': 'Suporte prioritário',
    'customer support': 'suporte ao cliente',
    'Customer support': 'Suporte ao cliente',
    'No ads': 'Sem anúncios',
    'Ad-free': 'Sem anúncios',
    'Cancel anytime': 'Cancele a qualquer momento',
    'conversations': 'conversas',
    'interactions': 'interações',
    'customization': 'personalização',
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

def translate_text(text, lang):
    """Translate text while preserving English technical terms"""
    if not text or not isinstance(text, str):
        return text

    import re

    # First, check if text contains any preserved terms - if so, protect them
    protected_text = text
    placeholders = {}

    # Sort preserve terms by length (longest first) to match longer phrases first
    sorted_preserve_terms = sorted(PRESERVE_TERMS, key=len, reverse=True)

    for i, term in enumerate(sorted_preserve_terms):
        pattern = re.compile(re.escape(term), re.IGNORECASE)
        matches = list(pattern.finditer(protected_text))
        for match in reversed(matches):  # Replace from end to start to maintain positions
            placeholder = f"__PRESERVE_{i}_{match.start()}__"
            placeholders[placeholder] = match.group()
            protected_text = protected_text[:match.start()] + placeholder + protected_text[match.end():]

    # Choose translation dictionary
    translations = NL_TRANSLATIONS if lang == 'nl' else PT_TRANSLATIONS

    # Sort translations by length (longest first) to match longer phrases first
    sorted_translations = sorted(translations.items(), key=lambda x: len(x[0]), reverse=True)

    # Translate each term
    result = protected_text
    for english, translated in sorted_translations:
        # Try word boundary first, but fallback to simpler matching
        try:
            # Use word boundary matching for better accuracy
            pattern = re.compile(r'\b' + re.escape(english) + r'\b', re.IGNORECASE)

            def replace_match(match):
                original = match.group()
                # Preserve original case
                if original.isupper():
                    return translated.upper()
                elif len(original) > 0 and original[0].isupper():
                    return translated.capitalize()
                else:
                    return translated.lower()

            new_result = pattern.sub(replace_match, result)

            # If word boundary didn't match anything, try simpler case-sensitive replacement
            if new_result == result:
                # Try exact case match
                if english in result:
                    result = result.replace(english, translated)
                elif english.capitalize() in result:
                    result = result.replace(english.capitalize(), translated.capitalize())
                elif english.lower() in result:
                    result = result.replace(english.lower(), translated.lower())
            else:
                result = new_result
        except:
            # Fallback to simple replacement
            if english in result:
                result = result.replace(english, translated)
            elif english.capitalize() in result:
                result = result.replace(english.capitalize(), translated.capitalize())
            elif english.lower() in result:
                result = result.replace(english.lower(), translated.lower())

    # Restore preserved terms
    for placeholder, original in placeholders.items():
        result = result.replace(placeholder, original)

    return result

def translate_pricing_plans(pricing_plans, lang):
    """
    Translate pricing_plans JSON structure.

    Expected structure:
    [
        {
            "name": "Basic",  # DON'T translate plan names
            "price": 9.99,
            "period": "monthly",  # Translate
            "features": ["Feature 1", "Feature 2"]  # Translate descriptions
        }
    ]
    """
    if not pricing_plans:
        return None

    # Parse if string
    if isinstance(pricing_plans, str):
        try:
            plans = json.loads(pricing_plans)
        except json.JSONDecodeError:
            return pricing_plans
    else:
        plans = pricing_plans

    if not isinstance(plans, list):
        return pricing_plans

    # Translate each plan
    translated_plans = []

    for plan in plans:
        if not isinstance(plan, dict):
            translated_plans.append(plan)
            continue

        translated_plan = {}

        for key, value in plan.items():
            if key == 'name':
                # DON'T translate plan names
                translated_plan[key] = value
            elif key == 'price':
                # DON'T translate prices
                translated_plan[key] = value
            elif key == 'period':
                # Translate period (monthly, yearly, etc.)
                translated_plan[key] = translate_text(value, lang) if isinstance(value, str) else value
            elif key == 'features' and isinstance(value, list):
                # Translate features list
                translated_plan[key] = [
                    translate_text(feature, lang) if isinstance(feature, str) else feature
                    for feature in value
                ]
            elif key == 'description':
                # Translate description
                translated_plan[key] = translate_text(value, lang) if isinstance(value, str) else value
            else:
                # Translate other text fields
                translated_plan[key] = translate_text(value, lang) if isinstance(value, str) else value

        translated_plans.append(translated_plan)

    return json.dumps(translated_plans, ensure_ascii=False)

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
    print("🚀 Starting pricing_plans translation script...")
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

        # Only process NL and PT records
        if language not in ['nl', 'pt']:
            skipped_count += 1
            continue

        print(f"\n📝 Processing: {companion_name} ({language.upper()})")

        # Check if pricing_plans field exists
        pricing_plans = fields.get('pricing_plans')

        if not pricing_plans:
            print(f"   ⏭️  No pricing_plans field - skipping")
            skipped_count += 1
            continue

        # Get the English version to compare
        # (We assume pricing_plans in NL/PT might still be in English)

        # Translate pricing_plans
        translated_pricing = translate_pricing_plans(pricing_plans, language)

        if not translated_pricing:
            print(f"   ⏭️  Could not translate - skipping")
            skipped_count += 1
            continue

        # Check if there's actually a change
        # Also check if the translated version still contains English terms that should be translated
        if isinstance(pricing_plans, str):
            original_str = pricing_plans
        else:
            original_str = json.dumps(pricing_plans, ensure_ascii=False)

        # Check if original contains English terms that should be translated
        english_terms_to_translate = [
            'monthly', 'yearly', 'annually', 'daily',
            'Unlimited', 'unlimited', 'Limited', 'limited',
            'messages', 'message', 'conversations', 'conversation',
            'features', 'feature', 'interactions', 'interaction',
            'Access to', 'access to', 'Priority support', 'Customer support',
            'No ads', 'Ad-free', 'Cancel anytime',
        ]

        has_english_terms = any(term in original_str for term in english_terms_to_translate)

        if not has_english_terms:
            print(f"   ✓ Already translated - no English terms found")
            skipped_count += 1
            continue

        # If we have English terms, check if translation actually changed anything
        try:
            if isinstance(pricing_plans, str):
                original_parsed = json.loads(pricing_plans)
            else:
                original_parsed = pricing_plans

            translated_parsed = json.loads(translated_pricing)

            # Compare the actual content
            if original_parsed == translated_parsed:
                print(f"   ⚠️  Has English terms but translation didn't change anything")
                print(f"      Original: {original_str[:100]}...")
                skipped_count += 1
                continue
        except Exception as e:
            # If parsing fails, just compare as strings
            if original_str == translated_pricing:
                print(f"   ⚠️  Has English terms but translation didn't change anything")
                print(f"      Original: {original_str[:100]}...")
                skipped_count += 1
                continue

        print(f"   📊 Original: {original_str[:100]}...")
        print(f"   🌍 Translated: {translated_pricing[:100]}...")

        # Update the record
        update_fields = {
            'pricing_plans': translated_pricing
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
