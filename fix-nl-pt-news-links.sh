#!/bin/bash
# Fix NL/PT news links to point to English news articles

echo "🔧 Fixing NL/PT news links to use English articles"

# Fix NL homepage
if [ -f "nl/index.html" ]; then
    sed -i '' 's|href="/nl/news/|href="/news/|g' nl/index.html
    echo "✅ Fixed nl/index.html"
fi

# Fix PT homepage  
if [ -f "pt/index.html" ]; then
    sed -i '' 's|href="/pt/news/|href="/news/|g' pt/index.html
    echo "✅ Fixed pt/index.html"
fi

echo "✅ Done! NL/PT homepages now link to English news articles"
