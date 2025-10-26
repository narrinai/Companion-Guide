#!/usr/bin/env python3
"""
Test script for pricing_plans translation logic
"""

import json

# Test data
test_pricing_en = [
    {
        "name": "Basic",
        "price": 9.99,
        "period": "monthly",
        "features": [
            "Unlimited AI Chat",
            "100 messages per month",
            "AI Character Chat",
            "Cancel anytime"
        ],
        "description": "Perfect for trying out AI Companions"
    },
    {
        "name": "Premium",
        "price": 19.99,
        "period": "monthly",
        "features": [
            "Unlimited messages",
            "Priority support",
            "AI girlfriend features",
            "Image generation access",
            "early access to new features"
        ]
    }
]

# Dutch translations
NL_TRANSLATIONS = {
    'per month': 'per maand',
    'per year': 'per jaar',
    'monthly': 'maandelijks',
    'yearly': 'jaarlijks',
    'Unlimited': 'Onbeperkt',
    'messages': 'berichten',
    'Cancel anytime': 'Elk moment opzegbaar',
    'Perfect for trying out': 'Perfect om uit te proberen',
    'Priority support': 'Prioriteitsondersteuning',
    'features': 'functies',
    'access': 'toegang',
    'Image generation': 'Afbeelding generatie',
}

# Portuguese translations
PT_TRANSLATIONS = {
    'per month': 'por mês',
    'per year': 'por ano',
    'monthly': 'mensal',
    'yearly': 'anual',
    'Unlimited': 'Ilimitado',
    'messages': 'mensagens',
    'Cancel anytime': 'Cancele a qualquer momento',
    'Perfect for trying out': 'Perfeito para experimentar',
    'Priority support': 'Suporte prioritário',
    'features': 'recursos',
    'access': 'acesso',
    'Image generation': 'Geração de imagem',
}

PRESERVE_TERMS = [
    'AI Chat', 'AI Character Chat', 'AI Companions', 'AI Companion',
    'early access', 'Early Access', 'AI girlfriend', 'AI boyfriend',
    'video generation', 'voice chat',
]

def translate_text(text, lang):
    """Translate text while preserving English technical terms"""
    if not text or not isinstance(text, str):
        return text

    # First, protect preserved terms
    import re
    protected_text = text
    placeholders = {}

    for i, term in enumerate(PRESERVE_TERMS):
        pattern = re.compile(re.escape(term), re.IGNORECASE)
        match = pattern.search(protected_text)
        if match:
            placeholder = f"__PRESERVE_{i}__"
            placeholders[placeholder] = match.group()
            protected_text = pattern.sub(placeholder, protected_text, count=1)

    # Choose translation dictionary
    translations = NL_TRANSLATIONS if lang == 'nl' else PT_TRANSLATIONS
    result = protected_text

    # Translate
    for english, translated in translations.items():
        result = result.replace(english, translated)
        result = result.replace(english.capitalize(), translated.capitalize())

    # Restore preserved terms
    for placeholder, original in placeholders.items():
        result = result.replace(placeholder, original)

    return result

def translate_pricing_plans(pricing_plans, lang):
    """Translate pricing_plans structure"""
    translated_plans = []

    for plan in pricing_plans:
        translated_plan = {}

        for key, value in plan.items():
            if key == 'name' or key == 'price':
                # Don't translate names or prices
                translated_plan[key] = value
            elif key == 'period':
                # Translate period
                translated_plan[key] = translate_text(value, lang)
            elif key == 'features' and isinstance(value, list):
                # Translate features
                translated_plan[key] = [translate_text(f, lang) for f in value]
            elif isinstance(value, str):
                # Translate other text fields
                translated_plan[key] = translate_text(value, lang)
            else:
                translated_plan[key] = value

        translated_plans.append(translated_plan)

    return translated_plans

print("=" * 70)
print("TESTING PRICING PLANS TRANSLATION")
print("=" * 70)

print("\n📋 ORIGINAL (English):")
print(json.dumps(test_pricing_en, indent=2, ensure_ascii=False))

print("\n🇳🇱 DUTCH TRANSLATION:")
nl_translation = translate_pricing_plans(test_pricing_en, 'nl')
print(json.dumps(nl_translation, indent=2, ensure_ascii=False))

print("\n🇧🇷 PORTUGUESE TRANSLATION:")
pt_translation = translate_pricing_plans(test_pricing_en, 'pt')
print(json.dumps(pt_translation, indent=2, ensure_ascii=False))

print("\n" + "=" * 70)
print("✅ PRESERVED TERMS CHECK:")
print("=" * 70)

# Check that certain terms are NOT translated
preserved_terms = ['AI Chat', 'AI Character Chat', 'AI Companions', 'early access', 'Basic', 'Premium']

nl_json = json.dumps(nl_translation)
pt_json = json.dumps(pt_translation)

print("\n🔍 Checking Dutch translation:")
for term in preserved_terms:
    if term in nl_json:
        print(f"   ✅ '{term}' preserved")
    else:
        print(f"   ⚠️  '{term}' might have been changed")

print("\n🔍 Checking Portuguese translation:")
for term in preserved_terms:
    if term in pt_json:
        print(f"   ✅ '{term}' preserved")
    else:
        print(f"   ⚠️  '{term}' might have been changed")

print("\n" + "=" * 70)
