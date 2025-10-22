#!/bin/bash

# Script to translate contact.html to Dutch
# Creates nl/contact.html with Dutch translations

echo "🌍 Translating contact page to Dutch..."

# Create nl directory if it doesn't exist
mkdir -p nl

# Copy original file
cp contact.html nl/contact.html

FILE="nl/contact.html"

# Update HTML lang attribute
sed -i '' 's|<html lang="en">|<html lang="nl">|g' "$FILE"

# Update meta tags
sed -i '' 's|<title>Contact Us - Companion Guide</title>|<title>Contact - Companion Guide</title>|g' "$FILE"
sed -i '' 's|<meta name="description" content="Get in touch with Companion Guide for questions, suggestions, or partnership inquiries.">|<meta name="description" content="Neem contact op met Companion Guide voor vragen, suggesties of samenwerkingsmogelijkheden.">|g' "$FILE"

# Update canonical and hreflang
sed -i '' 's|<link rel="canonical" href="https://companionguide.ai/contact">|<link rel="canonical" href="https://companionguide.ai/nl/contact">\n    <link rel="alternate" hreflang="en" href="https://companionguide.ai/contact">\n    <link rel="alternate" hreflang="nl" href="https://companionguide.ai/nl/contact">\n    <link rel="alternate" hreflang="x-default" href="https://companionguide.ai/contact">|g' "$FILE"

# Update Open Graph tags
sed -i '' 's|<meta property="og:url" content="https://companionguide.ai/contact">|<meta property="og:url" content="https://companionguide.ai/nl/contact">|g' "$FILE"
sed -i '' 's|<meta property="og:title" content="Contact Us - Companion Guide">|<meta property="og:title" content="Contact - Companion Guide">|g' "$FILE"

# Update Twitter tags
sed -i '' 's|<meta property="twitter:url" content="https://companionguide.ai/contact">|<meta property="twitter:url" content="https://companionguide.ai/nl/contact">|g' "$FILE"

# Fix CSS path to absolute
sed -i '' 's|<link rel="stylesheet" href="style.css">|<link rel="stylesheet" href="/style.css">|g' "$FILE"

# Update navigation links to Dutch
sed -i '' 's|<li><a href="/">Home</a></li>|<li><a href="/nl/" data-i18n="nav.home">Home</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/companions">Companions</a></li>|<li><a href="/nl/companions" data-i18n="nav.companions">Companions</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/categories">Categories</a></li>|<li><a href="/nl/categories" data-i18n="nav.categories">Categorieën</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/news">News & Insights</a></li>|<li><a href="/nl/news" data-i18n="nav.news">Nieuws</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/deals">Deals</a></li>|<li><a href="/nl/deals" data-i18n="nav.deals">Deals</a></li>|g' "$FILE"
sed -i '' 's|<li><a href="/contact" class="active">Contact</a></li>|<li><a href="/nl/contact" class="active" data-i18n="nav.contact">Contact</a></li>|g' "$FILE"

# Update logo link
sed -i '' 's|<h1><a href="/">|<h1><a href="/nl/">|g' "$FILE"

# Translate hero section
sed -i '' 's|<h1>Contact Us</h1>|<h1 data-i18n="contact.title">Neem Contact Op</h1>|g' "$FILE"
sed -i '' 's|<p>Have a question, suggestion, or want to partner with us? We'"'"'d love to hear from you!</p>|<p data-i18n="contact.subtitle">Heb je een vraag, suggestie of wil je met ons samenwerken? We horen graag van je!</p>|g' "$FILE"

# Translate form labels
sed -i '' 's|<label for="name">Name</label>|<label for="name" data-i18n="contact.form.name">Naam</label>|g' "$FILE"
sed -i '' 's|<label for="email">Email</label>|<label for="email" data-i18n="contact.form.email">E-mail</label>|g' "$FILE"
sed -i '' 's|<label for="subject">Subject</label>|<label for="subject" data-i18n="contact.form.subject">Onderwerp</label>|g' "$FILE"
sed -i '' 's|<label for="message">Message</label>|<label for="message" data-i18n="contact.form.message">Bericht</label>|g' "$FILE"

# Translate form placeholders
sed -i '' 's|placeholder="Your name"|placeholder="Je naam"|g' "$FILE"
sed -i '' 's|placeholder="your@email.com"|placeholder="jouw@email.com"|g' "$FILE"
sed -i '' 's|placeholder="What'"'"'s this about?"|placeholder="Waar gaat dit over?"|g' "$FILE"
sed -i '' 's|placeholder="Your message here..."|placeholder="Je bericht hier..."|g' "$FILE"

# Translate button
sed -i '' 's|<button type="submit">Send Message</button>|<button type="submit" data-i18n="contact.form.submit">Verstuur Bericht</button>|g' "$FILE"

# Translate contact info section
sed -i '' 's|<h2>Other Ways to Reach Us</h2>|<h2 data-i18n="contact.other.title">Andere Manieren om Contact Op Te Nemen</h2>|g' "$FILE"
sed -i '' 's|<h3>Email</h3>|<h3 data-i18n="contact.email.title">E-mail</h3>|g' "$FILE"
sed -i '' 's|<h3>Social Media</h3>|<h3 data-i18n="contact.social.title">Social Media</h3>|g' "$FILE"
sed -i '' 's|<p>Follow us for the latest updates</p>|<p data-i18n="contact.social.subtitle">Volg ons voor de laatste updates</p>|g' "$FILE"

# Update footer
sed -i '' 's|<p>Your trusted source for AI companion reviews and guides</p>|<p data-i18n="footer.tagline">Je betrouwbare gids voor AI companions en chat platforms</p>|g' "$FILE"
sed -i '' 's|<p>&copy; 2025 Companion Guide. All rights reserved.</p>|<p data-i18n="footer.copyright">&copy; 2025 Companion Guide. Alle rechten voorbehouden.</p>|g' "$FILE"

# Add i18n.js script if not present
if ! grep -q "i18n.js" "$FILE"; then
    sed -i '' 's|<script src="/script.js|<script src="/js/i18n.js"></script>\n    <script src="/script.js|g' "$FILE"
fi

# Fix script paths to absolute
sed -i '' 's|src="script\.js|src="/script.js|g' "$FILE"

echo "✅ Contact page translated to Dutch"
echo "📄 File: nl/contact.html"
echo "🌐 URL: https://companionguide.ai/nl/contact"
