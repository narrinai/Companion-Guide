#!/usr/bin/env python3
"""
Add missing hreflang tags to all pages that have translations.
Fixes reciprocal hreflang errors by ensuring bidirectional linking.
"""

import os
import re
from pathlib import Path

# Mapping of English pages to their translations
PAGE_MAPPINGS = {
    # Root pages
    'index.html': {
        'en': 'https://companionguide.ai/',
        'nl': 'https://companionguide.ai/nl/',
        'pt': 'https://companionguide.ai/pt/',
        'x-default': 'https://companionguide.ai/'
    },
    'deals.html': {
        'en': 'https://companionguide.ai/deals',
        'nl': 'https://companionguide.ai/nl/deals',
        'pt': 'https://companionguide.ai/pt/deals',
        'x-default': 'https://companionguide.ai/deals'
    },
    'news.html': {
        'en': 'https://companionguide.ai/news',
        'nl': 'https://companionguide.ai/nl/news',
        'pt': 'https://companionguide.ai/pt/news',
        'x-default': 'https://companionguide.ai/news'
    },
    'companions.html': {
        'en': 'https://companionguide.ai/companions',
        'nl': 'https://companionguide.ai/nl/companions',
        'pt': 'https://companionguide.ai/pt/companions',
        'x-default': 'https://companionguide.ai/companions'
    },
    'companions-az.html': {
        'en': 'https://companionguide.ai/companions-az',
        'nl': 'https://companionguide.ai/nl/companions-az',
        'pt': 'https://companionguide.ai/pt/companions-az',
        'x-default': 'https://companionguide.ai/companions-az'
    },
    'contact.html': {
        'en': 'https://companionguide.ai/contact',
        'nl': 'https://companionguide.ai/nl/contact',
        'pt': 'https://companionguide.ai/pt/contact',
        'x-default': 'https://companionguide.ai/contact'
    },
    'categories.html': {
        'en': 'https://companionguide.ai/categories',
        'nl': 'https://companionguide.ai/nl/categories',
        'pt': 'https://companionguide.ai/pt/categories',
        'x-default': 'https://companionguide.ai/categories'
    },
}

def generate_hreflang_tags(urls):
    """Generate hreflang tags from URL mapping"""
    tags = []
    for lang, url in sorted(urls.items()):
        if lang == 'x-default':
            continue
        tags.append(f'    <link rel="alternate" hreflang="{lang}" href="{url}">')

    # Add x-default last
    if 'x-default' in urls:
        tags.append(f'    <link rel="alternate" hreflang="x-default" href="{urls["x-default"]}">')

    return '\n'.join(tags)

def add_hreflang_to_file(filepath, urls):
    """Add hreflang tags to a page"""
    # Read file
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if hreflang already exists
    if 'hreflang' in content:
        print(f"✓  {filepath}: Already has hreflang tags")
        return False

    # Find canonical tag
    canonical_pattern = r'(<link rel="canonical"[^>]+>)'
    match = re.search(canonical_pattern, content)

    if not match:
        print(f"⚠️  {filepath}: No canonical tag found")
        return False

    # Generate hreflang tags
    hreflang_tags = generate_hreflang_tags(urls)

    # Insert after canonical
    canonical_tag = match.group(1)
    replacement = f"{canonical_tag}\n{hreflang_tags}"

    new_content = content.replace(canonical_tag, replacement)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print(f"✅ {filepath}: Added hreflang tags")
    return True

def main():
    print("🔧 Adding hreflang tags to all English pages\n")

    updated = 0
    skipped = 0
    missing = 0

    for filename, urls in PAGE_MAPPINGS.items():
        if not os.path.exists(filename):
            print(f"⏭️  {filename}: File not found")
            missing += 1
            continue

        if add_hreflang_to_file(filename, urls):
            updated += 1
        else:
            skipped += 1

    print(f"\n{'='*50}")
    print(f"✅ Updated: {updated} pages")
    print(f"✓  Skipped: {skipped} pages (already have hreflang)")
    print(f"⏭️  Missing: {missing} files")
    print(f"📊 Total: {len(PAGE_MAPPINGS)} pages checked")
    print(f"{'='*50}")

if __name__ == '__main__':
    main()
