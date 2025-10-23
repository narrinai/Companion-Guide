#!/bin/bash

# Remove duplicate script sections from nl/pt category companion pages
# These pages have scripts both BEFORE and AFTER the footer due to previous fixes

cd /Users/sebastiaansmits/Documents/AI-Companion-Reviews

echo "Removing duplicate scripts from nl/pt category companion pages..."

for dir in nl/categories pt/categories; do
    for file in "$dir"/*-companions.html; do
        if [ -f "$file" ]; then
            echo "Processing: $file"

            # Create temp file
            temp_file=$(mktemp)

            # Use awk to keep only content from start to just before <footer>,
            # then add footer and scripts after
            awk '
                BEGIN { found_footer = 0; in_footer = 0; buffer = "" }

                # Start capturing when we hit footer
                /<footer/ {
                    found_footer = 1
                    in_footer = 1
                    buffer = $0
                    next
                }

                # If in footer, keep buffering
                in_footer {
                    buffer = buffer "\n" $0
                    if (/<\/footer>/) {
                        in_footer = 0
                        # Print everything up to here, skip rest until </html>
                        print buffer

                        # Now add the correct scripts
                        print ""
                        print "    <script src=\"/js/i18n.js?v=20251023\"></script>"
                        print "    <script src=\"/script.js?v=20251023\"></script>"
                        print "    <script src=\"/js/companions.js?v=20251023\"></script>"
                        print "    <script src=\"/category-companions.js?v=20251023\"></script>"
                        print "    <script src=\"/faq-interactions.js?v=20251023\"></script>"
                        print "    <script src=\"/js/faq-dynamic-ratings.js?v=20251023\"></script>"
                        print "    <script>"
                        print "        // Load featured companions in footer"
                        print "        document.addEventListener(\"DOMContentLoaded\", async function() {"
                        print "            if (typeof window.companionManager === \"undefined\") {"
                        print "                window.companionManager = new CompanionManager();"
                        print "            }"
                        print "            try {"
                        print "                await window.companionManager.renderFooterFeaturedCompanions(\"featured-companions-footer\");"
                        print "            } catch (error) {"
                        print "                console.error(\"Error loading footer featured companions:\", error);"
                        print "            }"
                        print "        });"
                        print "    </script>"
                        print "    <script src=\"/js/meta-companion-tracking.js?v=20251023\"></script>"
                        print "    <script src=\"/js/ga-external-tracking.js?v=20251023\"></script>"
                        print "</body>"
                        print "</html>"

                        # Skip everything else
                        exit
                    }
                    next
                }

                # Before footer, print everything except script tags before footer
                !found_footer && !/<script/ && !/<\/script>/ {
                    # Only print if not in a script section
                    if (!in_script_before_footer) {
                        print
                    }
                }

                # Detect script tags before footer (between FAQ schema and footer)
                !found_footer && /<script/ {
                    in_script_before_footer = 1
                }

                !found_footer && /<\/script>/ {
                    # Check if this is the FAQ schema closing tag
                    if (/}[\s]*<\/script>/) {
                        print
                        in_script_before_footer = 0
                    }
                }
            ' "$file" > "$temp_file"

            # Replace original with cleaned version
            mv "$temp_file" "$file"

            echo "  ✅ Cleaned $file"
        fi
    done
done

echo ""
echo "✅ All duplicate scripts removed!"
