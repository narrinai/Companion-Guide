#!/usr/bin/env python3
import re
import glob

def fix_duplicate_features(filepath):
    """Remove duplicate hardcoded features after dynamic-features container"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if file has both dynamic-features and highlight-item
    if 'id="dynamic-features"' not in content or 'class="highlight-item"' not in content:
        return False

    # Pattern to match: dynamic-features div + closing tag + any hardcoded highlight-items + closing </div>
    # We want to remove everything after the dynamic-features closing </div> until we hit </section>
    pattern = r'(<div class="intro-highlights" id="dynamic-features">.*?</div>)\s*((?:<div class="highlight-item">.*?</div>\s*)+)</div>'

    # Replace with just the dynamic container and closing section div
    replacement = r'\1\n        </section>'

    # Try the replacement
    new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True

    return False

# Process all companion pages
patterns = [
    'companions/*.html',
    'pt/companions/*.html',
    'nl/companions/*.html'
]

fixed_count = 0
for pattern in patterns:
    files = glob.glob(pattern)
    for filepath in files:
        if fix_duplicate_features(filepath):
            print(f"Fixed: {filepath}")
            fixed_count += 1

print(f"\n✅ Fixed {fixed_count} files")
