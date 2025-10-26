#!/usr/bin/env python3
"""
Standardize logo and branding across all HTML pages.
Changes:
1. Desktop nav logo: "Companion Guide" → "CompanionGuide.ai"
2. Mobile menu logo: "Companion Guide" → "CompanionGuide.ai"
3. Alt text updated for consistency
"""

import re
import glob
from pathlib import Path

def standardize_logo(filepath):
    """Update logo branding on a single HTML file"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    changes_made = []

    # Pattern 1: Desktop nav logo - update text and alt
    # From: <h1><a href="/"><img src="/images/logo.svg" alt="Companion Guide" width="32" height="32">Companion Guide</a></h1>
    # To:   <h1><a href="/"><img src="/images/logo.svg" alt="CompanionGuide.ai" width="32" height="32">CompanionGuide.ai</a></h1>

    desktop_pattern = r'(<h1><a href="/"><img src="/images/logo\.svg" alt=")[^"]*(" width="32" height="32">)[^<]*(</a></h1>)'
    desktop_replacement = r'\1CompanionGuide.ai\2CompanionGuide.ai\3'

    new_content = re.sub(desktop_pattern, desktop_replacement, content)
    if new_content != content:
        changes_made.append("desktop logo")
        content = new_content

    # Pattern 2: Mobile menu logo image alt text
    # From: <img src="/images/logo.svg" alt="Companion Guide" width="48" height="48">
    # To:   <img src="/images/logo.svg" alt="CompanionGuide.ai" width="48" height="48">

    mobile_img_pattern = r'(<div class="mobile-menu-logo">\s*<img src="/images/logo\.svg" alt=")[^"]*(" width="48" height="48">)'
    mobile_img_replacement = r'\1CompanionGuide.ai\2'

    new_content = re.sub(mobile_img_pattern, mobile_img_replacement, content, flags=re.DOTALL)
    if new_content != content:
        changes_made.append("mobile logo image alt")
        content = new_content

    # Pattern 3: Mobile menu logo text
    # From: <span>Companion Guide</span>
    # To:   <span>CompanionGuide.ai</span>

    mobile_text_pattern = r'(<div class="mobile-menu-logo">.*?<span>)[^<]*(</span>)'
    mobile_text_replacement = r'\1CompanionGuide.ai\2'

    new_content = re.sub(mobile_text_pattern, mobile_text_replacement, content, flags=re.DOTALL)
    if new_content != content:
        changes_made.append("mobile logo text")
        content = new_content

    # Also handle alternative desktop logo format with longer alt text
    desktop_alt_pattern = r'(<h1><a href="/"><img src="/images/logo\.svg" alt=")[^"]*( - AI companion reviews[^"]*" width="32" height="32">)[^<]*(</a></h1>)'
    desktop_alt_replacement = r'\1CompanionGuide.ai - AI companion reviews and guides logo\2CompanionGuide.ai\3'

    new_content = re.sub(desktop_alt_pattern, desktop_alt_replacement, content)
    if new_content != content and "desktop logo" not in changes_made:
        changes_made.append("desktop logo (alt format)")
        content = new_content

    # Write back if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True, changes_made

    return False, []

def main():
    """Process all HTML files"""

    # Patterns for all HTML files
    patterns = [
        '*.html',
        'companions/*.html',
        'pt/companions/*.html',
        'nl/companions/*.html',
        'categories/*.html',
        'pt/categories/*.html',
        'nl/categories/*.html',
        'news/*.html',
        'pt/news/*.html',
        'nl/news/*.html',
    ]

    total_files = 0
    updated_files = 0

    for pattern in patterns:
        files = glob.glob(pattern)
        for filepath in files:
            total_files += 1
            updated, changes = standardize_logo(filepath)
            if updated:
                updated_files += 1
                print(f"✅ Updated {filepath}: {', '.join(changes)}")

    print(f"\n{'='*60}")
    print(f"📊 Summary:")
    print(f"   Total files processed: {total_files}")
    print(f"   Files updated: {updated_files}")
    print(f"   Files unchanged: {total_files - updated_files}")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()
