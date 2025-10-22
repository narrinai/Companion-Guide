#!/usr/bin/env python3
"""
Scalable translation script for CompanionGuide.ai
Usage: python scripts/translate-page.py [page-type] [lang-code]
Example: python scripts/translate-page.py companions nl
"""

import sys
import re
from pathlib import Path

# Translation mappings for each language
TRANSLATIONS = {
    'nl': {
        'nav': {
            'home': 'Home',
            'companions': 'Companions',
            'categories': 'Categorieën',
            'news': 'Nieuws',
            'deals': 'Deals',
            'contact': 'Contact',
        },
        'companions': {
            'title': 'Beste AI Chat Platforms & Companions Gerangschikt op Beoordeling',
            'subtitle': 'Volledige rangschikking van AI chat platforms en AI companion platforms gebaseerd op gebruikersbeoordelingen, functies en prestaties. Vind het perfecte AI chat platform of AI companion voor jouw specifieke behoeften en voorkeuren.',
        },
        'categories': {
            'title': 'AI Companion Platform Categorieën',
            'subtitle': 'Ontdek de beste AI companion platforms georganiseerd per categorie en gebruiksdoel. Vind het perfecte platformtype voor jouw specifieke behoeften en voorkeuren.',
        },
        'deals': {
            'title': 'AI Chat & Companion Platform Deals',
            'subtitle': 'Bespaar flink op premium AI chat platforms en AI companion abonnementen met exclusieve deals en kortingscodes voor de beste AI chat ervaringen',
        },
        'news': {
            'title': 'AI Chat & Companion Platform Nieuws',
            'subtitle': 'Blijf op de hoogte van de laatste ontwikkelingen in AI chat platforms en AI companion platforms, industrie analyse en markttrends',
        },
        'contact': {
            'title': 'Neem Contact Op',
            'subtitle': 'Heb je een vraag, suggestie of wil je met ons samenwerken? We horen graag van je!',
        },
        'faq': {
            'title': 'Veelgestelde Vragen over AI Companion Platforms',
        },
        'faqs': [
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
        ],
        'lang': {
            'flag': '🇳🇱',
            'code': 'NL',
            'name': 'Nederlands',
        }
    },
    # Add more languages here
    'de': {
        'nav': {
            'home': 'Startseite',
            'companions': 'Companions',
            'categories': 'Kategorien',
            'news': 'Nachrichten',
            'deals': 'Angebote',
            'contact': 'Kontakt',
        },
        # ... rest of German translations
        'lang': {
            'flag': '🇩🇪',
            'code': 'DE',
            'name': 'Deutsch',
        }
    },
}

def translate_page(page_type, lang_code):
    """Translate a page to the specified language."""

    if lang_code not in TRANSLATIONS:
        print(f"❌ Language '{lang_code}' not supported yet")
        print(f"   Available: {', '.join(TRANSLATIONS.keys())}")
        return False

    trans = TRANSLATIONS[lang_code]

    # Determine source and target files
    source_file = Path(f"{page_type}.html")
    target_dir = Path(lang_code)
    target_file = target_dir / f"{page_type}.html"

    if not source_file.exists():
        print(f"❌ Source file not found: {source_file}")
        return False

    # Create target directory
    target_dir.mkdir(exist_ok=True)

    # Read source file
    with open(source_file, 'r', encoding='utf-8') as f:
        content = f.read()

    print(f"🌍 Translating {page_type}.html to {lang_code}...")

    # 1. Fix HTML lang
    content = content.replace('<html lang="en">', f'<html lang="{lang_code}">')

    # 2. Fix canonical and add hreflang
    canonical_pattern = f'<link rel="canonical" href="https://companionguide.ai/{page_type}">'
    hreflang_tags = f'''<link rel="canonical" href="https://companionguide.ai/{lang_code}/{page_type}">
    <link rel="alternate" hreflang="en" href="https://companionguide.ai/{page_type}">
    <link rel="alternate" hreflang="{lang_code}" href="https://companionguide.ai/{lang_code}/{page_type}">
    <link rel="alternate" hreflang="x-default" href="https://companionguide.ai/{page_type}">'''
    content = content.replace(canonical_pattern, hreflang_tags)

    # 3. Fix OG and Twitter URLs
    content = content.replace(
        f'<meta property="og:url" content="https://companionguide.ai/{page_type}">',
        f'<meta property="og:url" content="https://companionguide.ai/{lang_code}/{page_type}">'
    )
    content = content.replace(
        f'<meta property="twitter:url" content="https://companionguide.ai/{page_type}">',
        f'<meta property="twitter:url" content="https://companionguide.ai/{lang_code}/{page_type}">'
    )

    # 4. Fix CSS path
    content = content.replace('href="style.css"', 'href="/style.css"')

    # 5. Fix logo link
    content = re.sub(r'<h1><a href="/">', f'<h1><a href="/{lang_code}/">', content)

    # 6. Fix navigation
    nav_items = [
        ('home', 'Home', False),
        ('companions', 'Companions', page_type == 'companions'),
        ('categories', 'Categories', page_type == 'categories'),
        ('news', 'News & Insights', page_type == 'news'),
        ('deals', 'Deals', page_type == 'deals'),
        ('contact', 'Contact', page_type == 'contact'),
    ]

    for key, en_text, is_active in nav_items:
        if key == 'news':
            pattern = f'<li><a href="/{key}">News & Insights</a></li>'
        else:
            pattern = f'<li><a href="/{key}"'
            if is_active:
                pattern += ' class="active"'
            pattern += f'>{en_text}</a></li>'

        active_class = ' class="active"' if is_active else ''
        replacement = f'<li><a href="/{lang_code}/{key}"{active_class} data-i18n="nav.{key}">{trans["nav"][key]}</a></li>'
        content = content.replace(pattern, replacement)

    # 7. Translate hero section based on page type
    if page_type in trans:
        # Find and replace hero h1
        hero_pattern = r'<section class="hero">\s*<h1>(.*?)</h1>'
        hero_replacement = f'<section class="hero">\n            <h1 data-i18n="{page_type}.title">{trans[page_type]["title"]}</h1>'
        content = re.sub(hero_pattern, hero_replacement, content, flags=re.DOTALL)

        # Replace subtitle paragraph
        if 'subtitle' in trans[page_type]:
            # Find the first <p> after hero section
            content = re.sub(
                r'(<section class="hero">.*?<h1.*?</h1>\s*)<p>(.*?)</p>',
                f'\\1<p data-i18n="{page_type}.subtitle">{trans[page_type]["subtitle"]}</p>',
                content,
                count=1,
                flags=re.DOTALL
            )

    # 8. Translate FAQ section if present
    if 'faq' in trans and '<h2>AI Companion Platform Guide FAQs</h2>' in content:
        content = content.replace(
            '<h2>AI Companion Platform Guide FAQs</h2>',
            f'<h2 data-i18n="faq.title">{trans["faq"]["title"]}</h2>'
        )

        # Translate FAQ questions
        if 'faqs' in trans:
            for en_q, trans_q in trans['faqs']:
                content = content.replace(
                    f'<h3 class="faq-question" itemprop="name">{en_q}</h3>',
                    f'<h3 class="faq-question" itemprop="name">{trans_q}</h3>'
                )

    # 9. Fix internal links to include language prefix
    content = content.replace('href="/companions/', f'href="/{lang_code}/companions/')
    content = content.replace('href="/categories/', f'href="/{lang_code}/categories/')
    content = content.replace('href="/news/', f'href="/{lang_code}/news/')
    content = content.replace('href="/deals"', f'href="/{lang_code}/deals"')
    content = content.replace('href="/contact"', f'href="/{lang_code}/contact"')

    # 10. Add language switcher before </nav>
    lang_switcher = f'''
            <!-- Language Switcher -->
            <div class="language-switcher">
                <button id="lang-toggle" class="lang-current">
                    {trans['lang']['flag']} {trans['lang']['code']}
                </button>
                <div class="lang-dropdown" id="lang-dropdown" style="display: none;">
                    <a href="/{page_type}" class="lang-option">🇬🇧 English</a>
                    <a href="/{lang_code}/{page_type}" class="lang-option active">{trans['lang']['flag']} {trans['lang']['name']}</a>
                </div>
            </div>
        </nav>'''

    content = content.replace('        </nav>', lang_switcher)

    # 11. Add language switcher script before </body>
    lang_script = '''
    <script>
        // Language switcher
        document.addEventListener('DOMContentLoaded', () => {
            const langToggle = document.getElementById('lang-toggle');
            const langDropdown = document.getElementById('lang-dropdown');

            if (langToggle && langDropdown) {
                langToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const isVisible = langDropdown.style.display === 'block';
                    langDropdown.style.display = isVisible ? 'none' : 'block';
                });

                // Close dropdown when clicking outside
                document.addEventListener('click', (e) => {
                    if (!e.target.closest('.language-switcher')) {
                        langDropdown.style.display = 'none';
                    }
                });
            }
        });
    </script>
</body>'''

    content = content.replace('</body>', lang_script)

    # 12. Add i18n.js if not present
    if 'i18n.js' not in content:
        content = content.replace(
            '<script src="/script.js',
            '<script src="/js/i18n.js"></script>\n    <script src="/script.js'
        )
        content = content.replace(
            '<script src="script.js',
            '<script src="/js/i18n.js"></script>\n    <script src="/script.js'
        )

    # 13. Fix script paths
    content = content.replace('src="script.js', 'src="/script.js')
    content = content.replace('src="js/companions.js', 'src="/js/companions.js')

    # Write target file
    with open(target_file, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ {page_type}.html translated to {lang_code}")
    print(f"📄 File: {target_file}")
    print(f"🌐 URL: https://companionguide.ai/{lang_code}/{page_type}")

    return True

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python scripts/translate-page.py [page-type] [lang-code]")
        print("Example: python scripts/translate-page.py companions nl")
        sys.exit(1)

    page_type = sys.argv[1]
    lang_code = sys.argv[2]

    success = translate_page(page_type, lang_code)
    sys.exit(0 if success else 1)
