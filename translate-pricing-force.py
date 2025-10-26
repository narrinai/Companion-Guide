#!/usr/bin/env python3
"""
Force update ALL NL/PT pricing_plans - no skipping, aggressive translation
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

API_URL = f'https://api.airtable.com/v0/{AIRTABLE_BASE_ID}/{TRANSLATIONS_TABLE_NAME}'
headers = {
    'Authorization': f'Bearer {AIRTABLE_TOKEN}',
    'Content-Type': 'application/json'
}

# ALL translations sorted by length (longest first to avoid partial replacements)
NL_TRANS = [
    ('Priority support', 'Prioriteitsondersteuning'),
    ('priority support', 'prioriteitsondersteuning'),
    ('Customer support', 'Klantenondersteuning'),
    ('customer support', 'klantenondersteuning'),
    ('Cancel anytime', 'Elk moment opzegbaar'),
    ('Unlimited messages', 'Onbeperkt berichten'),
    ('unlimited messages', 'onbeperkt berichten'),
    ('Limited messages', 'Beperkt berichten'),
    ('limited messages', 'beperkt berichten'),
    ('Access to all', 'Toegang tot alle'),
    ('access to all', 'toegang tot alle'),
    ('Access to', 'Toegang tot'),
    ('access to', 'toegang tot'),
    ('credits per', 'credits per'),  # Keep as is - technical
    ('No ads', 'Geen advertenties'),
    ('Ad-free', 'Advertentievrij'),
    ('per month', 'per maand'),
    ('per year', 'per jaar'),
    ('per day', 'per dag'),
    ('monthly', 'maandelijks'),
    ('Monthly', 'Maandelijks'),
    ('yearly', 'jaarlijks'),
    ('Yearly', 'Jaarlijks'),
    ('annually', 'jaarlijks'),
    ('daily', 'dagelijks'),
    ('Daily', 'Dagelijks'),
    ('Unlimited', 'Onbeperkt'),
    ('unlimited', 'onbeperkt'),
    ('Limited', 'Beperkt'),
    ('limited', 'beperkt'),
    ('conversations', 'gesprekken'),
    ('conversation', 'gesprek'),
    ('interactions', 'interacties'),
    ('interaction', 'interactie'),
    ('customization', 'aanpassing'),
    ('messages', 'berichten'),
    ('message', 'bericht'),
    ('features', 'functies'),
    ('feature', 'functie'),
    ('credits', 'credits'),
    ('images', 'afbeeldingen'),
    ('videos', 'videos'),
    ('support', 'ondersteuning'),
    ('Includes', 'Inclusief'),
    ('includes', 'inclusief'),
]

PT_TRANS = [
    ('Priority support', 'Suporte prioritário'),
    ('priority support', 'suporte prioritário'),
    ('Customer support', 'Suporte ao cliente'),
    ('customer support', 'suporte ao cliente'),
    ('Cancel anytime', 'Cancele a qualquer momento'),
    ('Unlimited messages', 'Mensagens ilimitadas'),
    ('unlimited messages', 'mensagens ilimitadas'),
    ('Limited messages', 'Mensagens limitadas'),
    ('limited messages', 'mensagens limitadas'),
    ('Access to all', 'Acesso a todos'),
    ('access to all', 'acesso a todos'),
    ('Access to', 'Acesso a'),
    ('access to', 'acesso a'),
    ('No ads', 'Sem anúncios'),
    ('Ad-free', 'Sem anúncios'),
    ('per month', 'por mês'),
    ('per year', 'por ano'),
    ('per day', 'por dia'),
    ('monthly', 'mensal'),
    ('yearly', 'anual'),
    ('annually', 'anualmente'),
    ('daily', 'diário'),
    ('Unlimited', 'Ilimitado'),
    ('unlimited', 'ilimitado'),
    ('Limited', 'Limitado'),
    ('limited', 'limitado'),
    ('conversations', 'conversas'),
    ('conversation', 'conversa'),
    ('interactions', 'interações'),
    ('interaction', 'interação'),
    ('customization', 'personalização'),
    ('messages', 'mensagens'),
    ('message', 'mensagem'),
    ('features', 'recursos'),
    ('feature', 'recurso'),
    ('credits', 'créditos'),
    ('images', 'imagens'),
    ('videos', 'vídeos'),
    ('support', 'suporte'),
    ('Includes', 'Inclui'),
    ('includes', 'inclui'),
]

def translate_aggressive(text, lang):
    """Aggressive string replacement - no regex, no complex logic"""
    if not text:
        return text

    trans_list = NL_TRANS if lang == 'nl' else PT_TRANS
    result = text

    for english, translated in trans_list:
        result = result.replace(english, translated)

    return result

def fetch_all_records():
    """Fetch all records"""
    print("📥 Fetching records...")
    records = []
    offset = None

    while True:
        params = {}
        if offset:
            params['offset'] = offset

        response = requests.get(API_URL, headers=headers, params=params)
        if response.status_code != 200:
            return None

        data = response.json()
        records.extend(data.get('records', []))
        offset = data.get('offset')
        if not offset:
            break

    print(f"✅ Fetched {len(records)} records\n")
    return records

def update_record(record_id, fields):
    """Update record"""
    url = f'{API_URL}/{record_id}'
    response = requests.patch(url, headers=headers, json={'fields': fields})
    return response.status_code == 200

def main():
    print("🚀 FORCE TRANSLATION - No skipping!\n")

    records = fetch_all_records()
    if not records:
        return

    updated = 0
    failed = 0

    for record in records:
        fields = record.get('fields', {})
        lang = fields.get('language', 'en')

        if lang not in ['nl', 'pt']:
            continue

        name = fields.get('name', 'Unknown')
        pricing = fields.get('pricing_plans')

        if not pricing:
            continue

        # Get as string
        if isinstance(pricing, str):
            original = pricing
        else:
            original = json.dumps(pricing, ensure_ascii=False)

        # FORCE TRANSLATE - just do string replacement
        translated = translate_aggressive(original, lang)

        # Check if actually changed
        if translated == original:
            print(f"✓ {name} ({lang.upper()}): Already translated")
            continue

        # UPDATE
        print(f"🌍 {name} ({lang.upper()}): Updating...")
        print(f"   {original[:100]}...")
        print(f"   → {translated[:100]}...")

        if update_record(record['id'], {'pricing_plans': translated}):
            print(f"   ✅ Success\n")
            updated += 1
        else:
            print(f"   ❌ Failed\n")
            failed += 1

    print("\n" + "="*50)
    print(f"✅ Updated: {updated}")
    print(f"❌ Failed: {failed}")
    print("="*50)

if __name__ == '__main__':
    main()
