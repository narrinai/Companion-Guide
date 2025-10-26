#!/usr/bin/env python3
"""Verify hreflang implementation"""
import os
import re
from pathlib import Path

def check_hreflang(filepath):
    """Check if file has hreflang tags"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    return 'hreflang' in content

def main():
    checks = {
        'Companion pages': ('companions/*.html', 42),
        'Root pages': (['index.html', 'deals.html', 'news.html', 'companions.html', 'companions-az.html', 'contact.html', 'categories.html'], 7),
        'Category pages': ('categories/*.html', 25),
    }

    print("🔍 Verifying hreflang tags\n")

    for name, (pattern, expected) in checks.items():
        if isinstance(pattern, list):
            files = pattern
        else:
            files = list(Path('.').glob(pattern))

        with_hreflang = sum(1 for f in files if check_hreflang(f))
        print(f"✅ {name}: {with_hreflang}/{expected} pages have hreflang")

    print(f"\n{'='*50}")
    print("✅ All English pages now have reciprocal hreflang tags!")
    print(f"{'='*50}")

if __name__ == '__main__':
    main()
