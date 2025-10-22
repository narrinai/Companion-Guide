#!/bin/bash

# Script to translate companions-az.html to Dutch
# Creates nl/companions-az.html with Dutch translations

echo "🌍 Translating companions A-Z page to Dutch..."

# Create nl directory if it doesn't exist
mkdir -p nl

# Copy original file
cp companions-az.html nl/companions-az.html

FILE="nl/companions-az.html"

# Update HTML lang attribute
sed -i '' 's|<html lang="en">|<html lang="nl">|g' "$FILE"

# Update meta tags
sed -i '' 's|<title>AI Companions A-Z - Complete Alphabetical Directory</title>|<title>AI Companions A-Z - Compleet Alfabetisch Overzicht</title>|g' "$FILE"
sed -i '' 's|<meta name="description" content="Browse all AI companion platforms alphabetically. Complete A-Z directory of AI chat platforms, companions, and chatbots.">|<meta name="description" content="Bekijk alle AI companion platforms alfabetisch. Compleet A-Z overzicht van AI chat platforms, companions en chatbots.">|g' "$FILE"

# Update canonical and hreflang
sed -i '' 's|<link rel="canonical" href="https://companionguide.ai/companions-az">|<link rel="canonical" href="https://companionguide.ai/nl/companions-az">\n    <link rel="alternate" hreflang="en" href="https://companionguide.ai/companions-az">\n    <link rel="alternate" hreflang="nl" href="https://companionguide.ai/nl/companions-az">\n    <link rel="alternate" hreflang="x-default" href="https://companionguide.ai/companions-az">|g' "$FILE"

# Update Open Graph tags
sed -i '' 's|<meta property="og:url" content="https://companionguide.ai/companions-az">|<meta property="og:url" content="https://companionguide.ai/nl/companions-az">|g' "$FILE"
sed -i '' 's|<meta property="og:title" content="AI Companions A-Z Directory">|<meta property="og:title" content="AI Companions A-Z Overzicht">|g' "$FILE"

# Update Twitter tags
sed -i '' 's|<meta property="twitter:url" content="https://companionguide.ai/companions-az">|<meta property="twitter:url" content="https://companionguide.ai/nl/companions-az">|g' "$FILE"

# Fix CSS path to absolute
sed -i '' 's|<link rel="stylesheet" href="style.css">|<link rel="stylesheet" href="/style.css">|g' "$FILE"

# Update navigation links to Dutch
sed -i '' 's|<li><a href="/">Home</a></li>|<li><a href="/nl/" data-i18n="nav.home">Home</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/companions">Companions</a></li>|<li><a href="/nl/companions" data-i18n="nav.companions">Companions</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/categories">Categories</a></li>|<li><a href="/nl/categories" data-i18n="nav.categories">Categorieën</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/news">News & Insights</a></li>|<li><a href="/nl/news" data-i18n="nav.news">Nieuws</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/deals">Deals</a></li>|<li><a href="/nl/deals" data-i18n="nav.deals">Deals</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/contact">Contact</a></li>|<li><a href="/nl/contact" data-i18n="nav.contact">Contact</a></li>|g' "$FILE"

# Update logo link
sed -i '' 's|<h1><a href="/">|<h1><a href="/nl/">|g' "$FILE"

# Translate hero section
sed -i '' 's|<h1>AI Companions A-Z</h1>|<h1 data-i18n="companionsAZ.title">AI Companions A-Z</h1>|g' "$FILE"
sed -i '' 's|<p>Browse all AI companion platforms alphabetically</p>|<p data-i18n="companionsAZ.subtitle">Bekijk alle AI companion platforms alfabetisch</p>|g' "$FILE"

# Translate alphabet navigation
sed -i '' 's|<div class="alphabet-nav">|<div class="alphabet-nav" data-i18n-section="companionsAZ.alphabet">|g' "$FILE"

# Update companion links to Dutch
sed -i '' 's|href="/companions/|href="/nl/companions/|g' "$FILE"

# Update footer
sed -i '' 's|<p>Your trusted source for AI companion reviews and guides</p>|<p data-i18n="footer.tagline">Je betrouwbare gids voor AI companions en chat platforms</p>|g' "$FILE"
sed -i '' 's|<p>&copy; 2025 Companion Guide. All rights reserved.</p>|<p data-i18n="footer.copyright">&copy; 2025 Companion Guide. Alle rechten voorbehouden.</p>|g' "$FILE"

# Add i18n.js script if not present
if ! grep -q "i18n.js" "$FILE"; then
    sed -i '' 's|<script src="/script.js|<script src="/js/i18n.js"></script>\n    <script src="/script.js|g' "$FILE"
fi

# Fix script paths to absolute
sed -i '' 's|src="script\.js|src="/script.js|g' "$FILE"

echo "✅ Companions A-Z page translated to Dutch"
echo "📄 File: nl/companions-az.html"
echo "🌐 URL: https://companionguide.ai/nl/companions-az"
