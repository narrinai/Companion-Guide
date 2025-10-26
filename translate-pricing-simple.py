#!/usr/bin/env python3
"""
Simplified pricing_plans translation script - uses straightforward string replacement
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

# Dutch translations - sorted by length (longest first)
NL_TRANSLATIONS = {
    'Priority support': 'Prioriteitsondersteuning',
    'Customer support': 'Klantenondersteuning',
    'Cancel anytime': 'Elk moment opzegbaar',
    'Access to all': 'Toegang tot alle',
    'Access to': 'Toegang tot',
    'No ads': 'Geen advertenties',
    'Ad-free': 'Advertentievrij',
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
    'conversations': 'gesprekken',
    'conversation': 'gesprek',
    'interactions': 'interacties',
    'interaction': 'interactie',
    'customization': 'aanpassing',
    'messages': 'berichten',
    'message': 'bericht',
    'features': 'functies',
    'feature': 'functie',
    'credits': 'credits',
    'images': 'afbeeldingen',
    'videos': 'videos',
    'support': 'ondersteuning',
    'Includes': 'Inclusief',
    'includes': 'inclusief',
}

# Portuguese translations - sorted by length (longest first)
PT_TRANSLATIONS = {
    'Priority support': 'Suporte prioritário',
    'Customer support': 'Suporte ao cliente',
    'Cancel anytime': 'Cancele a qualquer momento',
    'Access to all': 'Acesso a todos',
    'Access to': 'Acesso a',
    'No ads': 'Sem anúncios',
    'Ad-free': 'Sem anúncios',
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
    'conversations': 'conversas',
    'conversation': 'conversa',
    'interactions': 'interações',
    'interaction': 'interação',
    'customization': 'personalização',
    'messages': 'mensagens',
    'message': 'mensagem',
    'features': 'recursos',
    'feature': 'recurso',
    'credits': 'créditos',
    'images': 'imagens',
    'videos': 'vídeos',
    'support': 'suporte',
    'Includes': 'Inclui',
    'includes': 'inclui',
}

def fetch_all_records():
    """Fetch all records"""
    print("📥 Fetching records from Companion_Translations...")
    records = []
    offset = None

    while True:
        params = {}
        if offset:
            params['offset'] = offset

        response = requests.get(API_URL, headers=headers, params=params)

        if response.status_code != 200:
            print(f"❌ Error: {response.status_code}")
            return None

        data = response.json()
        records.extend(data.get('records', []))

        offset = data.get('offset')
        if not offset:
            break

    print(f"✅ Fetched {len(records)} records")
    return records

def simple_translate(text, lang):
    """Simple string replacement translation"""
    if not text or not isinstance(text, str):
        return text

    translations = NL_TRANSLATIONS if lang == 'nl' else PT_TRANSLATIONS
    result = text

    # Apply translations (already sorted by length)
    for english, translated in translations.items():
        result = result.replace(english, translated)

    return result

def translate_pricing_plans(pricing_json, lang):
    """Translate pricing_plans JSON"""
    if not pricing_json:
        return None

    try:
        if isinstance(pricing_json, str):
            plans = json.loads(pricing_json)
        else:
            plans = pricing_json
    except:
        return None

    if not isinstance(plans, list):
        return None

    # Translate each plan
    for plan in plans:
        if not isinstance(plan, dict):
            continue

        # Don't translate: name, price
        # Translate: period, features, description, and other text fields

        for key, value in list(plan.items()):
            if key in ['name', 'price']:
                # Keep as is
                continue
            elif key == 'features' and isinstance(value, list):
                # Translate each feature
                plan[key] = [simple_translate(f, lang) if isinstance(f, str) else f for f in value]
            elif isinstance(value, str):
                # Translate other string fields
                plan[key] = simple_translate(value, lang)

    return json.dumps(plans, ensure_ascii=False)

def update_record(record_id, fields):
    """Update record in Airtable"""
    url = f'{API_URL}/{record_id}'
    data = {'fields': fields}
    response = requests.patch(url, headers=headers, json=data)

    if response.status_code != 200:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        return False

    return True

def main():
    print("🚀 Starting simplified pricing_plans translation...")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

    records = fetch_all_records()
    if not records:
        return

    print("\n🔄 Processing records...\n")

    updated_count = 0
    skipped_count = 0

    for record in records:
        record_id = record['id']
        fields = record.get('fields', {})

        companion_name = fields.get('name', 'Unknown')
        language = fields.get('language', 'en')

        # Only NL and PT
        if language not in ['nl', 'pt']:
            skipped_count += 1
            continue

        pricing_plans = fields.get('pricing_plans')

        if not pricing_plans:
            print(f"⏭️  {companion_name} ({language.upper()}): No pricing_plans")
            skipped_count += 1
            continue

        # Translate
        translated = translate_pricing_plans(pricing_plans, language)

        if not translated:
            print(f"⏭️  {companion_name} ({language.upper()}): Translation failed")
            skipped_count += 1
            continue

        # Compare
        if isinstance(pricing_plans, str):
            original_str = pricing_plans
        else:
            original_str = json.dumps(pricing_plans, ensure_ascii=False)

        if original_str == translated:
            print(f"✓  {companion_name} ({language.upper()}): No changes needed")
            skipped_count += 1
            continue

        # Update
        print(f"🌍 {companion_name} ({language.upper()}): Updating...")
        print(f"   Before: {original_str[:80]}...")
        print(f"   After:  {translated[:80]}...")

        if update_record(record_id, {'pricing_plans': translated}):
            print(f"   ✅ Updated successfully\n")
            updated_count += 1
        else:
            print(f"   ❌ Update failed\n")

    print("\n" + "=" * 50)
    print(f"✅ Script completed!")
    print(f"   Updated: {updated_count} records")
    print(f"   Skipped: {skipped_count} records")
    print(f"   Total: {len(records)} records")
    print("=" * 50)

if __name__ == '__main__':
    main()
