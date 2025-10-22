#!/bin/bash

# Script to translate news.html to Dutch
# Creates nl/news.html with Dutch translations

echo "🌍 Translating news page to Dutch..."

# Create nl directory if it doesn't exist
mkdir -p nl

# Copy original file
cp news.html nl/news.html

FILE="nl/news.html"

# Update HTML lang attribute
sed -i '' 's|<html lang="en">|<html lang="nl">|g' "$FILE"

# Update meta tags
sed -i '' 's|<title>AI Chat News 2025 - Latest Platform Updates & Trends</title>|<title>AI Chat Nieuws 2025 - Laatste Platform Updates \& Trends</title>|g' "$FILE"
sed -i '' 's|<meta name="description" content="Stay updated with the latest AI chat platform and AI companion news, industry analysis, and market trends. Recent developments in Character.AI, Replika, and emerging AI chat platforms.">|<meta name="description" content="Blijf up-to-date met het laatste AI chat platform en AI companion nieuws, industrie analyse en markttrends. Recente ontwikkelingen in Character.AI, Replika en opkomende AI chat platforms.">|g' "$FILE"
sed -i '' 's|<meta name="keywords" content="AI chat news, AI companion news, AI platform updates, Character.AI news, Replika updates, AI chatbot industry, AI chat platform news, AI companion market analysis, virtual companion trends, free AI chat news">|<meta name="keywords" content="AI chat nieuws, AI companion nieuws, AI platform updates, Character.AI nieuws, Replika updates, AI chatbot industrie, AI chat platform nieuws, AI companion markt analyse, virtual companion trends, gratis AI chat nieuws">|g' "$FILE"

# Update canonical and hreflang
sed -i '' 's|<link rel="canonical" href="https://companionguide.ai/news">|<link rel="canonical" href="https://companionguide.ai/nl/news">\n    <link rel="alternate" hreflang="en" href="https://companionguide.ai/news">\n    <link rel="alternate" hreflang="nl" href="https://companionguide.ai/nl/news">\n    <link rel="alternate" hreflang="x-default" href="https://companionguide.ai/news">|g' "$FILE"

# Update Open Graph tags
sed -i '' 's|<meta property="og:url" content="https://companionguide.ai/news">|<meta property="og:url" content="https://companionguide.ai/nl/news">|g' "$FILE"
sed -i '' 's|<meta property="og:title" content="AI Chat & Companion Platform News 2025 - Latest Industry Updates">|<meta property="og:title" content="AI Chat \& Companion Platform Nieuws 2025 - Laatste Industrie Updates">|g' "$FILE"
sed -i '' 's|<meta property="og:description" content="Latest news and analysis on AI chat platforms and AI companion platforms including Character.AI, Replika, and emerging AI chat platforms.">|<meta property="og:description" content="Laatste nieuws en analyse over AI chat platforms en AI companion platforms inclusief Character.AI, Replika en opkomende AI chat platforms.">|g' "$FILE"

# Update Twitter tags
sed -i '' 's|<meta property="twitter:url" content="https://companionguide.ai/news">|<meta property="twitter:url" content="https://companionguide.ai/nl/news">|g' "$FILE"
sed -i '' 's|<meta property="twitter:title" content="AI Chat & Companion Platform News 2025">|<meta property="twitter:title" content="AI Chat \& Companion Platform Nieuws 2025">|g' "$FILE"
sed -i '' 's|<meta property="twitter:description" content="Latest news and analysis on AI chat platforms, AI companion platforms and industry trends.">|<meta property="twitter:description" content="Laatste nieuws en analyse over AI chat platforms, AI companion platforms en industrie trends.">|g' "$FILE"

# Fix CSS path to absolute
sed -i '' 's|<link rel="stylesheet" href="style.css">|<link rel="stylesheet" href="/style.css">|g' "$FILE"

# Update navigation links to Dutch
sed -i '' 's|<li><a href="/">Home</a></li>|<li><a href="/nl/" data-i18n="nav.home">Home</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/companions">Companions</a></li>|<li><a href="/nl/companions" data-i18n="nav.companions">Companions</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/categories">Categories</a></li>|<li><a href="/nl/categories" data-i18n="nav.categories">Categorieën</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/news" class="active">News & Insights</a></li>|<li><a href="/nl/news" class="active" data-i18n="nav.news">Nieuws</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/deals">Deals</a></li>|<li><a href="/nl/deals" data-i18n="nav.deals">Deals</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/contact">Contact</a></li>|<li><a href="/nl/contact" data-i18n="nav.contact">Contact</a></li>|g' "$FILE"

# Update logo link
sed -i '' 's|<h1><a href="/">|<h1><a href="/nl/">|g' "$FILE"

# Translate hero section
sed -i '' 's|<h1>AI Chat & Companion Platform News</h1>|<h1 data-i18n="news.title">AI Chat \& Companion Platform Nieuws</h1>|g' "$FILE"
sed -i '' 's|<p>Stay updated with the latest developments in AI chat platforms and AI companion platforms, industry analysis, and market trends</p>|<p data-i18n="news.subtitle">Blijf op de hoogte van de laatste ontwikkelingen in AI chat platforms en AI companion platforms, industrie analyse en markttrends</p>|g' "$FILE"

# Translate section headings
sed -i '' 's|<h2>Latest AI Chat & Companion Platform News</h2>|<h2 data-i18n="news.latest.title">Laatste AI Chat \& Companion Platform Nieuws</h2>|g' "$FILE"
sed -i '' 's|<p>Recent developments and industry updates</p>|<p data-i18n="news.latest.subtitle">Recente ontwikkelingen en industrie updates</p>|g' "$FILE"

# Translate "Read More" buttons
sed -i '' 's|Read More|Lees Meer|g' "$FILE"
sed -i '' 's|Read Article|Lees Artikel|g' "$FILE"

# Translate date labels
sed -i '' 's|Published:|Gepubliceerd:|g' "$FILE"
sed -i '' 's|Updated:|Bijgewerkt:|g' "$FILE"

# Update news article links to Dutch (they stay in /news/ folder, not /nl/news/)
# Individual articles will need their own translation

# Update footer
sed -i '' 's|<p>Your trusted source for AI companion reviews and guides</p>|<p data-i18n="footer.tagline">Je betrouwbare gids voor AI companions en chat platforms</p>|g' "$FILE"
sed -i '' 's|<p>&copy; 2025 Companion Guide. All rights reserved.</p>|<p data-i18n="footer.copyright">&copy; 2025 Companion Guide. Alle rechten voorbehouden.</p>|g' "$FILE"

# Add i18n.js script if not present
if ! grep -q "i18n.js" "$FILE"; then
    sed -i '' 's|<script src="/script.js|<script src="/js/i18n.js"></script>\n    <script src="/script.js|g' "$FILE"
fi

# Fix script paths to absolute
sed -i '' 's|src="script\.js|src="/script.js|g' "$FILE"

echo "✅ News page translated to Dutch"
echo "📄 File: nl/news.html"
echo "🌐 URL: https://companionguide.ai/nl/news"
echo ""
echo "ℹ️  Note: Individual news articles need separate translation"
