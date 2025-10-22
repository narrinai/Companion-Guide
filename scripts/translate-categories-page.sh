#!/bin/bash

# Script to translate categories.html to Dutch
# Creates nl/categories.html with Dutch translations

echo "🌍 Translating categories page to Dutch..."

# Create nl directory if it doesn't exist
mkdir -p nl

# Copy original file
cp categories.html nl/categories.html

FILE="nl/categories.html"

# Update HTML lang attribute
sed -i '' 's|<html lang="en">|<html lang="nl">|g' "$FILE"

# Update meta tags
sed -i '' 's|<title>AI Companion Categories 2025 - Browse by Platform Type & Use Case</title>|<title>AI Companion Categorieën 2025 - Ontdek per Platformtype & Gebruiksdoel</title>|g' "$FILE"
sed -i '' 's|<meta name="description" content="Explore AI companion platforms by category: Entertainment, Wellness, Productivity, Learning, and NSFW. Find the right AI companion type for your specific needs.">|<meta name="description" content="Ontdek AI companion platforms per categorie: Entertainment, Wellness, Productiviteit, Educatie en NSFW. Vind het juiste AI companion type voor jouw specifieke behoeften.">|g' "$FILE"
sed -i '' 's|<meta name="keywords" content="AI companion categories, AI platform types, entertainment AI, wellness AI, productivity AI, learning AI, NSFW AI, AI companion classification">|<meta name="keywords" content="AI companion categorieën, AI platform types, entertainment AI, wellness AI, productiviteit AI, educatie AI, NSFW AI, AI companion classificatie">|g' "$FILE"

# Update canonical and hreflang
sed -i '' 's|<link rel="canonical" href="https://companionguide.ai/categories">|<link rel="canonical" href="https://companionguide.ai/nl/categories">\n    <link rel="alternate" hreflang="en" href="https://companionguide.ai/categories">\n    <link rel="alternate" hreflang="nl" href="https://companionguide.ai/nl/categories">\n    <link rel="alternate" hreflang="x-default" href="https://companionguide.ai/categories">|g' "$FILE"

# Update Open Graph tags
sed -i '' 's|<meta property="og:url" content="https://companionguide.ai/categories">|<meta property="og:url" content="https://companionguide.ai/nl/categories">|g' "$FILE"
sed -i '' 's|<meta property="og:title" content="AI Companion Categories 2025 - Browse by Type">|<meta property="og:title" content="AI Companion Categorieën 2025 - Ontdek per Type">|g' "$FILE"
sed -i '' 's|<meta property="og:description" content="Explore AI companion platforms by category and find the right type for your needs.">|<meta property="og:description" content="Ontdek AI companion platforms per categorie en vind het juiste type voor jouw behoeften.">|g' "$FILE"

# Update Twitter tags
sed -i '' 's|<meta property="twitter:url" content="https://companionguide.ai/categories">|<meta property="twitter:url" content="https://companionguide.ai/nl/categories">|g' "$FILE"
sed -i '' 's|<meta property="twitter:title" content="AI Companion Categories 2025">|<meta property="twitter:title" content="AI Companion Categorieën 2025">|g' "$FILE"
sed -i '' 's|<meta property="twitter:description" content="Browse AI companions by category and platform type.">|<meta property="twitter:description" content="Ontdek AI companions per categorie en platformtype.">|g' "$FILE"

# Fix CSS path to absolute
sed -i '' 's|<link rel="stylesheet" href="style.css">|<link rel="stylesheet" href="/style.css">|g' "$FILE"

# Update navigation links to Dutch
sed -i '' 's|<li><a href="/">Home</a></div>|<li><a href="/nl/" data-i18n="nav.home">Home</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/companions">Companions</a></div>|<li><a href="/nl/companions" data-i18n="nav.companions">Companions</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/categories" class="active">Categories</a></div>|<li><a href="/nl/categories" class="active" data-i18n="nav.categories">Categorieën</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/news">News & Insights</a></div>|<li><a href="/nl/news" data-i18n="nav.news">Nieuws</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/deals">Deals</a></div>|<li><a href="/nl/deals" data-i18n="nav.deals">Deals</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/contact">Contact</a></div>|<li><a href="/nl/contact" data-i18n="nav.contact">Contact</a></li>|g' "$FILE"

# Update logo link
sed -i '' 's|<h1><a href="/">|<h1><a href="/nl/">|g' "$FILE"

# Translate hero section
sed -i '' 's|<h1>AI Companion Platform Categories</h1>|<h1 data-i18n="categories.title">AI Companion Platform Categorieën</h1>|g' "$FILE"
sed -i '' 's|<p>Explore the best AI companion platforms organized by category and use case. Find the perfect platform type for your specific needs and preferences.</p>|<p data-i18n="categories.subtitle">Ontdek de beste AI companion platforms georganiseerd per categorie en gebruiksdoel. Vind het perfecte platformtype voor jouw specifieke behoeften en voorkeuren.</p>|g' "$FILE"

# Translate category cards
sed -i '' 's|<h3>Roleplay & Character Chat</h3>|<h3 data-i18n="categories.roleplay.title">Roleplay \& Character Chat</h3>|g' "$FILE"
sed -i '' 's|<p>Best AI platforms for roleplay and character chat experiences with interactive storytelling</p>|<p data-i18n="categories.roleplay.description">Beste AI platforms voor roleplay en character chat ervaringen met interactieve verhalen</p>|g' "$FILE"

sed -i '' 's|<h3>Wellness & Mental Health</h3>|<h3 data-i18n="categories.wellness.title">Wellness \& Mentale Gezondheid</h3>|g' "$FILE"
sed -i '' 's|<p>AI companions focused on emotional support, therapy, and mental wellness</p>|<p data-i18n="categories.wellness.description">AI companions gericht op emotionele ondersteuning, therapie en mentaal welzijn</p>|g' "$FILE"

sed -i '' 's|<h3>Productivity & Work</h3>|<h3 data-i18n="categories.productivity.title">Productiviteit \& Werk</h3>|g' "$FILE"
sed -i '' 's|<p>AI assistants designed to boost productivity and streamline your workflow</p>|<p data-i18n="categories.productivity.description">AI assistenten ontworpen om productiviteit te verhogen en workflow te stroomlijnen</p>|g' "$FILE"

sed -i '' 's|<h3>Learning & Education</h3>|<h3 data-i18n="categories.learning.title">Leren \& Educatie</h3>|g' "$FILE"
sed -i '' 's|<p>Educational AI platforms for tutoring, language learning, and skill development</p>|<p data-i18n="categories.learning.description">Educatieve AI platforms voor bijles, talen leren en vaardighedenontwikkeling</p>|g' "$FILE"

sed -i '' 's|<h3>NSFW & Adult</h3>|<h3 data-i18n="categories.nsfw.title">NSFW \& Adult</h3>|g' "$FILE"
sed -i '' 's|<p>AI companions for adult conversations and mature content (18+)</p>|<p data-i18n="categories.nsfw.description">AI companions voor volwassen gesprekken en mature content (18+)</p>|g' "$FILE"

sed -i '' 's|<h3>Entertainment & Fun</h3>|<h3 data-i18n="categories.entertainment.title">Entertainment \& Fun</h3>|g' "$FILE"
sed -i '' 's|<p>AI companions for entertainment, games, and casual conversations</p>|<p data-i18n="categories.entertainment.description">AI companions voor entertainment, games en casual gesprekken</p>|g' "$FILE"

# Translate category stats "platforms available"
sed -i '' 's|platforms available|platforms beschikbaar|g' "$FILE"
sed -i '' 's|Loading\.\.\.|Laden\.\.\.|g' "$FILE"

# Update category page links to Dutch
sed -i '' 's|href="/categories/|href="/nl/categories/|g' "$FILE"

# Update footer navigation
sed -i '' 's|<div class="footer-section">|<div class="footer-section">\n                    <p data-i18n="footer.tagline">Je betrouwbare gids voor AI companions en chat platforms</p>|g' "$FILE"

# Add i18n.js script if not present
if ! grep -q "i18n.js" "$FILE"; then
    sed -i '' 's|<script src="script.js|<script src="/js/i18n.js"></script>\n    <script src="/script.js|g' "$FILE"
fi

# Fix script paths to absolute
sed -i '' 's|src="script\.js|src="/script.js|g' "$FILE"

echo "✅ Categories page translated to Dutch"
echo "📄 File: nl/categories.html"
echo "🌐 URL: https://companionguide.ai/nl/categories"
