#!/usr/bin/env node

/**
 * Add German (DE) companion pages to sitemap.xml
 */

const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

// Get all DE companion HTML files
const deCompanionsDir = path.join(process.cwd(), 'de/companions');
const deFiles = fs.readdirSync(deCompanionsDir)
  .filter(file => file.endsWith('.html'))
  .map(file => file.replace('.html', ''))
  .sort();

console.log(`Found ${deFiles.length} German companion pages to add to sitemap`);

// Find the insertion point - after the last PT companion entry
const lastPtCompanionPattern = /<url>\s*<loc>https:\/\/companionguide\.ai\/pt\/companions\/[^<]+<\/loc>\s*<lastmod>[^<]+<\/lastmod>\s*<changefreq>weekly<\/changefreq>\s*<priority>0\.8<\/priority>\s*<\/url>/g;

const matches = [...sitemap.matchAll(lastPtCompanionPattern)];
const lastMatch = matches[matches.length - 1];

if (!lastMatch) {
  console.error('❌ Could not find PT companion entries in sitemap');
  process.exit(1);
}

const insertPosition = lastMatch.index + lastMatch[0].length;

// Generate DE companion entries
const deEntries = deFiles.map(slug => {
  return `
  <url>
    <loc>https://companionguide.ai/de/companions/${slug}</loc>
    <lastmod>2025-11-16</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
}).join('');

// Insert DE entries
const newSitemap = sitemap.slice(0, insertPosition) + deEntries + sitemap.slice(insertPosition);

// Write updated sitemap
fs.writeFileSync(sitemapPath, newSitemap, 'utf8');

console.log(`✅ Added ${deFiles.length} German companion pages to sitemap.xml`);
console.log('DE companions added:', deFiles.slice(0, 5).join(', '), '...');
