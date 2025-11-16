#!/bin/bash

# Function to add Visit Website links to pricing tiers
add_pricing_links() {
    local file=$1
    local lang=$2

    # Determine the correct text based on language
    local visit_text=""
    case $lang in
        "en")
            visit_text="Visit Website"
            ;;
        "nl")
            visit_text="Bezoek Website"
            ;;
        "pt")
            visit_text="Visitar Site"
            ;;
        "de")
            visit_text="Website Besuchen"
            ;;
    esac

    # Extract the website URL from the platform-btn
    website_url=$(grep -o 'href="[^"]*" class="platform-btn"' "$file" | head -1 | sed 's/href="//;s/" class="platform-btn"//')

    # Check if we found a URL
    if [ -z "$website_url" ]; then
        echo "⚠️  No URL found in $file"
        return 1
    fi

    # Check if pricing tiers already have visit links
    if grep -q 'class="pricing-cta"' "$file"; then
        echo "✓ Already has pricing links: $(basename "$file")"
        return 0
    fi

    # Use Python to properly parse and add the links
    python3 - "$file" "$website_url" "$visit_text" <<'PYTHON'
import sys
import re

file_path = sys.argv[1]
url = sys.argv[2]
text = sys.argv[3]

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern to find </ul> followed by closing </div> within pricing-tier context
# We need to add the link after </ul> but before </div>
def add_link_after_ul(match):
    ul_close = match.group(1)
    spaces = match.group(2)
    div_close = match.group(3)
    link = f'{ul_close}\n{spaces}    <a href="{url}" class="pricing-cta" target="_blank">{text} →</a>\n{spaces}{div_close}'
    return link

# Find all </ul> followed by </div> that are inside pricing-tier divs
# Use a more specific pattern
pattern = r'(</ul>)\n(\s*)(</div>)'
content = re.sub(pattern, add_link_after_ul, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✓ Updated: {file_path.split('/')[-1]}")
PYTHON
}

# Process English files
echo "📝 Processing English companion pages..."
count=0
for file in /Users/sebastiaansmits/Documents/AI-Companion-Reviews/companions/*.html; do
    if [ -f "$file" ] && grep -q 'pricing-tier' "$file"; then
        add_pricing_links "$file" "en"
        ((count++))
    fi
done
echo "   Processed $count English files"

# Process Dutch files
echo ""
echo "📝 Processing Dutch companion pages..."
count=0
for file in /Users/sebastiaansmits/Documents/AI-Companion-Reviews/nl/companions/*.html; do
    if [ -f "$file" ] && grep -q 'pricing-tier' "$file"; then
        add_pricing_links "$file" "nl"
        ((count++))
    fi
done
echo "   Processed $count Dutch files"

# Process Portuguese files
echo ""
echo "📝 Processing Portuguese companion pages..."
count=0
for file in /Users/sebastiaansmits/Documents/AI-Companion-Reviews/pt/companions/*.html; do
    if [ -f "$file" ] && grep -q 'pricing-tier' "$file"; then
        add_pricing_links "$file" "pt"
        ((count++))
    fi
done
echo "   Processed $count Portuguese files"

# Process German files
echo ""
echo "📝 Processing German companion pages..."
count=0
for file in /Users/sebastiaansmits/Documents/AI-Companion-Reviews/de/companions/*.html; do
    if [ -f "$file" ] && grep -q 'pricing-tier' "$file"; then
        add_pricing_links "$file" "de"
        ((count++))
    fi
done
echo "   Processed $count German files"

echo ""
echo "✅ Done! All pricing tiers now have Visit Website links."
