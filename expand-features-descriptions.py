#!/usr/bin/env python3
"""
Script to expand feature descriptions in Companion_Translations table.
Keeps titles the same, but makes descriptions more detailed and informative.
"""

import os
import json
import requests
from datetime import datetime
import time

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

# Description expansion templates per language
DESCRIPTION_EXPANSIONS = {
    'en': {
        # Free/Pricing related
        'Free': 'Completely free to use with no hidden costs',
        'Unlimited access': 'Full unlimited access to all features and content',
        'Free trial': 'Try all premium features with a free trial period',
        'Freemium': 'Free basic version with optional premium upgrades',
        '100% Free': 'Completely free platform with no payment required',
        
        # Privacy related
        'Private': 'Your conversations are private and encrypted',
        'Privacy First': 'Strong privacy protection with secure data handling',
        'Local models': 'AI runs locally on your device for maximum privacy',
        'Secure': 'End-to-end encryption for all your interactions',
        'Anonymous': 'Use the platform anonymously without personal data',
        
        # Character/Customization
        'Multiple categories': 'Wide variety of character types and categories',
        'Diverse Characters': 'Extensive selection of diverse AI personalities',
        'Customizable': 'Fully customizable characters and interactions',
        'Character Creation': 'Create and customize your own unique AI characters',
        'Personality Options': 'Choose from multiple distinct personality types',
        
        # Features
        'Story generation': 'Advanced AI-powered story and scenario generation',
        'Creative Tools': 'Comprehensive creative writing and roleplay tools',
        'Voice chat': 'Real-time voice conversations with AI characters',
        'Image generation': 'AI-powered image creation and visual content',
        'Memory': 'Long-term memory that remembers your conversations',
        'Roleplaying': 'Immersive roleplay experiences with detailed scenarios',
        'NSFW': 'Mature content available for adult users (18+)',
        'Uncensored': 'Unrestricted conversations without content filtering',
        
        # Technical
        'Mobile app': 'Dedicated mobile apps for iOS and Android devices',
        'Cross-platform': 'Seamless experience across all your devices',
        'Fast responses': 'Quick AI response times for natural conversations',
        'Advanced AI': 'Powered by cutting-edge AI language models',
        'API access': 'Developer API available for custom integrations',
    },
    
    'nl': {
        # Free/Pricing
        'Free': 'Volledig gratis te gebruiken zonder verborgen kosten',
        'Unlimited access': 'Volledige onbeperkte toegang tot alle features en content',
        'Free trial': 'Probeer alle premium features met een gratis proefperiode',
        'Freemium': 'Gratis basisversie met optionele premium upgrades',
        '100% Free': 'Volledig gratis platform zonder betaling vereist',
        
        # Privacy
        'Private': 'Je gesprekken zijn privé en versleuteld',
        'Privacy First': 'Sterke privacy bescherming met veilige data handling',
        'Local models': 'AI draait lokaal op je apparaat voor maximale privacy',
        'Secure': 'End-to-end encryptie voor al je interacties',
        'Anonymous': 'Gebruik het platform anoniem zonder persoonlijke data',
        
        # Character/Customization
        'Multiple categories': 'Brede variëteit aan character types en categorieën',
        'Diverse Characters': 'Uitgebreide selectie van diverse AI personalities',
        'Customizable': 'Volledig aanpasbare characters en interacties',
        'Character Creation': 'Creëer en personaliseer je eigen unieke AI characters',
        'Personality Options': 'Kies uit meerdere onderscheidende personality types',
        
        # Features
        'Story generation': 'Geavanceerde AI-powered story en scenario generatie',
        'Creative Tools': 'Uitgebreide creative writing en roleplay tools',
        'Voice chat': 'Real-time voice gesprekken met AI characters',
        'Image generation': 'AI-powered image creatie en visuele content',
        'Memory': 'Long-term memory die je gesprekken onthoudt',
        'Roleplaying': 'Immersive roleplay ervaringen met gedetailleerde scenarios',
        'NSFW': 'Mature content beschikbaar voor volwassen gebruikers (18+)',
        'Uncensored': 'Onbeperkte gesprekken zonder content filtering',
        
        # Technical
        'Mobile app': 'Dedicated mobile apps voor iOS en Android apparaten',
        'Cross-platform': 'Naadloze ervaring op al je apparaten',
        'Fast responses': 'Snelle AI response times voor natuurlijke gesprekken',
        'Advanced AI': 'Powered by cutting-edge AI language models',
        'API access': 'Developer API beschikbaar voor custom integraties',
    },
    
    'pt': {
        # Free/Pricing
        'Free': 'Completamente gratuito sem custos ocultos',
        'Unlimited access': 'Acesso ilimitado completo a todos os recursos e conteúdos',
        'Free trial': 'Experimente todos os recursos premium com período de teste gratuito',
        'Freemium': 'Versão básica gratuita com upgrades premium opcionais',
        '100% Free': 'Plataforma completamente gratuita sem pagamento necessário',
        
        # Privacy
        'Private': 'Suas conversas são privadas e criptografadas',
        'Privacy First': 'Forte proteção de privacidade com tratamento seguro de dados',
        'Local models': 'IA roda localmente no seu dispositivo para máxima privacidade',
        'Secure': 'Criptografia end-to-end para todas as suas interações',
        'Anonymous': 'Use a plataforma anonimamente sem dados pessoais',
        
        # Character/Customization
        'Multiple categories': 'Grande variedade de tipos de personagens e categorias',
        'Diverse Characters': 'Ampla seleção de personalidades de IA diversas',
        'Customizable': 'Personagens e interações totalmente personalizáveis',
        'Character Creation': 'Crie e personalize seus próprios personagens de IA únicos',
        'Personality Options': 'Escolha entre múltiplos tipos de personalidade distintos',
        
        # Features
        'Story generation': 'Geração avançada de histórias e cenários com IA',
        'Creative Tools': 'Ferramentas abrangentes de escrita criativa e roleplay',
        'Voice chat': 'Conversas de voz em tempo real com personagens de IA',
        'Image generation': 'Criação de imagens e conteúdo visual com IA',
        'Memory': 'Memória de longo prazo que lembra suas conversas',
        'Roleplaying': 'Experiências de roleplay imersivas com cenários detalhados',
        'NSFW': 'Conteúdo adulto disponível para usuários maiores de 18 anos',
        'Uncensored': 'Conversas irrestritas sem filtragem de conteúdo',
        
        # Technical
        'Mobile app': 'Aplicativos móveis dedicados para dispositivos iOS e Android',
        'Cross-platform': 'Experiência perfeita em todos os seus dispositivos',
        'Fast responses': 'Tempos de resposta rápidos da IA para conversas naturais',
        'Advanced AI': 'Alimentado por modelos de linguagem de IA de ponta',
        'API access': 'API para desenvolvedores disponível para integrações personalizadas',
    }
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
        
        time.sleep(0.2)  # Rate limiting
    
    print(f"✅ Fetched {len(records)} records")
    return records

def expand_description(title, current_desc, lang='en'):
    """
    Expand a feature description based on title
    Keeps title the same, but makes description more detailed
    """
    # Get language-specific expansions
    expansions = DESCRIPTION_EXPANSIONS.get(lang, DESCRIPTION_EXPANSIONS['en'])
    
    # Check if we have a direct match for the current description
    if current_desc in expansions:
        return expansions[current_desc]
    
    # Check if the title matches any expansion
    if title in expansions:
        return expansions[title]
    
    # If description is already long enough (>50 chars), keep it
    if len(current_desc) > 50:
        return current_desc
    
    # Otherwise, try to make it slightly longer
    # Simple heuristic: add context based on common patterns
    if len(current_desc) < 30:
        # Make short descriptions a bit longer
        return current_desc + " with advanced features"
    
    return current_desc

def expand_features(features, lang='en'):
    """Expand feature descriptions while keeping titles the same"""
    if not features or len(features) == 0:
        return features, False
    
    expanded = []
    changed = False
    
    for feature in features:
        if isinstance(feature, dict):
            icon = feature.get('icon', '')
            title = feature.get('title', '')
            current_desc = feature.get('description', feature.get('text', ''))
            
            # Expand the description
            new_desc = expand_description(title, current_desc, lang)
            
            if new_desc != current_desc:
                changed = True
            
            expanded_feature = {
                'icon': icon,
                'title': title,
                'description': new_desc
            }
            expanded.append(expanded_feature)
        else:
            expanded.append(feature)
    
    return expanded, changed

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
    print("🚀 Starting features description expansion script...")
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
    error_count = 0
    
    for record in records:
        record_id = record['id']
        fields = record.get('fields', {})
        
        companion_name = fields.get('name', 'Unknown')
        language = fields.get('language', 'en')
        
        print(f"\n📝 {companion_name} ({language})")
        
        # Check if features field exists
        features_raw = fields.get('features')
        
        if not features_raw:
            print(f"   ⏭️  No features field")
            skipped_count += 1
            continue
        
        # Parse existing features
        try:
            if isinstance(features_raw, str):
                features = json.loads(features_raw)
            else:
                features = features_raw
        except json.JSONDecodeError:
            print(f"   ❌ Invalid JSON in features")
            error_count += 1
            continue
        
        if not features or len(features) == 0:
            print(f"   ⏭️  Empty features")
            skipped_count += 1
            continue
        
        # Expand descriptions
        expanded_features, changed = expand_features(features, language)
        
        if not changed:
            print(f"   ✓ Already optimal")
            skipped_count += 1
            continue
        
        # Show what changed
        print(f"   📊 Expanding {len(features)} features:")
        for i, (old, new) in enumerate(zip(features, expanded_features)):
            old_desc = old.get('description', old.get('text', ''))
            new_desc = new.get('description', '')
            if old_desc != new_desc:
                print(f"      • {old.get('title', 'Unknown')}")
                print(f"        {old_desc} → {new_desc}")
        
        # Update the record
        update_fields = {
            'features': json.dumps(expanded_features, ensure_ascii=False)
        }
        
        if update_record(record_id, update_fields):
            print(f"   ✅ Updated")
            updated_count += 1
        else:
            print(f"   ❌ Update failed")
            error_count += 1
        
        # Rate limiting
        time.sleep(0.2)
    
    print()
    print("=" * 60)
    print(f"✅ Script completed!")
    print(f"   Updated: {updated_count} records")
    print(f"   Skipped: {skipped_count} records")
    print(f"   Errors:  {error_count} records")
    print(f"   Total:   {len(records)} records")
    print("=" * 60)

if __name__ == '__main__':
    main()
