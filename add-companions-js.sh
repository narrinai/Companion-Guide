#!/bin/bash

echo "Adding companions.js to category pages..."

# Find all category HTML files
for file in $(find ./categories -name "*.html" -type f); do
    # Check if file has renderFooterFeaturedCompanions but not companions.js
    if grep -q "renderFooterFeaturedCompanions" "$file" && ! grep -q "/js/companions.js" "$file"; then
        echo "Adding companions.js to: $file"

        # Add companions.js before category-companions.js
        sed -i '' '
        /<script src="\/category-companions.js"><\/script>/ {
            i\
    <script src="/js/companions.js"></script>
        }
        ' "$file"
    fi
done

echo "Companions.js additions completed!"