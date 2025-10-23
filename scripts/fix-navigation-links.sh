#!/bin/bash

# Fix navigation links on nl/pt pages to use /nl/ and /pt/ prefixes

cd /Users/sebastiaansmits/Documents/AI-Companion-Reviews

echo "Fixing navigation links in nl/ pages..."

# Fix all HTML files in nl/ directory
find nl -name "*.html" | while read file; do
    # Update navigation links to use /nl/ prefix
    sed -i '' 's|<li><a href="/">Home</a>|<li><a href="/nl/">Home</a>|g' "$file"
    sed -i '' 's|<li><a href="/companions">Companions</a>|<li><a href="/nl/companions">Companions</a>|g' "$file"
    sed -i '' 's|<li><a href="/categories">Categories</a>|<li><a href="/nl/categories">Categories</a>|g' "$file"
    sed -i '' 's|<li><a href="/news">News & Insights</a>|<li><a href="/nl/news">News \& Insights</a>|g' "$file"
    sed -i '' 's|<li><a href="/deals">Deals</a>|<li><a href="/nl/deals">Deals</a>|g' "$file"
    sed -i '' 's|<li><a href="/contact">Contact</a>|<li><a href="/nl/contact">Contact</a>|g' "$file"
done

echo "✅ Fixed nl/ navigation links"
echo ""
echo "Fixing navigation links in pt/ pages..."

# Fix all HTML files in pt/ directory
find pt -name "*.html" | while read file; do
    # Update navigation links to use /pt/ prefix
    sed -i '' 's|<li><a href="/">Home</a>|<li><a href="/pt/">Home</a>|g' "$file"
    sed -i '' 's|<li><a href="/companions">Companions</a>|<li><a href="/pt/companions">Companions</a>|g' "$file"
    sed -i '' 's|<li><a href="/categories">Categories</a>|<li><a href="/pt/categories">Categories</a>|g' "$file"
    sed -i '' 's|<li><a href="/news">News & Insights</a>|<li><a href="/pt/news">News \& Insights</a>|g' "$file"
    sed -i '' 's|<li><a href="/deals">Deals</a>|<li><a href="/pt/deals">Deals</a>|g' "$file"
    sed -i '' 's|<li><a href="/contact">Contact</a>|<li><a href="/pt/contact">Contact</a>|g' "$file"
done

echo "✅ Fixed pt/ navigation links"
echo ""
echo "✅ All navigation links fixed!"
