#!/usr/bin/env python3
"""Debug why translation isn't working"""

import json

test_pricing = '[{"name":"Free 🔨","price":0,"period":"free","features":["✅ Unlimited conversations","✅ Unlimited characters","✅ No ads"]}]'

# Test the translation function
import sys
sys.path.insert(0, '.')

# Import just the translate_text function logic
NL_TRANSLATIONS = {
    'Unlimited': 'Onbeperkt',
    'conversations': 'gesprekken',
    'characters': 'personages',
    'No ads': 'Geen advertenties',
}

PRESERVE_TERMS = ['AI Chat', 'Free']

def translate_text_simple(text):
    """Simple translation without preservation"""
    result = text
    for eng, nl in NL_TRANSLATIONS.items():
        result = result.replace(eng, nl)
    return result

print("Original:")
print(test_pricing)
print("\nParsed:")
parsed = json.loads(test_pricing)
print(json.dumps(parsed, indent=2))

print("\n\nTest simple translation of a feature:")
feature = "✅ Unlimited conversations"
print(f"Original: {feature}")
print(f"Translated: {translate_text_simple(feature)}")

print("\n\nFull pricing translation:")
translated_plans = []
for plan in parsed:
    translated_plan = {}
    for key, value in plan.items():
        if key == 'features' and isinstance(value, list):
            translated_plan[key] = [translate_text_simple(f) for f in value]
        elif isinstance(value, str):
            translated_plan[key] = translate_text_simple(value)
        else:
            translated_plan[key] = value
    translated_plans.append(translated_plan)

print(json.dumps(translated_plans, indent=2, ensure_ascii=False))

# Test if they're equal
original_parsed = json.loads(test_pricing)
print(f"\n\nAre they equal? {original_parsed == translated_plans}")
print("They SHOULD be different!")
