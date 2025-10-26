#!/usr/bin/env python3
"""
Update PT category pages with i18n attributes and correct script paths
Based on the working ai-porn-chat-platforms.html template
"""

import re
import sys

def update_pt_category_html(filepath, category_key):
    """Update a PT category HTML file with data-i18n attributes"""

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Fix script paths (relative to absolute)
    content = re.sub(
        r'<script src="\.\./js/i18n\.js\?v=\d+"',
        '<script src="/js/i18n.js?v=20251022"',
        content
    )
    content = re.sub(
        r'<script src="\.\./script\.js\?v=\d+"',
        '<script src="/script.js?v=20251007"',
        content
    )

    # Add data-i18n to title (h1)
    content = re.sub(
        r'(<h1[^>]*>)([^<]+)(</h1>)',
        rf'\1<span data-i18n="companionsPage.{category_key}.title">\2</span>\3',
        content,
        count=1
    )

    # Add data-i18n to description
    content = re.sub(
        r'(<p class="category-description"[^>]*>)([^<]+)(</p>)',
        rf'\1<span data-i18n="companionsPage.{category_key}.description">\2</span>\3',
        content,
        count=1
    )

    # Add data-i18n to insights title
    content = re.sub(
        r'(<h2>)([^<]*Insights[^<]*)(</h2>)',
        rf'\1<span data-i18n="companionsPage.{category_key}.insightsTitle">\2</span>\3',
        content,
        count=1
    )

    # Add data-i18n to comparison title
    content = re.sub(
        r'(<h2>)([^<]*Comparison[^<]*|[^<]*Compar[^<]*)(</h2>)',
        rf'\1<span data-i18n="companionsPage.{category_key}.comparisonTitle">\2</span>\3',
        content,
        count=1
    )

    # Add data-i18n to FAQ title
    content = re.sub(
        r'(<h2>)([^<]*FAQ[^<]*)(</h2>)',
        rf'\1<span data-i18n="companionsPage.{category_key}.faqTitle">\2</span>\3',
        content,
        count=1
    )

    # Add data-i18n to comparison table headers
    table_headers = {
        'Platform': 'platform',
        'Rating': 'rating',
        'Pricing': 'pricing',
        'Key Feature': 'keyFeature',
        'Best For': 'bestFor'
    }

    for header_text, header_key in table_headers.items():
        content = re.sub(
            rf'(<th[^>]*>)({header_text})(</th>)',
            rf'\1<span data-i18n="companionsPage.{category_key}.comparison.{header_key}">\2</span>\3',
            content
        )

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✓ Updated {filepath}")

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python update-category-pages.py <filepath> <category_key>")
        sys.exit(1)

    filepath = sys.argv[1]
    category_key = sys.argv[2]

    update_pt_category_html(filepath, category_key)
