#!/bin/bash

# Update all HTML files to use dynamic footer featured companions

echo "Updating footer featured companions to use dynamic loading..."

# Find all HTML files except index.html
find . -name "*.html" -not -path "./index.html" -not -path "./node_modules/*" | while read -r file; do
    if [ -f "$file" ]; then
        echo "Updating: $file"

        # Replace the static featured companions list with dynamic loading
        sed -i '' '
        /<ul id="featured-companions-footer">/,/<\/ul>/ {
            /<ul id="featured-companions-footer">/ {
                a\
                        <!-- Dynamic content will be loaded here -->
                N
                s/.*\n//
            }
            /<\/ul>/! d
        }
        ' "$file"

        echo "Updated: $file"
    fi
done

echo "Footer featured companions update completed!"