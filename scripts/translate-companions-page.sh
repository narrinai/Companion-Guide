#!/bin/bash

# Script to translate /companions page to Dutch (/nl/companions.html)

FILE="nl/companions.html"

echo "🌍 Translating companions page to Dutch..."

# 1. Update HTML lang attribute
sed -i '' 's|<html lang="en">|<html lang="nl">|g' "$FILE"

# 2. Update meta tags
sed -i '' 's|<title>All AI Companions - CompanionGuide\.ai</title>|<title>Alle AI Companions - CompanionGuide.ai</title>|g' "$FILE"
sed -i '' 's|<meta name="description" content="Browse all AI companion platforms\. Complete directory of AI chat apps, AI girlfriends, and character companions with reviews and ratings\.">|<meta name="description" content="Bekijk alle AI companion platforms. Complete directory van AI chat apps, AI girlfriends en character companions met reviews en beoordelingen.">|g' "$FILE"

# 3. Update canonical and hreflang
sed -i '' 's|<link rel="canonical" href="https://companionguide\.ai/companions">|<link rel="canonical" href="https://companionguide.ai/nl/companions">\n    <link rel="alternate" hreflang="en" href="https://companionguide.ai/companions">\n    <link rel="alternate" hreflang="nl" href="https://companionguide.ai/nl/companions">\n    <link rel="alternate" hreflang="x-default" href="https://companionguide.ai/companions">|g' "$FILE"

# 4. Update Open Graph tags
sed -i '' 's|<meta property="og:url" content="https://companionguide\.ai/companions">|<meta property="og:url" content="https://companionguide.ai/nl/companions">|g' "$FILE"
sed -i '' 's|<meta property="og:title" content="All AI Companions - CompanionGuide\.ai">|<meta property="og:title" content="Alle AI Companions - CompanionGuide.ai">|g' "$FILE"
sed -i '' 's|<meta property="og:description" content="Browse all AI companion platforms with reviews and ratings\.">|<meta property="og:description" content="Bekijk alle AI companion platforms met reviews en beoordelingen.">|g' "$FILE"
sed -i '' 's|<meta property="og:locale" content="en_US">|<meta property="og:locale" content="nl_NL">\n    <meta property="og:locale:alternate" content="en_US">|g' "$FILE"

# 5. Update Twitter tags
sed -i '' 's|<meta property="twitter:url" content="https://companionguide\.ai/companions">|<meta property="twitter:url" content="https://companionguide.ai/nl/companions">|g' "$FILE"
sed -i '' 's|<meta property="twitter:title" content="All AI Companions - CompanionGuide\.ai">|<meta property="twitter:title" content="Alle AI Companions - CompanionGuide.ai">|g' "$FILE"
sed -i '' 's|<meta property="twitter:description" content="Browse all AI companion platforms\.">|<meta property="twitter:description" content="Bekijk alle AI companion platforms.">|g' "$FILE"

# 6. Fix CSS path (if needed)
sed -i '' 's|href="style\.css"|href="/style.css"|g' "$FILE"

# 7. Fix JavaScript paths
sed -i '' 's|src="script\.js|src="/script.js|g' "$FILE"
sed -i '' 's|src="js/companions\.js|src="/js/companions.js|g' "$FILE"

# 8. Update language switcher to NL active
sed -i '' 's|🇬🇧 EN|🇳🇱 NL|g' "$FILE"
sed -i '' 's|<a href="/" class="lang-option active">🇬🇧 English</a>|<a href="/" class="lang-option">🇬🇧 English</a>|g' "$FILE"
sed -i '' 's|<a href="/nl/" class="lang-option">🇳🇱 Nederlands</a>|<a href="/nl/" class="lang-option active">🇳🇱 Nederlands</a>|g' "$FILE"

# 9. Remove extra languages (ES, DE, FR, IT, PT, PL)
sed -i '' 's|<a href="/es/" class="lang-option">🇪🇸 Español</a>||g' "$FILE"
sed -i '' 's|<a href="/de/" class="lang-option">🇩🇪 Deutsch</a>||g' "$FILE"
sed -i '' 's|<a href="/fr/" class="lang-option">🇫🇷 Français</a>||g' "$FILE"
sed -i '' 's|<a href="/it/" class="lang-option">🇮🇹 Italiano</a>||g' "$FILE"
sed -i '' 's|<a href="/pt/" class="lang-option">🇵🇹 Português</a>||g' "$FILE"
sed -i '' 's|<a href="/pl/" class="lang-option">🇵🇱 Polski</a>||g' "$FILE"

# 10. Update navigation menu links to /nl/
sed -i '' 's|<li><a href="/">Home</a>|<li><a href="/nl/" data-i18n="nav.home">Home</a>|g' "$FILE"
sed -i '' 's|<li><a href="/companions">Companions</a>|<li><a href="/nl/companions" data-i18n="nav.companions">Companions</a>|g' "$FILE"
sed -i '' 's|<li><a href="/categories">Categories</a>|<li><a href="/nl/categories" data-i18n="nav.categories">Categorieën</a>|g' "$FILE"
sed -i '' 's|<li><a href="/news">News & Insights</a>|<li><a href="/nl/news" data-i18n="nav.news">Nieuws</a>|g' "$FILE"
sed -i '' 's|<li><a href="/deals">Deals</a>|<li><a href="/nl/deals" data-i18n="nav.deals">Deals</a>|g' "$FILE"

# 11. Translate page header
sed -i '' 's|<h1>All AI Companion Platforms</h1>|<h1 data-i18n="companions.title">Alle AI Companion Platforms</h1>|g' "$FILE"
sed -i '' 's|<p class="page-description">Browse our complete directory of AI chat platforms, AI companions, and character chat apps\. Compare features, pricing, and reviews\.</p>|<p class="page-description">Bekijk onze complete directory van AI chat platforms, AI companions en character chat apps. Vergelijk functies, prijzen en reviews.</p>|g' "$FILE"

# 12. Translate filter/sort labels
sed -i '' 's|<label for="category-filter">Filter by Category:</label>|<label for="category-filter">Filter op Categorie:</label>|g' "$FILE"
sed -i '' 's|<option value="">All Categories</option>|<option value="">Alle Categorieën</option>|g' "$FILE"
sed -i '' 's|<label for="sort-select">Sort by:</label>|<label for="sort-select">Sorteer op:</label>|g' "$FILE"
sed -i '' 's|<option value="rating">Highest Rated</option>|<option value="rating">Hoogst Gewaardeerd</option>|g' "$FILE"
sed -i '' 's|<option value="popular">Most Popular</option>|<option value="popular">Meest Populair</option>|g' "$FILE"
sed -i '' 's|<option value="newest">Newest</option>|<option value="newest">Nieuwste</option>|g' "$FILE"
sed -i '' 's|<option value="name">Name (A-Z)</option>|<option value="name">Naam (A-Z)</option>|g' "$FILE"

# 13. Translate "Loading..." text
sed -i '' 's|>Loading\.\.\.<|>Laden...<|g' "$FILE"

# 14. Translate footer tagline
sed -i '' 's|<p>Your trusted source for AI companion reviews and guides</p>|<p data-i18n="footer.tagline">Je betrouwbare gids voor AI companions en chat platforms</p>|g' "$FILE"

# 15. Add i18n.js script if not present
if ! grep -q "i18n.js" "$FILE"; then
    sed -i '' 's|<script src="/script.js|<script src="/js/i18n.js"></script>\n    <script src="/script.js|g' "$FILE"
fi

echo "✅ Companions page translated to Dutch"
echo "📄 File: nl/companions.html"
echo "🌐 URL: https://companionguide.ai/nl/companions"
