#!/bin/bash

echo "Fixing footer Featured AI Companions section across all HTML files..."

# Find all HTML files that have "Featured AI Companions" but missing the proper ID
for file in $(find . -name "*.html" -type f | grep -E "\.(html)$"); do
    # Check if the file has "Featured AI Companions" but no proper ul id
    if grep -q "Featured AI Companions" "$file" && ! grep -q 'id="featured-companions-footer"' "$file"; then
        echo "Fixing footer in: $file"

        # Fix the HTML structure to add the missing ID and ul element
        sed -i '' '
        /<h4>Featured AI Companions<\/h4>/ {
            n
            # If next line is "<!-- Dynamic content will be loaded here -->"
            /<!-- Dynamic content will be loaded here -->/ {
                i\
                    <ul id="featured-companions-footer">
                a\
                    </ul>
            }
            # If next line is "</ul>" without proper opening
            /<\/ul>/ {
                i\
                    <ul id="featured-companions-footer">\
                        <!-- Dynamic content will be loaded here -->
            }
        }
        ' "$file"
    fi
done

echo "Footer fixes completed!"