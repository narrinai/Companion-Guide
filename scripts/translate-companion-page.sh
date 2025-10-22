#!/bin/bash

# Script to translate an individual companion page to Dutch
# Usage: ./translate-companion-page.sh [companion-slug]
# Example: ./translate-companion-page.sh character-ai

if [ -z "$1" ]; then
    echo "❌ Error: Please provide a companion slug"
    echo "Usage: ./translate-companion-page.sh [companion-slug]"
    echo "Example: ./translate-companion-page.sh character-ai"
    exit 1
fi

SLUG="$1"
SOURCE_FILE="companions/${SLUG}.html"
TARGET_DIR="nl/companions"
TARGET_FILE="${TARGET_DIR}/${SLUG}.html"

if [ ! -f "$SOURCE_FILE" ]; then
    echo "❌ Error: Source file not found: $SOURCE_FILE"
    exit 1
fi

echo "🌍 Translating companion page: $SLUG"

# Create nl/companions directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy original file
cp "$SOURCE_FILE" "$TARGET_FILE"

# Update HTML lang attribute
sed -i '' 's|<html lang="en">|<html lang="nl">|g' "$TARGET_FILE"

# Update canonical and add hreflang
sed -i '' "s|<link rel=\"canonical\" href=\"https://companionguide.ai/companions/${SLUG}\">|<link rel=\"canonical\" href=\"https://companionguide.ai/nl/companions/${SLUG}\">\n    <link rel=\"alternate\" hreflang=\"en\" href=\"https://companionguide.ai/companions/${SLUG}\">\n    <link rel=\"alternate\" hreflang=\"nl\" href=\"https://companionguide.ai/nl/companions/${SLUG}\">\n    <link rel=\"alternate\" hreflang=\"x-default\" href=\"https://companionguide.ai/companions/${SLUG}\">|g" "$TARGET_FILE"

# Update Open Graph URL
sed -i '' "s|<meta property=\"og:url\" content=\"https://companionguide.ai/companions/${SLUG}\">|<meta property=\"og:url\" content=\"https://companionguide.ai/nl/companions/${SLUG}\">|g" "$TARGET_FILE"

# Update Twitter URL
sed -i '' "s|<meta property=\"twitter:url\" content=\"https://companionguide.ai/companions/${SLUG}\">|<meta property=\"twitter:url\" content=\"https://companionguide.ai/nl/companions/${SLUG}\">|g" "$TARGET_FILE"

# Fix CSS paths to absolute
sed -i '' 's|<link rel="stylesheet" href="../style.css">|<link rel="stylesheet" href="/style.css">|g' "$TARGET_FILE"
sed -i '' 's|<link rel="stylesheet" href="/style.css">|<link rel="stylesheet" href="/style.css">|g' "$TARGET_FILE"

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
sed -i '' 's|Pros|Voordelen|g' "$TARGET_FILE"
sed -i '' 's|Cons|Nadelen|g' "$TARGET_FILE"
sed -i '' 's|Best for|Beste voor|g' "$TARGET_FILE"
sed -i '' 's|Overview|Overzicht|g' "$TARGET_FILE"
sed -i '' 's|Alternatives|Alternatieven|g' "$TARGET_FILE"
sed -i '' 's|FAQ|Veelgestelde Vragen|g' "$TARGET_FILE"
sed -i '' 's|Frequently Asked Questions|Veelgestelde Vragen|g' "$TARGET_FILE"

# Update breadcrumb links
sed -i '' 's|<a href="/">Home</a>|<a href="/nl/">Home</a>|g' "$TARGET_FILE"
sed -i '' 's|<a href="/companions">Companions</a>|<a href="/nl/companions">Companions</a>|g' "$TARGET_FILE"

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

echo "✅ Companion page translated: $SLUG"
echo "📄 File: $TARGET_FILE"
echo "🌐 URL: https://companionguide.ai/nl/companions/${SLUG}"
