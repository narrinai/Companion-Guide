#!/bin/bash

# Script to clean up static verdict-text content in all companion HTML files
# This prevents duplication when JavaScript loads the full my_verdict from Airtable

echo "🧹 Cleaning verdict-text divs in companion pages..."

# Find all companion HTML files
find companions -name "*.html" | while read file; do
  # Check if file has verdict-text with content
  if grep -q '<div class="verdict-text">' "$file"; then
    echo "Processing: $file"

    # Use sed to replace the verdict-text div and its content with an empty div
    # This is a multi-line replacement using perl for better handling
    perl -i -0pe 's/<div class="verdict-text">.*?<\/div>/<div class="verdict-text">\n                    <!-- Content loaded from Airtable via JavaScript -->\n                <\/div>/gs' "$file"

    echo "  ✅ Cleaned verdict-text div"
  fi
done

echo ""
echo "✅ All companion pages cleaned!"
echo "📝 Static verdict summaries removed, JavaScript will load full content from Airtable"
