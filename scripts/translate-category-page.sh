#!/bin/bash

# Script to translate an individual category page to Dutch
# Usage: ./translate-category-page.sh [category-slug]
# Example: ./translate-category-page.sh roleplay-character-chat-companions

if [ -z "$1" ]; then
    echo "❌ Error: Please provide a category slug"
    echo "Usage: ./translate-category-page.sh [category-slug]"
    echo "Example: ./translate-category-page.sh roleplay-character-chat-companions"
    exit 1
fi

SLUG="$1"
SOURCE_FILE="categories/${SLUG}.html"
TARGET_DIR="nl/categories"
TARGET_FILE="${TARGET_DIR}/${SLUG}.html"

if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ Error: Source file not found: $SOURCE_FILE"
    exit 1
fi

echo "🌍 Translating category page: $SLUG"

# Create nl/categories directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy original file
cp "$SOURCE_FILE" "$TARGET_FILE"

# Update HTML lang attribute
sed -i '' 's|<html lang="en">|<html lang="nl">|g' "$TARGET_FILE"

# Update canonical and add hreflang
sed -i '' "s|<link rel=\"canonical\" href=\"https://companionguide.ai/categories/${SLUG}\">|<link rel=\"canonical\" href=\"https://companionguide.ai/nl/categories/${SLUG}\">\n    <link rel=\"alternate\" hreflang=\"en\" href=\"https://companionguide.ai/categories/${SLUG}\">\n    <link rel=\"alternate\" hreflang=\"nl\" href=\"https://companionguide.ai/nl/categories/${SLUG}\">\n    <link rel=\"alternate\" hreflang=\"x-default\" href=\"https://companionguide.ai/categories/${SLUG}\">|g" "$TARGET_FILE"

# Update Open Graph URL
sed -i '' "s|<meta property=\"og:url\" content=\"https://companionguide.ai/categories/${SLUG}\">|<meta property=\"og:url\" content=\"https://companionguide.ai/nl/categories/${SLUG}\">|g" "$TARGET_FILE"

# Update Twitter URL
sed -i '' "s|<meta property=\"twitter:url\" content=\"https://companionguide.ai/categories/${SLUG}\">|<meta property=\"twitter:url\" content=\"https://companionguide.ai/nl/categories/${SLUG}\">|g" "$TARGET_FILE"

# Fix CSS paths to absolute
sed -i '' 's|<link rel="stylesheet" href="../style.css">|<link rel="stylesheet" href="/style.css">|g' "$TARGET_FILE"
sed -i '' 's|href="../style.css"|href="/style.css"|g' "$TARGET_FILE"

# Update navigation links to Dutch
sed -i '' 's|<li><a href="/">Home</a></li>|<li><a href="/nl/" data-i18n="nav.home">Home</a></li>|g' "$TARGET_FILE"
sed -i '' 's|<li><a href="/companions">Companions</a></li>|<li><a href="/nl/companions" data-i18n="nav.companions">Companions</a></li>|g' "$TARGET_FILE"
sed -i '' 's|<li><a href="/categories">Categories</a></li>|<li><a href="/nl/categories" data-i18n="nav.categories">Categorieën</a></li>|g' "$TARGET_FILE"
sed -i '' 's|<li><a href="/news">News & Insights</a></li>|<li><a href="/nl/news" data-i18n="nav.news">Nieuws</a></li>|g' "$TARGET_FILE"
sed -i '' 's|<li><a href="/deals">Deals</a></li>|<li><a href="/nl/deals" data-i18n="nav.deals">Deals</a></li>|g' "$TARGET_FILE"
sed -i '' 's|<li><a href="/contact">Contact</a></li>|<li><a href="/nl/contact" data-i18n="nav.contact">Contact</a></li>|g' "$TARGET_FILE"

# Update logo link
sed -i '' 's|<h1><a href="/">|<h1><a href="/nl/">|g' "$TARGET_FILE"

# Translate common UI elements
sed -i '' 's|Visit Website|Bezoek Website|g' "$TARGET_FILE"
sed -i '' 's|Read Review|Lees Review|g' "$TARGET_FILE"
sed -i '' 's|Free Trial|Gratis Proefperiode|g' "$TARGET_FILE"
sed -i '' 's|Pricing|Prijzen|g' "$TARGET_FILE"
sed -i '' 's|Features|Functies|g' "$TARGET_FILE"
sed -i '' 's|Rating|Beoordeling|g' "$TARGET_FILE"
sed -i '' 's|Reviews|Reviews|g' "$TARGET_FILE"
sed -i '' 's|Best for|Beste voor|g' "$TARGET_FILE"
sed -i '' 's|platforms available|platforms beschikbaar|g' "$TARGET_FILE"
sed -i '' 's|Loading\.\.\.|Laden\.\.\.|g' "$TARGET_FILE"
sed -i '' 's|View All|Bekijk Alles|g' "$TARGET_FILE"
sed -i '' 's|Show More|Toon Meer|g' "$TARGET_FILE"
sed -i '' 's|Show Less|Toon Minder|g' "$TARGET_FILE"

# Translate filter labels
sed -i '' 's|Sort by:|Sorteer op:|g' "$TARGET_FILE"
sed -i '' 's|Highest Rated|Hoogst Gewaardeerd|g' "$TARGET_FILE"
sed -i '' 's|Most Popular|Meest Populair|g' "$TARGET_FILE"
sed -i '' 's|Newest|Nieuwste|g' "$TARGET_FILE"
sed -i '' 's|Price: Low to High|Prijs: Laag naar Hoog|g' "$TARGET_FILE"
sed -i '' 's|Price: High to Low|Prijs: Hoog naar Laag|g' "$TARGET_FILE"

# Update breadcrumb links
sed -i '' 's|<a href="/">Home</a>|<a href="/nl/">Home</a>|g' "$TARGET_FILE"
sed -i '' 's|<a href="/categories">Categories</a>|<a href="/nl/categories">Categorieën</a>|g' "$TARGET_FILE"

# Update companion card links to Dutch
sed -i '' 's|href="/companions/|href="/nl/companions/|g' "$TARGET_FILE"

# Update footer
sed -i '' 's|<p>Your trusted source for AI companion reviews and guides</p>|<p data-i18n="footer.tagline">Je betrouwbare gids voor AI companions en chat platforms</p>|g' "$TARGET_FILE"
sed -i '' 's|<p>&copy; 2025 Companion Guide. All rights reserved.</p>|<p data-i18n="footer.copyright">&copy; 2025 Companion Guide. Alle rechten voorbehouden.</p>|g' "$TARGET_FILE"

# Add i18n.js script if not present
if ! grep -q "i18n.js" "$TARGET_FILE"; then
    sed -i '' 's|<script src="/script.js|<script src="/js/i18n.js"></script>\n    <script src="/script.js|g' "$TARGET_FILE"
    sed -i '' 's|<script src="../script.js|<script src="/js/i18n.js"></script>\n    <script src="/script.js|g' "$TARGET_FILE"
fi

# Fix script paths to absolute
sed -i '' 's|src="../script\.js|src="/script.js|g' "$TARGET_FILE"
sed -i '' 's|src="script\.js|src="/script.js|g' "$TARGET_FILE"
sed -i '' 's|src="../js/companions\.js|src="/js/companions.js|g' "$TARGET_FILE"

echo "✅ Category page translated: $SLUG"
echo "📄 File: $TARGET_FILE"
echo "🌐 URL: https://companionguide.ai/nl/categories/${SLUG}"
