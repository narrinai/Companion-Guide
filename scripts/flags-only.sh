#!/bin/bash
cd /Users/sebastiaansmits/Documents/AI-Companion-Reviews
find . -name "*.html" -not -path "*/node_modules/*" -not -path "*/.git/*" | while read file; do
    sed -i '' 's|>🇬🇧 EN</a>|>🇬🇧</a>|g' "$file"
    sed -i '' 's|>🇳🇱 NL</a>|>🇳🇱</a>|g' "$file"
    sed -i '' 's|>🇧🇷 PT</a>|>🇧🇷</a>|g' "$file"
done
echo "✅ Flags only!"
