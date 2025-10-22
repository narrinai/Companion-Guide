#!/bin/bash

# Script to translate ALL category pages to Dutch
# This will loop through all HTML files in the categories/ directory

echo "🌍 Translating all category pages to Dutch..."
echo ""

# Make sure the individual script is executable
chmod +x scripts/translate-category-page.sh

# Count total categories
TOTAL=$(ls -1 categories/*.html | wc -l | tr -d ' ')
CURRENT=0

# Loop through all category HTML files
for file in categories/*.html; do
    # Extract slug from filename
    SLUG=$(basename "$file" .html)

    # Increment counter
    CURRENT=$((CURRENT + 1))

    echo "[$CURRENT/$TOTAL] Translating: $SLUG"

    # Run the translation script for this category
    ./scripts/translate-category-page.sh "$SLUG"

    echo ""
done

echo "✅ All $TOTAL category pages translated!"
echo "📁 Location: nl/categories/"
echo "🌐 Base URL: https://companionguide.ai/nl/categories/"
