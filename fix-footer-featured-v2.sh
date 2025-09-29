#!/bin/bash

# Fix the footer featured companions section
echo "Fixing footer featured companions..."

# Standard footer featured companions section
read -r -d '' FEATURED_SECTION << 'EOF'
                <div class="footer-section">
                    <h4>Featured AI Companions</h4>
                    <ul id="featured-companions-footer">
                        <!-- Dynamic content will be loaded here -->
                    </ul>
                </div>
EOF

# Find all HTML files except index.html and fix the footer featured companions section
find . -name "*.html" -not -path "./index.html" -not -path "./node_modules/*" | while read -r file; do
    if [ -f "$file" ]; then
        echo "Fixing: $file"

        # Use sed to fix the featured companions section
        sed -i '' '
        /<div class="footer-section">/,/<\/div>/ {
            /<h4>Featured AI Companions<\/h4>/ {
                # Found the featured companions section
                :loop
                n
                /<\/div>/{
                    # Replace the entire section
                    i\
                    <ul id="featured-companions-footer">\
                        <!-- Dynamic content will be loaded here -->\
                    </ul>
                    b
                }
                b loop
            }
        }
        ' "$file"

        echo "Fixed: $file"
    fi
done

echo "Footer featured companions fix completed!"