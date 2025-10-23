#!/bin/bash

echo "🧹 Final cleanup of Dutch text in PT pages..."

# PT COMPANIONS.HTML - Fix FAQ section
echo "Fixing pt/companions.html..."
sed -i.bak 's/<h2 data-i18n="faq\.title">Veelgestelde Vragen over AI Companion Platforms<\/h2>/<h2 data-i18n="faq.title">Frequently Asked Questions about AI Companion Platforms<\/h2>/g' pt/companions.html
sed -i.bak 's/<h3 class="faq-question" itemprop="name">Hoe kies ik het juiste AI companion platform?<\/h3>/<h3 class="faq-question" itemprop="name" data-i18n="companionsPage.faq.q1.question">How do I choose the right AI companion platform?<\/h3>/g' pt/companions.html
sed -i.bak 's/<h3 class="faq-question" itemprop="name">Wat zijn de best beoordeelde AI companion platforms in 2025?<\/h3>/<h3 class="faq-question" itemprop="name" data-i18n="companionsPage.faq.q2.question">What are the best rated AI companion platforms in 2025?<\/h3>/g' pt/companions.html
sed -i.bak 's/<h3 class="faq-question" itemprop="name">Welke AI companions bieden volledig gratis toegang?<\/h3>/<h3 class="faq-question" itemprop="name" data-i18n="companionsPage.faq.q3.question">Which AI companions offer completely free access?<\/h3>/g' pt/companions.html
sed -i.bak 's/<h3 class="faq-question" itemprop="name">Hoe werken de geheugen systemen van AI companions?<\/h3>/<h3 class="faq-question" itemprop="name" data-i18n="companionsPage.faq.q4.question">How do AI companion memory systems work?<\/h3>/g' pt/companions.html

# PT CATEGORIES.HTML - Fix FAQ
echo "Fixing pt/categories.html..."
sed -i.bak 's/Welke AI companion categorie past bij jou?/Which AI companion category suits you best?/g' pt/categories.html

# PT NEWS.HTML - Fix description
echo "Fixing pt/news.html..."
sed -i.bak 's/Blijf op de hoogte van het laatste nieuws/Stay updated with the latest news/g' pt/news.html

# PT CONTACT.HTML - Fix FAQ title
echo "Fixing pt/contact.html..."
sed -i.bak 's/<h2 data-i18n="contact\.faqTitle">Veelgestelde Vragen<\/h2>/<h2 data-i18n="contact.faqTitle">Frequently Asked Questions<\/h2>/g' pt/contact.html

# Clean up backup files
rm -f pt/*.bak

echo "✅ All PT pages cleaned!"
