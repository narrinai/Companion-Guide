#!/usr/bin/env python3
"""
Fix hreflang to non-canonical issues by ensuring all hreflang tags
match the canonical URL of each page
"""

import os
import re
from pathlib import Path

def get_canonical_url(filepath):
    """Extract canonical URL from a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        match = re.search(r'<link rel="canonical" href="([^"]+)">', content)
        if match:
            return match.group(1)
        return None
    except:
        return None

def get_hreflang_urls(filepath):
    """Extract all hreflang URLs from a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        matches = re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">', content)
        return matches  # [(lang, url), ...]
    except:
        return []

def fix_hreflang_in_file(filepath):
    """Fix hreflang tags to match canonical URLs"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        # Get canonical URL of this page
        canonical = get_canonical_url(filepath)
        if not canonical:
            return False

        # Extract language from path
        if '/nl/' in str(filepath):
            page_lang = 'nl'
        elif '/pt/' in str(filepath):
            page_lang = 'pt'
        else:
            page_lang = 'en'

        # Get hreflang tags
        hreflang_tags = get_hreflang_urls(filepath)
        if not hreflang_tags:
            return False

        changes = 0
        original_content = content

        # For each hreflang link, verify it points to a canonical URL
        for lang, url in hreflang_tags:
            if lang == 'x-default':
                continue

            # Construct the expected filepath for this hreflang
            if lang == 'en':
                target_path = url.replace('https://companionguide.ai', '.')
            elif lang == 'nl':
                target_path = url.replace('https://companionguide.ai/nl', './nl')
            elif lang == 'pt':
                target_path = url.replace('https://companionguide.ai/pt', './pt')
            else:
                continue

            # Add .html if not present
            if not target_path.endswith('.html') and not target_path.endswith('/'):
                target_path += '.html'

            # Check if this file exists and get its canonical
            if os.path.exists(target_path):
                target_canonical = get_canonical_url(target_path)

                # If the hreflang URL doesn't match the target's canonical, fix it
                if target_canonical and url != target_canonical:
                    old_tag = f'<link rel="alternate" hreflang="{lang}" href="{url}">'
                    new_tag = f'<link rel="alternate" hreflang="{lang}" href="{target_canonical}">'

                    if old_tag in content:
                        content = content.replace(old_tag, new_tag)
                        changes += 1
                        print(f"   Fixed {lang}: {url} → {target_canonical}")

        if changes > 0:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True

        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    print("🔧 Fixing hreflang to non-canonical issues\n")

    # Find all HTML files
    html_files = list(Path('.').rglob('*.html'))

    fixed = 0
    checked = 0

    for filepath in html_files:
        # Skip certain directories
        if any(skip in str(filepath) for skip in ['node_modules', '.git', 'debug', 'backup', 'test']):
            continue

        checked += 1

        if fix_hreflang_in_file(filepath):
            print(f"✅ {filepath}")
            fixed += 1

    print(f"\n{'='*50}")
    print(f"✅ Fixed: {fixed} files")
    print(f"📊 Checked: {checked} files")
    print(f"{'='*50}")

if __name__ == '__main__':
    main()
