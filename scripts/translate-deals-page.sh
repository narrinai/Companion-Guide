#!/bin/bash

# Script to translate deals.html to Dutch
# Creates nl/deals.html with Dutch translations

echo "🌍 Translating deals page to Dutch..."

# Create nl directory if it doesn't exist
mkdir -p nl

# Copy original file
cp deals.html nl/deals.html

FILE="nl/deals.html"

# Update HTML lang attribute
sed -i '' 's|<html lang="en">|<html lang="nl">|g' "$FILE"

# Update meta tags
sed -i '' 's|<title>AI Chat Platform Deals 2025 - Best Discounts & Offers</title>|<title>AI Chat Platform Deals 2025 - Beste Kortingen \& Aanbiedingen</title>|g' "$FILE"
sed -i '' 's|<meta name="description" content="Save up to 50% on AI chat platforms. Exclusive deals on Nectar AI, DreamGF, Secrets AI. Premium AI chat subscription discounts updated daily.">|<meta name="description" content="Bespaar tot 50% op AI chat platforms. Exclusieve deals op Nectar AI, DreamGF, Secrets AI. Premium AI chat abonnementskortingen dagelijks bijgewerkt.">|g' "$FILE"
sed -i '' 's|<meta name="keywords" content="AI chat deals, AI companion deals, AI chat discounts, AI chat platform offers, Nectar AI discount, AI chat promo codes, best AI chat deals 2025, AI companion coupons">|<meta name="keywords" content="AI chat deals, AI companion deals, AI chat kortingen, AI chat platform aanbiedingen, Nectar AI korting, AI chat promo codes, beste AI chat deals 2025, AI companion kortingscodes">|g' "$FILE"

# Update canonical and hreflang
sed -i '' 's|<link rel="canonical" href="https://companionguide.ai/deals">|<link rel="canonical" href="https://companionguide.ai/nl/deals">\n    <link rel="alternate" hreflang="en" href="https://companionguide.ai/deals">\n    <link rel="alternate" hreflang="nl" href="https://companionguide.ai/nl/deals">\n    <link rel="alternate" hreflang="x-default" href="https://companionguide.ai/deals">|g' "$FILE"

# Update Open Graph tags
sed -i '' 's|<meta property="og:url" content="https://companionguide.ai/deals">|<meta property="og:url" content="https://companionguide.ai/nl/deals">|g' "$FILE"
sed -i '' 's|<meta property="og:title" content="AI Companion Deals & Discounts - Save up to 50%">|<meta property="og:title" content="AI Companion Deals \& Kortingen - Bespaar tot 50%">|g' "$FILE"
sed -i '' 's|<meta property="og:description" content="Exclusive deals on AI companion platforms. Save big on premium subscriptions with our curated offers.">|<meta property="og:description" content="Exclusieve deals op AI companion platforms. Bespaar flink op premium abonnementen met onze geselecteerde aanbiedingen.">|g' "$FILE"

# Update Twitter tags
sed -i '' 's|<meta property="twitter:url" content="https://companionguide.ai/deals">|<meta property="twitter:url" content="https://companionguide.ai/nl/deals">|g' "$FILE"
sed -i '' 's|<meta property="twitter:title" content="AI Companion Deals & Discounts 2025">|<meta property="twitter:title" content="AI Companion Deals \& Kortingen 2025">|g' "$FILE"
sed -i '' 's|<meta property="twitter:description" content="Save up to 50% on AI companion subscriptions with exclusive deals.">|<meta property="twitter:description" content="Bespaar tot 50% op AI companion abonnementen met exclusieve deals.">|g' "$FILE"

# Update navigation links to Dutch
sed -i '' 's|<li><a href="/">Home</a></li>|<li><a href="/nl/" data-i18n="nav.home">Home</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/companions">Companions</a></li>|<li><a href="/nl/companions" data-i18n="nav.companions">Companions</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/categories">Categories</a></li>|<li><a href="/nl/categories" data-i18n="nav.categories">Categorieën</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/news">News & Insights</a></li>|<li><a href="/nl/news" data-i18n="nav.news">Nieuws</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/deals" class="active">Deals</a></li>|<li><a href="/nl/deals" class="active" data-i18n="nav.deals">Deals</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/contact">Contact</a></li>|<li><a href="/nl/contact" data-i18n="nav.contact">Contact</a></li>|g' "$FILE"

# Update logo link
sed -i '' 's|<h1><a href="/">|<h1><a href="/nl/">|g' "$FILE"

# Translate hero section
sed -i '' 's|<h1>AI Chat & Companion Platform Deals</h1>|<h1 data-i18n="deals.title">AI Chat \& Companion Platform Deals</h1>|g' "$FILE"
sed -i '' 's|<p>Save big on premium AI chat platforms and AI companion subscriptions with exclusive deals and discount codes for the best AI chat experiences</p>|<p data-i18n="deals.subtitle">Bespaar flink op premium AI chat platforms en AI companion abonnementen met exclusieve deals en kortingscodes voor de beste AI chat ervaringen</p>|g' "$FILE"

# Translate section headings
sed -i '' 's|<h2>How Our AI Chat Deals Work</h2>|<h2 data-i18n="deals.howItWorks.title">Hoe Onze AI Chat Deals Werken</h2>|g' "$FILE"
sed -i '' 's|<h2>More AI Chat Deals Coming Soon!</h2>|<h2 data-i18n="deals.comingSoon.title">Meer AI Chat Deals Binnenkort!</h2>|g' "$FILE"

# Translate deal badges
sed -i '' 's|EXCLUSIVE|EXCLUSIEF|g' "$FILE"
sed -i '' 's|LIMITED TIME|BEPERKTE TIJD|g' "$FILE"
sed -i '' 's|BEST VALUE|BESTE WAARDE|g' "$FILE"

# Translate deal button text
sed -i '' 's|Get Deal|Ontvang Deal|g' "$FILE"
sed -i '' 's|Claim Offer|Claim Aanbieding|g' "$FILE"
sed -i '' 's|View Deal|Bekijk Deal|g' "$FILE"

# Translate "Off" discount text
sed -i '' 's| Off| Korting|g' "$FILE"

# Update footer
sed -i '' 's|<p>Your trusted source for AI companion reviews and guides</p>|<p data-i18n="footer.tagline">Je betrouwbare gids voor AI companions en chat platforms</p>|g' "$FILE"
sed -i '' 's|<p>&copy; 2025 Companion Guide. All rights reserved.</p>|<p data-i18n="footer.copyright">&copy; 2025 Companion Guide. Alle rechten voorbehouden.</p>|g' "$FILE"

# Add i18n.js script if not present
if ! grep -q "i18n.js" "$FILE"; then
    sed -i '' 's|<script src="/script.js|<script src="/js/i18n.js"></script>\n    <script src="/script.js|g' "$FILE"
fi

# Fix script paths to absolute
sed -i '' 's|src="script\.js|src="/script.js|g' "$FILE"

echo "✅ Deals page translated to Dutch"
echo "📄 File: nl/deals.html"
echo "🌐 URL: https://companionguide.ai/nl/deals"
