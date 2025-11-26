#!/bin/bash

# Script to remove personal-experience sections from companion HTML files
# This content is already included in the my_verdict field from Airtable

echo "🧹 Removing personal-experience sections from companion pages..."

# Find all companion HTML files
find companions -name "*.html" | while read file; do
  # Check if file has personal-experience section
  if grep -q 'class="personal-experience"' "$file"; then
    echo "Processing: $file"

    # Remove the entire personal-experience section using perl
    # This removes from <section class="personal-experience"> to its closing </section>
    perl -i -0pe 's/<section class="personal-experience">.*?<\/section>\n*//gs' "$file"

    echo "  ✅ Removed personal-experience section"
  fi
done

echo ""
echo "✅ All personal-experience sections removed!"
echo "📝 Content is now only in the verdict section via Airtable my_verdict field"
