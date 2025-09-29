#!/bin/bash

echo "Adding dynamic footer loading to all pages..."

# Find all HTML files except index.html and add the script call
find . -name "*.html" -not -path "./index.html" -not -path "./node_modules/*" | while read -r file; do
    if [ -f "$file" ]; then
        echo "Updating: $file"

        # Check if companions.js is already loaded
        if ! grep -q "companions.js" "$file"; then
            # Add companions.js before the closing body tag
            sed -i '' '/<\/body>/i\
    <script src="/js/companions.js"></script>
' "$file"
        fi

        # Add the dynamic loading call before closing body tag
        if ! grep -q "renderFooterFeaturedCompanions" "$file"; then
            sed -i '' '/<\/body>/i\
    <script>\
        // Load featured companions in footer\
        document.addEventListener("DOMContentLoaded", async function() {\
            if (typeof window.companionManager === "undefined") {\
                window.companionManager = new CompanionManager();\
            }\
            try {\
                await window.companionManager.renderFooterFeaturedCompanions("featured-companions-footer");\
            } catch (error) {\
                console.error("Error loading footer featured companions:", error);\
            }\
        });\
    </script>
' "$file"
        fi

        echo "Updated: $file"
    fi
done

echo "Dynamic footer loading added to all pages!"