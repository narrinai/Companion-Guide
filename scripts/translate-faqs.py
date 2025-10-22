#!/usr/bin/env python3
"""
Translate FAQs for Dutch pages
This script translates page-specific FAQs while preserving the unique content per page
"""

import re
from pathlib import Path

# Page-specific FAQ translations
FAQ_TRANSLATIONS = {
    'companions': {
        'nl': [
            ("How do I choose the right AI companion platform?", "Hoe kies ik het juiste AI companion platform?"),
            ("What are the top-rated AI companion platforms in 2025?", "Wat zijn de best beoordeelde AI companion platforms in 2025?"),
            ("Which AI companions offer completely free access?", "Welke AI companions bieden volledig gratis toegang?"),
            ("How do AI companion memory systems work?", "Hoe werken de geheugen systemen van AI companions?"),
            ("What's the average cost of AI companion platforms?", "Wat zijn de gemiddelde kosten van AI companion platforms?"),
            ("Which AI companions work best on mobile devices?", "Welke AI companions werken het beste op mobiele apparaten?"),
            ("Are there AI companions specifically for professionals?", "Zijn er AI companions speciaal voor professionals?"),
            ("How realistic are modern AI companion conversations?", "Hoe realistisch zijn moderne AI companion gesprekken?"),
            ("What safety measures do AI companion platforms implement?", "Welke veiligheidsmaatregelen implementeren AI companion platforms?"),
            ("Can I use multiple AI companion platforms simultaneously?", "Kan ik meerdere AI companion platforms tegelijkertijd gebruiken?"),
        ]
    },
    'categories': {
        'nl': [
            ("What are the different categories of AI companions?", "Wat zijn de verschillende categorieën van AI companions?"),
            ("Which AI companion category is best for beginners?", "Welke AI companion categorie is het beste voor beginners?"),
            ("Are there free AI companions in each category?", "Zijn er gratis AI companions in elke categorie?"),
            ("What's the difference between AI girlfriend and general AI companion platforms?", "Wat is het verschil tussen AI girlfriend en algemene AI companion platforms?"),
            ("Which category offers the most realistic AI interactions?", "Welke categorie biedt de meest realistische AI interacties?"),
            ("Are AI wellness companions safe for mental health support?", "Zijn AI wellness companions veilig voor mentale gezondheidsondersteuning?"),
            ("Which AI companion categories support multiple languages?", "Welke AI companion categorieën ondersteunen meerdere talen?"),
            ("What age restrictions exist for different AI companion categories?", "Welke leeftijdsbeperkingen bestaan er voor verschillende AI companion categorieën?"),
            ("How do privacy protections vary across AI companion categories?", "Hoe variëren privacybeschermingen tussen AI companion categorieën?"),
            ("Which AI companion category offers the best mobile experience?", "Welke AI companion categorie biedt de beste mobiele ervaring?"),
        ]
    },
}

def translate_faqs(page_name, lang_code='nl'):
    """Translate FAQs for a specific page"""

    if page_name not in FAQ_TRANSLATIONS:
        print(f"ℹ️  No FAQs to translate for {page_name}")
        return True

    if lang_code not in FAQ_TRANSLATIONS[page_name]:
        print(f"❌ Language '{lang_code}' not available for {page_name} FAQs")
        return False

    target_file = Path(lang_code) / f"{page_name}.html"

    if not target_file.exists():
        print(f"❌ Target file not found: {target_file}")
        return False

    # Read the file
    with open(target_file, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"🔄 Translating FAQs for {page_name} to {lang_code}...")

    # Get translations for this page and language
    translations = FAQ_TRANSLATIONS[page_name][lang_code]

    # Apply each translation
    for en_question, translated_question in translations:
        pattern = f'<h3 class="faq-question" itemprop="name">{re.escape(en_question)}</h3>'
        replacement = f'<h3 class="faq-question" itemprop="name">{translated_question}</h3>'

        # Count occurrences
        count = len(re.findall(pattern, content))

        if count > 0:
            content = re.sub(pattern, replacement, content)
            print(f"   ✅ Translated: {en_question[:50]}...")
        else:
            print(f"   ⚠️  Not found: {en_question[:50]}...")

    # Also translate the FAQ section title
    content = re.sub(
        r'<h2>AI Companion Platform Guide FAQs</h2>',
        '<h2 data-i18n="faq.title">Veelgestelde Vragen over AI Companion Platforms</h2>',
        content
    )

    # For categories page, use different title
    if page_name == 'categories':
        content = re.sub(
            r'<h2 data-i18n="faq.title">Veelgestelde Vragen over AI Companion Platforms</h2>',
            '<h2 data-i18n="faq.title">Veelgestelde Vragen over AI Companion Categorieën</h2>',
            content
        )

    # Write back
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ FAQs translated for {page_name}")
    return True

if __name__ == '__main__':
    import sys

    if len(sys.argv) < 2:
        # Translate all pages
        pages = ['companions', 'categories']
        print("🌍 Translating FAQs for all pages...\n")
        for page in pages:
            translate_faqs(page, 'nl')
            print()
    else:
        # Translate specific page
        page_name = sys.argv[1]
        lang_code = sys.argv[2] if len(sys.argv) > 2 else 'nl'
        translate_faqs(page_name, lang_code)
