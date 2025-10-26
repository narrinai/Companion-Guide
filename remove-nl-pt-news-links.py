#!/usr/bin/env python3
"""
Remove links to non-existent NL/PT news articles from pages
"""
import os
import re
from pathlib import Path

def remove_news_links_from_file(filepath):
    """Remove NL/PT news article links from a file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()

        original = content

        # Pattern to match article links in news sections
        # These are typically in <article> or news card sections
        patterns = [
            # Match full article blocks with NL/PT news links
            r'<article[^>]*>.*?href="/(?:nl|pt)/news/[^"]*".*?</article>',
            # Match list items with NL/PT news links
            r'<li[^>]*>.*?href="/(?:nl|pt)/news/[^"]*".*?</li>',
            # Match divs with news-card class containing NL/PT news links
            r'<div class="news-card[^"]*"[^>]*>.*?href="/(?:nl|pt)/news/[^"]*".*?</div>',
        ]

        changes = 0
        for pattern in patterns:
            matches = re.finditer(pattern, content, re.DOTALL)
            for match in matches:
                content = content.replace(match.group(0), '')
                changes += 1

        # Also remove just the links if they're standalone
        # href="/nl/news/..." or href="/pt/news/..."
        link_pattern = r'<a\s+href="/(nl|pt)/news/[^"]*"[^>]*>.*?</a>'
        standalone_links = re.findall(link_pattern, content, re.DOTALL)
        if standalone_links:
            for link in standalone_links:
                # Don't remove if it's just linking to /nl/news or /pt/news (overview pages)
                if not re.search(r'/(nl|pt)/news"', link):
                    changes += 1

        content = re.sub(link_pattern, lambda m: '' if not m.group(0).endswith('/news"') else m.group(0), content)

        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            return True

        return False
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
        return False

def main():
    print("🔧 Removing links to non-existent NL/PT news articles\n")

    # Focus on NL/PT index and news pages
    files_to_check = [
        'nl/index.html',
        'pt/index.html',
        'nl/news.html',
        'pt/news.html',
    ]

    files_changed = 0

    for filepath in files_to_check:
        if os.path.exists(filepath):
            if remove_news_links_from_file(filepath):
                files_changed += 1
                print(f"✅ {filepath}: Removed NL/PT news article links")
        else:
            print(f"⏭️  {filepath}: File not found")

    print(f"\n{'='*50}")
    print(f"✅ Updated {files_changed} files")
    print(f"{'='*50}")
    print("\n⚠️  Note: Individual news articles in NL/PT will 404 until translated")
    print("   Consider adding redirects or creating the translations")

if __name__ == '__main__':
    main()
