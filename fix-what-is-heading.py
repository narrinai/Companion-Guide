#!/usr/bin/env python3
"""
Fix "What is" heading by removing data-i18n attribute.
The companion-page.js will handle the translation dynamically.
"""

import os
import re
from pathlib import Path

def fix_what_is_heading(filepath):
    """Remove data-i18n from 'What is' heading"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Pattern: <h2 data-i18n="companion.whatIs">What is [Name]?</h2>
    # Remove the data-i18n attribute but keep everything else
    content = re.sub(
        r'(<h2) data-i18n="companion\.whatIs"(>What is [^<]+</h2>)',
        r'\1\2',
        content
    )

    # Check if changes were made
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Fix all companion HTML files"""

    companion_files = list(Path('companions').glob('*.html'))

    print(f"Found {len(companion_files)} companion HTML files")
    print("Fixing 'What is' headings...\n")

    fixed_count = 0

    for filepath in companion_files:
        if fix_what_is_heading(filepath):
            print(f"✅ Fixed: {filepath.name}")
            fixed_count += 1

    print(f"\n✅ Fixed {fixed_count}/{len(companion_files)} files")

if __name__ == '__main__':
    main()
