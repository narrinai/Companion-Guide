#!/bin/bash

# Script to add Crushon AI Alternatives guide to Featured Guides section in all HTML files

# Find all HTML files with "Featured Guides" section in the main directories
for file in *.html companions/*.html categories/*.html news/*.html; do
    # Skip if file doesn't exist
    [ ! -f "$file" ] && continue

    # Skip backup files and test files
    if [[ "$file" == *"-backup"* ]] || [[ "$file" == *"test-"* ]]; then
        continue
    fi

    # Check if file has Featured Guides section and doesn't already have crushon-ai-alternatives
    if grep -q '<h4>Featured Guides</h4>' "$file" && ! grep -q 'crushon-ai-alternatives-complete-guide-2025' "$file"; then
        echo "Processing: $file"

        # Use perl for more reliable in-place editing
        perl -i -pe 'if (/<h4>Featured Guides<\/h4>/../<\/ul>/ && /<ul>/) {
            $_ .= "                        <li><a href=\"/news/crushon-ai-alternatives-complete-guide-2025\">Crushon AI Alternatives Guide</a></li>\n";
        }' "$file"

        echo "  ✓ Added Crushon AI Alternatives guide"
    fi
done

echo ""
echo "Done! Crushon AI Alternatives guide added to all Featured Guides sections."
