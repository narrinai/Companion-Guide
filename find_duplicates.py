#!/usr/bin/env python3
"""
Script to find duplicate reviewer names within individual companion pages.
"""

import os
import re
from collections import defaultdict

def extract_reviewer_names(file_path):
    """Extract all reviewer names from an HTML file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Find all reviewer names using regex
        pattern = r'<span class="reviewer-name">([^<]+)</span>'
        names = re.findall(pattern, content)

        return names
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return []

def find_duplicates_in_files(directory):
    """Find duplicate reviewer names within each companion file."""
    files_with_duplicates = {}

    for filename in os.listdir(directory):
        if filename.endswith('.html'):
            file_path = os.path.join(directory, filename)
            reviewer_names = extract_reviewer_names(file_path)

            if not reviewer_names:
                continue

            # Count occurrences of each name
            name_counts = defaultdict(int)
            for name in reviewer_names:
                name_counts[name] += 1

            # Find duplicates
            duplicates = {name: count for name, count in name_counts.items() if count > 1}

            if duplicates:
                files_with_duplicates[filename] = {
                    'duplicates': duplicates,
                    'all_names': reviewer_names
                }

    return files_with_duplicates

def main():
    companions_dir = '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/companions'

    print("🔍 Searching for duplicate reviewer names within individual companion pages...\n")

    duplicates_found = find_duplicates_in_files(companions_dir)

    if not duplicates_found:
        print("✅ No duplicate reviewer names found within individual pages!")
    else:
        print(f"⚠️  Found duplicate reviewer names in {len(duplicates_found)} files:\n")

        for filename, data in duplicates_found.items():
            print(f"📁 {filename}")
            print("   Duplicates:")
            for name, count in data['duplicates'].items():
                print(f"     - '{name}' appears {count} times")

            print("   All reviewer names in order:")
            for i, name in enumerate(data['all_names'], 1):
                print(f"     {i}. {name}")
            print()

if __name__ == "__main__":
    main()