#!/bin/bash

# Script to add Crushon AI Alternatives guide to Featured Guides section in all HTML files

# Find all HTML files with "Featured Guides" section
for file in $(find . -name "*.html" -type f); do
    # Skip backup files and test files
    if [[ "$file" == *"-backup"* ]] || [[ "$file" == *"test-"* ]]; then
        continue
    fi

    # Check if file has Featured Guides section and doesn't already have crushon-ai-alternatives
    if grep -q '<h4>Featured Guides</h4>' "$file" && ! grep -q 'crushon-ai-alternatives-complete-guide-2025' "$file"; then
        echo "Processing: $file"

        # Add Crushon AI Alternatives guide as the first item after <h4>Featured Guides</h4>
        # Find the line after <h4>Featured Guides</h4> and <ul>, then add the new item
        sed -i '' '/<h4>Featured Guides<\/h4>/,/<ul>/ {
            /<ul>/ a\
                        <li><a href="/news/crushon-ai-alternatives-complete-guide-2025">Crushon AI Alternatives Guide</a></li>
        }' "$file"

        echo "  ✓ Added Crushon AI Alternatives guide"
    fi
done

echo ""
echo "Done! Crushon AI Alternatives guide added to all Featured Guides sections."
