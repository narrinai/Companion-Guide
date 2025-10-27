#!/usr/bin/env python3
"""
Add data-i18n attributes to ALL category pages (EN, NL, PT)
"""

import os
import re
import glob

# Map filename to i18n key
CATEGORY_KEYS = {
    'adult-content-uncensored-companions.html': 'adultContentUncensored',
    'adult-image-generation-companions.html': 'adultImageGen',
    'ai-boyfriend-companions.html': 'aiBoyfriend',
    'ai-girlfriend-companions.html': 'aiGirlfriend',
    'hentai-ai-chat-platforms.html': 'hentaiAI',
    'learning-companions.html': 'learning',
    'roleplay-character-chat-companions.html': 'roleplayCharacterChat',
    'video-companions-companions.html': 'videoCompanions',
    'wellness-companions.html': 'wellness',
    'whatsapp-only-companions.html': 'whatsappOnly',
    'ai-porn-chat-platforms.html': 'aiPorn'
}

def add_i18n_to_page(filepath, category_key):
    """Add data-i18n attributes to a category page"""

    if not os.path.exists(filepath):
        return False

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Pattern 1: H1 with just text
    content = re.sub(
        r'(<h1>)([^<]+)(</h1>)',
        f'\\1<span data-i18n="categoryPages.{category_key}.title">\\2</span>\\3',
        content,
        count=2  # Only first 2 H1 tags (skip navigation)
    )

    # Pattern 2: Category description
    content = re.sub(
        r'(<p class="category-description">)([^<]+)(</p>)',
        f'\\1<span data-i18n="categoryPages.{category_key}.description">\\2</span>\\3',
        content
    )

    # Pattern 3: Breadcrumb last item (after >)
    content = re.sub(
        r'(<span>>)</span> <span>([^<]+)(</span>)',
        f'\\1</span> <span data-i18n="categoryPages.{category_key}.breadcrumb">\\2\\3',
        content
    )

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True

    return False

print("🌍 Adding data-i18n to ALL category pages...")
print("=" * 70)

# Process all language folders
langs = ['categories', 'nl/categories', 'pt/categories']
total_updated = 0

for lang_folder in langs:
    lang_name = lang_folder.split('/')[0] if '/' in lang_folder else 'EN'
    print(f"\n{lang_name.upper()} Category Pages:")
    print("-" * 70)

    updated = 0
    for filename, category_key in CATEGORY_KEYS.items():
        filepath = os.path.join(lang_folder, filename)

        if not os.path.exists(filepath):
            print(f"  ⚠️  {filename:50} NOT FOUND")
            continue

        print(f"  📝 {filename:50} ", end='', flush=True)

        if add_i18n_to_page(filepath, category_key):
            print("✅")
            updated += 1
            total_updated += 1
        else:
            print("❌ No changes")

    print(f"  Updated: {updated} files")

print()
print("=" * 70)
print(f"✅ Total updated: {total_updated} category pages")
print("=" * 70)
