#!/usr/bin/env python3
"""
Fix broken internal links that cause 404 errors
"""
import os
import re
from pathlib import Path

# Map of broken URLs to correct URLs
URL_FIXES = {
    '/companions/replika-ai': '/companions/replika',
    '/nl/companions/replika-ai': '/nl/companions/replika',
    '/pt/companions/replika-ai': '/pt/companions/replika',
    '/companions/fantasygf': '/companions/fantasygf-ai',
    '/companions/girlfriendgpt': '/companions/girlfriend-gpt',
    '/categories/ai-boyfriend': '/categories/ai-boyfriend-companions',
    '/categories/wellness-mental-health-companions': '/categories/wellness-companions',
}

def fix_links_in_file(filepath):
    """Fix broken links in a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        changes = 0
        
        for broken, correct in URL_FIXES.items():
            # Fix in href attributes
            pattern = f'href="{broken}"'
            replacement = f'href="{correct}"'
            if pattern in content:
                content = content.replace(pattern, replacement)
                changes += 1
            
            # Fix with domain
            pattern = f'href="https://companionguide.ai{broken}"'
            replacement = f'href="https://companionguide.ai{correct}"'
            if pattern in content:
                content = content.replace(pattern, replacement)
                changes += 1
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return changes
        
        return 0
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return 0

def main():
    print("🔧 Fixing broken internal links\n")
    
    # Find all HTML files
    html_files = list(Path('.').rglob('*.html'))
    
    total_changes = 0
    files_changed = 0
    
    for filepath in html_files:
        # Skip certain directories
        if any(skip in str(filepath) for skip in ['node_modules', '.git', 'debug', 'backup']):
            continue
        
        changes = fix_links_in_file(filepath)
        if changes > 0:
            total_changes += changes
            files_changed += 1
            print(f"✅ {filepath}: Fixed {changes} links")
    
    print(f"\n{'='*50}")
    print(f"✅ Fixed {total_changes} broken links in {files_changed} files")
    print(f"{'='*50}")

if __name__ == '__main__':
    main()
