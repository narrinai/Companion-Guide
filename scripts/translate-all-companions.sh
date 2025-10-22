#!/bin/bash

# Script to translate ALL companion pages to Dutch
# This will loop through all HTML files in the companions/ directory

echo "🌍 Translating all companion pages to Dutch..."
echo ""

# Make sure the individual script is executable
chmod +x scripts/translate-companion-page.sh

# Count total companions
TOTAL=$(ls -1 companions/*.html | wc -l | tr -d ' ')
CURRENT=0

# Loop through all companion HTML files
for file in companions/*.html; do
    # Extract slug from filename
    SLUG=$(basename "$file" .html)

    # Increment counter
    CURRENT=$((CURRENT + 1))

    echo "[$CURRENT/$TOTAL] Translating: $SLUG"

    # Run the translation script for this companion
    ./scripts/translate-companion-page.sh "$SLUG"

    echo ""
done

echo "✅ All $TOTAL companion pages translated!"
echo "📁 Location: nl/companions/"
echo "🌐 Base URL: https://companionguide.ai/nl/companions/"
