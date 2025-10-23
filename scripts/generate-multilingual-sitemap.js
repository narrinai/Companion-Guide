#!/usr/bin/env node

/**
 * Generate multilingual sitemap with EN, NL, and PT URLs
 * Includes all pages with proper lastmod dates and priorities
 */

const fs = require('fs');
const path = require('path');

const today = new Date().toISOString().split('T')[0];
const baseUrl = 'https://companionguide.ai';

// Get all companion slugs
const companionsDir = path.join(__dirname, '..', 'companions');
const companionFiles = fs.readdirSync(companionsDir)
  .filter(f => f.endsWith('.html'))
  .map(f => f.replace('.html', ''));

// Get all category slugs (excluding backups)
const categoriesDir = path.join(__dirname, '..', 'categories');
const categoryFiles = fs.readdirSync(categoriesDir)
  .filter(f => f.endsWith('.html') && !f.includes('backup'))
  .map(f => f.replace('.html', ''));

// Build sitemap XML
let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <!-- Main Pages - English -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="nl" href="${baseUrl}/nl/" />
    <xhtml:link rel="alternate" hreflang="pt" href="${baseUrl}/pt/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/" />
  </url>

  <url>
    <loc>${baseUrl}/companions</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/companions" />
    <xhtml:link rel="alternate" hreflang="nl" href="${baseUrl}/nl/companions" />
    <xhtml:link rel="alternate" hreflang="pt" href="${baseUrl}/pt/companions" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/companions" />
  </url>

  <url>
    <loc>${baseUrl}/categories</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/categories" />
    <xhtml:link rel="alternate" hreflang="nl" href="${baseUrl}/nl/categories" />
    <xhtml:link rel="alternate" hreflang="pt" href="${baseUrl}/pt/categories" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/categories" />
  </url>

  <url>
    <loc>${baseUrl}/news</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/news" />
    <xhtml:link rel="alternate" hreflang="nl" href="${baseUrl}/nl/news" />
    <xhtml:link rel="alternate" hreflang="pt" href="${baseUrl}/pt/news" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/news" />
  </url>

  <url>
    <loc>${baseUrl}/deals</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/deals" />
    <xhtml:link rel="alternate" hreflang="nl" href="${baseUrl}/nl/deals" />
    <xhtml:link rel="alternate" hreflang="pt" href="${baseUrl}/pt/deals" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/deals" />
  </url>

  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/contact" />
    <xhtml:link rel="alternate" hreflang="nl" href="${baseUrl}/nl/contact" />
    <xhtml:link rel="alternate" hreflang="pt" href="${baseUrl}/pt/contact" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/contact" />
  </url>

  <url>
    <loc>${baseUrl}/companions-az</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/companions-az" />
    <xhtml:link rel="alternate" hreflang="nl" href="${baseUrl}/nl/companions-az" />
    <xhtml:link rel="alternate" hreflang="pt" href="${baseUrl}/pt/companions-az" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/companions-az" />
  </url>

  <!-- Main Pages - Nederlands -->
  <url>
    <loc>${baseUrl}/nl/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="nl" href="${baseUrl}/nl/" />
    <xhtml:link rel="alternate" hreflang="pt" href="${baseUrl}/pt/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/" />
  </url>

  <url>
    <loc>${baseUrl}/nl/companions</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/nl/categories</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/nl/news</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/nl/deals</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/nl/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>${baseUrl}/nl/companions-az</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Main Pages - Português -->
  <url>
    <loc>${baseUrl}/pt/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/" />
    <xhtml:link rel="alternate" hreflang="nl" href="${baseUrl}/nl/" />
    <xhtml:link rel="alternate" hreflang="pt" href="${baseUrl}/pt/" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/" />
  </url>

  <url>
    <loc>${baseUrl}/pt/companions</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/pt/categories</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/pt/news</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/pt/deals</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/pt/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>${baseUrl}/pt/companions-az</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Companion Pages - English -->
`;

// Add companion pages for all languages
companionFiles.forEach(slug => {
  sitemap += `  <url>
    <loc>${baseUrl}/companions/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/companions/${slug}" />
    <xhtml:link rel="alternate" hreflang="nl" href="${baseUrl}/nl/companions/${slug}" />
    <xhtml:link rel="alternate" hreflang="pt" href="${baseUrl}/pt/companions/${slug}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/companions/${slug}" />
  </url>

`;
});

sitemap += `  <!-- Companion Pages - Nederlands -->
`;

companionFiles.forEach(slug => {
  sitemap += `  <url>
    <loc>${baseUrl}/nl/companions/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

`;
});

sitemap += `  <!-- Companion Pages - Português -->
`;

companionFiles.forEach(slug => {
  sitemap += `  <url>
    <loc>${baseUrl}/pt/companions/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

`;
});

sitemap += `  <!-- Category Pages - English -->
`;

categoryFiles.forEach(slug => {
  sitemap += `  <url>
    <loc>${baseUrl}/categories/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/categories/${slug}" />
    <xhtml:link rel="alternate" hreflang="nl" href="${baseUrl}/nl/categories/${slug}" />
    <xhtml:link rel="alternate" hreflang="pt" href="${baseUrl}/pt/categories/${slug}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}/categories/${slug}" />
  </url>

`;
});

sitemap += `  <!-- Category Pages - Nederlands -->
`;

categoryFiles.forEach(slug => {
  sitemap += `  <url>
    <loc>${baseUrl}/nl/categories/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

`;
});

sitemap += `  <!-- Category Pages - Português -->
`;

categoryFiles.forEach(slug => {
  sitemap += `  <url>
    <loc>${baseUrl}/pt/categories/${slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

`;
});

sitemap += `</urlset>
`;

// Write sitemap
const sitemapPath = path.join(__dirname, '..', 'sitemap.xml');
fs.writeFileSync(sitemapPath, sitemap, 'utf-8');

console.log('✅ Multilingual sitemap generated successfully!');
console.log(`\nStatistics:`);
console.log(`  - Main pages: 7 × 3 languages = 21 URLs`);
console.log(`  - Companion pages: ${companionFiles.length} × 3 languages = ${companionFiles.length * 3} URLs`);
console.log(`  - Category pages: ${categoryFiles.length} × 3 languages = ${categoryFiles.length * 3} URLs`);
console.log(`  - Total URLs: ${21 + (companionFiles.length * 3) + (categoryFiles.length * 3)}`);
console.log(`\n📝 File: sitemap.xml`);
console.log(`📅 Last modified: ${today}`);
