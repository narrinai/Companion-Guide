#!/usr/bin/env python3
"""
Add hreflang tags to category pages
"""

import os
import re
from pathlib import Path

def get_category_slug(filepath):
    """Extract category slug from filepath"""
    return Path(filepath).stem

def check_translations_exist(slug, base_dir="."):
    """Check if NL and PT translations exist for a category"""
    nl_path = os.path.join(base_dir, "nl", "categories", f"{slug}.html")
    pt_path = os.path.join(base_dir, "pt", "categories", f"{slug}.html")

    return {
        'nl': os.path.exists(nl_path),
        'pt': os.path.exists(pt_path)
    }

def generate_hreflang_tags(slug, translations):
    """Generate hreflang tags for a category page"""
    tags = []

    # Self reference (en)
    tags.append(f'    <link rel="alternate" hreflang="en" href="https://companionguide.ai/categories/{slug}">')

    # NL version
    if translations['nl']:
        tags.append(f'    <link rel="alternate" hreflang="nl" href="https://companionguide.ai/nl/categories/{slug}">')

    # PT version
    if translations['pt']:
        tags.append(f'    <link rel="alternate" hreflang="pt" href="https://companionguide.ai/pt/categories/{slug}">')

    # x-default (English)
    tags.append(f'    <link rel="alternate" hreflang="x-default" href="https://companionguide.ai/categories/{slug}">')

    return '\n'.join(tags)

def add_hreflang_to_file(filepath):
    """Add hreflang tags to an English category page"""
    slug = get_category_slug(filepath)
    translations = check_translations_exist(slug)

    # Skip if no translations exist
    if not translations['nl'] and not translations['pt']:
        print(f"⏭️  {slug}: No translations found")
        return False

    # Read file
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if hreflang already exists
    if 'hreflang' in content:
        print(f"✓  {slug}: Already has hreflang tags")
        return False

    # Find canonical tag
    canonical_pattern = r'(<link rel="canonical"[^>]+>)'
    match = re.search(canonical_pattern, content)

    if not match:
        print(f"⚠️  {slug}: No canonical tag found")
        return False

    # Generate hreflang tags
    hreflang_tags = generate_hreflang_tags(slug, translations)

    # Insert after canonical
    canonical_tag = match.group(1)
    replacement = f"{canonical_tag}\n{hreflang_tags}"

    new_content = content.replace(canonical_tag, replacement)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)

    trans_list = []
    if translations['nl']:
        trans_list.append('NL')
    if translations['pt']:
        trans_list.append('PT')

    print(f"✅ {slug}: Added hreflang tags for {', '.join(trans_list)}")
    return True

def main():
    print("🔧 Adding hreflang tags to English category pages\n")

    categories_dir = "categories"

    if not os.path.exists(categories_dir):
        print("❌ categories/ directory not found")
        return

    # Get all HTML files
    html_files = sorted(Path(categories_dir).glob("*.html"))

    updated = 0
    skipped = 0

    for filepath in html_files:
        if add_hreflang_to_file(str(filepath)):
            updated += 1
        else:
            skipped += 1

    print(f"\n{'='*50}")
    print(f"✅ Updated: {updated} pages")
    print(f"⏭️  Skipped: {skipped} pages")
    print(f"📊 Total: {len(html_files)} pages")
    print(f"{'='*50}")

if __name__ == '__main__':
    main()
