#!/bin/bash

# Add Meta Companion Tracking script to all HTML files

echo "Adding Meta Companion Tracking script to all HTML files..."

# Find all HTML files (excluding node_modules and .git)
find . -type f -name "*.html" ! -path "./node_modules/*" ! -path "./.git/*" | while read file; do
    # Check if the tracking script is already included
    if ! grep -q "meta-companion-tracking.js" "$file"; then
        # Check if the file has a closing </body> tag
        if grep -q "</body>" "$file"; then
            # Add the script before </body>
            sed -i '' '/<\/body>/i\
    <script src="/js/meta-companion-tracking.js"></script>
' "$file"
            echo "Added tracking script to: $file"
        fi
    else
        echo "Tracking script already exists in: $file"
    fi
done

echo "Done! Meta Companion Tracking script added to all HTML files."
