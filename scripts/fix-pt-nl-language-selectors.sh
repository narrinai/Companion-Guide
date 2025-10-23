#!/bin/bash

# Fix language selectors on nl/ and pt/ pages

cd /Users/sebastiaansmits/Documents/AI-Companion-Reviews

echo "Fixing nl/ language selectors..."

# Fix all nl/ pages
find nl -name "*.html" | while read file; do
    # Fix language selector button to show NL
    sed -i '' 's|<button id="lang-toggle" class="lang-current">[ ]*🇬🇧 EN|<button id="lang-toggle" class="lang-current">\n                    🇳🇱 NL|g' "$file"

    # Fix dropdown - English should not be active
    sed -i '' 's|href="/companions" class="lang-option active">🇬🇧 EN|href="/companions" class="lang-option">🇬🇧 EN|g' "$file"
    sed -i '' 's|href="/categories" class="lang-option active">🇬🇧 EN|href="/categories" class="lang-option">🇬🇧 EN|g' "$file"
    sed -i '' 's|href="/" class="lang-option active">🇬🇧 EN|href="/" class="lang-option">🇬🇧 EN|g' "$file"

    # Fix dropdown - NL should be active and link correctly
    sed -i '' 's|href="/nl/companions" class="lang-option">🇳🇱 NL|href="/nl/companions" class="lang-option active">🇳🇱 NL|g' "$file"
    sed -i '' 's|href="/nl/categories" class="lang-option">🇳🇱 NL|href="/nl/categories" class="lang-option active">🇳🇱 NL|g' "$file"
    sed -i '' 's|href="/nl/" class="lang-option">🇳🇱 NL|href="/nl/" class="lang-option active">🇳🇱 NL|g' "$file"
done

echo "✅ Fixed nl/ language selectors"
echo ""
echo "Fixing pt/ language selectors..."

# Fix all pt/ pages
find pt -name "*.html" | while read file; do
    # Fix language selector button to show PT
    sed -i '' 's|<button id="lang-toggle" class="lang-current">[ ]*🇬🇧 EN|<button id="lang-toggle" class="lang-current">\n                    🇧🇷 PT|g' "$file"
    sed -i '' 's|<button id="lang-toggle" class="lang-current">[ ]*🇳🇱 NL|<button id="lang-toggle" class="lang-current">\n                    🇧🇷 PT|g' "$file"

    # Fix dropdown - English should not be active
    sed -i '' 's|href="/companions" class="lang-option active">🇬🇧 EN|href="/companions" class="lang-option">🇬🇧 EN|g' "$file"
    sed -i '' 's|href="/categories" class="lang-option active">🇬🇧 EN|href="/categories" class="lang-option">🇬🇧 EN|g' "$file"
    sed -i '' 's|href="/" class="lang-option active">🇬🇧 EN|href="/" class="lang-option">🇬🇧 EN|g' "$file"

    # Fix wrong NL links (some pages have NL links with PT URLs)
    sed -i '' 's|href="/pt/companions" class="lang-option">🇳🇱 NL|href="/nl/companions" class="lang-option">🇳🇱 NL|g' "$file"
    sed -i '' 's|href="/pt/categories" class="lang-option">🇳🇱 NL|href="/nl/categories" class="lang-option">🇳🇱 NL|g' "$file"
    sed -i '' 's|href="/pt/" class="lang-option">🇳🇱 NL|href="/nl/" class="lang-option">🇳🇱 NL|g' "$file"

    # Fix dropdown - PT should be active
    sed -i '' 's|href="/pt/companions" class="lang-option">🇧🇷 PT|href="/pt/companions" class="lang-option active">🇧🇷 PT|g' "$file"
    sed -i '' 's|href="/pt/categories" class="lang-option">🇧🇷 PT|href="/pt/categories" class="lang-option active">🇧🇷 PT|g' "$file"
    sed -i '' 's|href="/pt/" class="lang-option">🇧🇷 PT|href="/pt/" class="lang-option active">🇧🇷 PT|g' "$file"
done

echo "✅ Fixed pt/ language selectors"
echo ""
echo "✅ All language selectors fixed!"
