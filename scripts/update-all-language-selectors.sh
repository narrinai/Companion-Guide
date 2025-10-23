#!/bin/bash

# Update all language selector dropdowns to use minimalist text (EN/NL/PT)

cd /Users/sebastiaansmits/Documents/AI-Companion-Reviews

echo "Updating language selectors across all pages..."

# Find all HTML files and update language dropdown text
find . -name "*.html" -not -path "*/node_modules/*" -not -path "*/.git/*" | while read file; do
    # Replace "English" with "EN"
    sed -i '' 's|🇬🇧 English|🇬🇧 EN|g' "$file"

    # Replace "Nederlands" with "NL"
    sed -i '' 's|🇳🇱 Nederlands|🇳🇱 NL|g' "$file"

    # Replace "Português" with "PT"
    sed -i '' 's|🇧🇷 Português|🇧🇷 PT|g' "$file"
done

echo "✅ All language selectors updated!"
echo ""
echo "Updated $(find . -name "*.html" -not -path "*/node_modules/*" -not -path "*/.git/*" | wc -l) files"
