#!/bin/bash

# Script to add companion-page.js to all companion pages

echo "Updating companion pages with dynamic name functionality..."

# Find all HTML files in the companions directory
for file in companions/*.html; do
    if [ -f "$file" ]; then
        echo "Processing: $file"

        # Check if companions.js is already included
        if ! grep -q "companions.js" "$file"; then
            # Add companions.js before the closing </body> tag, after script.js
            sed -i '' 's|<script src="../script.js"></script>|<script src="../script.js"></script>\n    <script src="../js/companions.js"></script>|' "$file"
            echo "Added companions.js to $file"
        fi

        # Check if companion-page.js is already included
        if ! grep -q "companion-page.js" "$file"; then
            # Add companion-page.js after companions.js
            sed -i '' 's|<script src="../js/companions.js"></script>|<script src="../js/companions.js"></script>\n    <script src="../js/companion-page.js"></script>|' "$file"
            echo "Added companion-page.js to $file"
        fi
    fi
done

echo "Companion pages updated successfully!"
echo "The pages will now dynamically load companion names from Airtable + 'Review'"