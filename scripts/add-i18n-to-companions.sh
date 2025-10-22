#!/bin/bash

# Add i18n.js script to all companion detail pages
# This enables ?lang=nl parameter to work on individual companion pages

echo "Adding i18n.js script to companion pages..."

for file in companions/*.html; do
  if [ -f "$file" ]; then
    # Check if i18n.js is already included
    if ! grep -q "js/i18n.js" "$file"; then
      echo "Processing: $file"

      # Add i18n.js right after the opening <body> tag or before script.js
      # Insert before the first <script src="../script.js"> line
      sed -i '' '/<script src="\.\.\/script\.js/i\
    <script src="../js/i18n.js?v=20251022"><\/script>
' "$file"

      echo "  ✓ Added i18n.js to $file"
    else
      echo "  - Skipping $file (i18n.js already present)"
    fi
  fi
done

echo ""
echo "✓ Completed! i18n.js added to all companion pages."
echo "Now companion pages will support ?lang=nl parameter via Netlify redirects."
