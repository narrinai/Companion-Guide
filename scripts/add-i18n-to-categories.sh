#!/bin/bash

# Add i18n.js script to all category detail pages
# This enables ?lang=nl parameter to work on individual category pages

echo "Adding i18n.js script to category pages..."

for file in categories/*.html; do
  if [ -f "$file" ]; then
    # Check if i18n.js is already included
    if ! grep -q "js/i18n.js" "$file"; then
      echo "Processing: $file"

      # Add i18n.js right before script.js
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
echo "✓ Completed! i18n.js added to all category pages."
echo "Now category pages will support ?lang=nl parameter via Netlify redirects."
