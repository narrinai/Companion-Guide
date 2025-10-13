#!/bin/bash

# Generate sitemap.xml with all pages
# Date format: YYYY-MM-DD

TODAY=$(date +%Y-%m-%d)
DOMAIN="https://companionguide.ai"

cat > sitemap.xml << 'HEADER'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Main Pages -->
  <url>
    <loc>https://companionguide.ai/</loc>
    <lastmod>TODAY_PLACEHOLDER</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <url>
    <loc>https://companionguide.ai/companions</loc>
    <lastmod>TODAY_PLACEHOLDER</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://companionguide.ai/categories</loc>
    <lastmod>TODAY_PLACEHOLDER</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://companionguide.ai/news</loc>
    <lastmod>TODAY_PLACEHOLDER</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://companionguide.ai/deals</loc>
    <lastmod>TODAY_PLACEHOLDER</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://companionguide.ai/contact</loc>
    <lastmod>TODAY_PLACEHOLDER</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Category Pages -->
HEADER

# Replace TODAY_PLACEHOLDER with actual date
sed -i '' "s/TODAY_PLACEHOLDER/$TODAY/g" sitemap.xml

# Add category pages
echo "  <!-- Category Pages -->" >> sitemap.xml
for file in categories/*.html; do
  [ -f "$file" ] || continue
  slug=$(basename "$file" .html)

  # Skip backup files
  [[ "$slug" == *"-backup"* ]] && continue

  echo "  <url>" >> sitemap.xml
  echo "    <loc>$DOMAIN/categories/$slug</loc>" >> sitemap.xml
  echo "    <lastmod>$TODAY</lastmod>" >> sitemap.xml
  echo "    <changefreq>weekly</changefreq>" >> sitemap.xml
  echo "    <priority>0.8</priority>" >> sitemap.xml
  echo "  </url>" >> sitemap.xml
  echo "" >> sitemap.xml
done

# Add companion pages
echo "  <!-- Companion Pages -->" >> sitemap.xml
for file in companions/*.html; do
  [ -f "$file" ] || continue
  slug=$(basename "$file" .html)
  echo "  <url>" >> sitemap.xml
  echo "    <loc>$DOMAIN/companions/$slug</loc>" >> sitemap.xml
  echo "    <lastmod>$TODAY</lastmod>" >> sitemap.xml
  echo "    <changefreq>monthly</changefreq>" >> sitemap.xml
  echo "    <priority>0.8</priority>" >> sitemap.xml
  echo "  </url>" >> sitemap.xml
  echo "" >> sitemap.xml
done

# Add news articles
echo "  <!-- News Articles -->" >> sitemap.xml
for file in news/*.html; do
  [ -f "$file" ] || continue
  slug=$(basename "$file" .html)

  # Skip backup files
  [[ "$slug" == *"-backup"* ]] && continue

  # Higher priority for alternative guides
  priority="0.7"
  if [[ "$slug" == *"-alternatives-"* ]]; then
    priority="0.9"
  fi

  echo "  <url>" >> sitemap.xml
  echo "    <loc>$DOMAIN/news/$slug</loc>" >> sitemap.xml
  echo "    <lastmod>$TODAY</lastmod>" >> sitemap.xml
  echo "    <changefreq>yearly</changefreq>" >> sitemap.xml
  echo "    <priority>$priority</priority>" >> sitemap.xml
  echo "  </url>" >> sitemap.xml
  echo "" >> sitemap.xml
done

echo "</urlset>" >> sitemap.xml

echo "✓ Sitemap generated with $(grep -c '<url>' sitemap.xml) URLs"
