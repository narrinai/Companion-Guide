#!/bin/bash

# Fix Dutch and Portuguese pages with correct language attributes and links

cd /Users/sebastiaansmits/Documents/AI-Companion-Reviews

echo "Fixing nl/categories.html..."

# Fix nl/categories.html
sed -i '' 's/<html lang="en">/<html lang="nl">/' nl/categories.html
sed -i '' 's|href="https://companionguide.ai/categories"|href="https://companionguide.ai/nl/categories"|' nl/categories.html
sed -i '' 's|content="https://companionguide.ai/categories"|content="https://companionguide.ai/nl/categories"|' nl/categories.html
sed -i '' 's|🇬🇧 EN|🇳🇱 NL|' nl/categories.html
sed -i '' 's|href="/categories" class="lang-option active">🇬🇧 English|href="/categories" class="lang-option">🇬🇧 EN|' nl/categories.html
sed -i '' 's|href="/nl/categories" class="lang-option">🇳🇱 Nederlands|href="/nl/categories" class="lang-option active">🇳🇱 NL|' nl/categories.html
sed -i '' 's|href="/pt/categories" class="lang-option">🇧🇷 Português|href="/pt/categories" class="lang-option">🇧🇷 PT|' nl/categories.html

echo "✅ nl/categories.html fixed"

echo "Fixing pt/categories.html..."

# Fix pt/categories.html
sed -i '' 's/<html lang="en">/<html lang="pt">/' pt/categories.html
sed -i '' 's|href="https://companionguide.ai/categories"|href="https://companionguide.ai/pt/categories"|' pt/categories.html
sed -i '' 's|content="https://companionguide.ai/categories"|content="https://companionguide.ai/pt/categories"|' pt/categories.html
sed -i '' 's|🇬🇧 EN|🇧🇷 PT|' pt/categories.html
sed -i '' 's|href="/categories" class="lang-option active">🇬🇧 English|href="/categories" class="lang-option">🇬🇧 EN|' pt/categories.html
sed -i '' 's|href="/nl/categories" class="lang-option">🇳🇱 Nederlands|href="/nl/categories" class="lang-option">🇳🇱 NL|' pt/categories.html
sed -i '' 's|href="/pt/categories" class="lang-option">🇧🇷 Português|href="/pt/categories" class="lang-option active">🇧🇷 PT|' pt/categories.html

echo "✅ pt/categories.html fixed"

echo ""
echo "✅ All pages fixed!"
