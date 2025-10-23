#!/bin/bash

# Fix category companion pages structure
# Remove incorrect </body> before footer and duplicate script sections

cd /Users/sebastiaansmits/Documents/AI-Companion-Reviews

for file in categories/*-companions.html; do
    if [ -f "$file" ]; then
        echo "Processing: $file"

        # Create a temporary file
        temp_file=$(mktemp)

        # Read the file and fix structure:
        # 1. Remove </body> tag that appears before <footer>
        # 2. Remove old script section (lines between first </body> and <footer>)
        # 3. Keep only one set of scripts after </footer>

        awk '
        BEGIN { in_old_scripts = 0; footer_found = 0; body_closed = 0 }

        # Skip </body> before footer
        /<\/body>/ && !footer_found {
            body_closed = 1
            next
        }

        # When we hit script after body but before footer, skip until footer
        body_closed && /<script/ && !footer_found {
            in_old_scripts = 1
        }

        # Mark when footer starts
        /<footer/ {
            footer_found = 1
            in_old_scripts = 0
        }

        # Skip lines in old scripts section
        in_old_scripts {
            next
        }

        # Print all other lines
        { print }
        ' "$file" > "$temp_file"

        # Now fix script paths (../ to /)
        sed -i '' 's|src="../js/i18n.js|src="/js/i18n.js|g' "$temp_file"
        sed -i '' 's|src="../script.js|src="/script.js|g' "$temp_file"

        # Move temp file back
        mv "$temp_file" "$file"

        echo "  ✅ Fixed $file"
    fi
done

echo ""
echo "✅ All category companion pages structure fixed!"
