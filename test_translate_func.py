import sys
sys.path.insert(0, '.')
from translate_pricing_plans import translate_text

test = "✅ Unlimited conversations"
result = translate_text(test, 'nl')
print(f"Original: {test}")
print(f"Translated: {result}")
print(f"Changed: {test != result}")
