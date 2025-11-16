#!/usr/bin/env node

/**
 * Add German (DE) main pages to sitemap.xml
 */

const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

// Define DE pages to add
const dePages = [
  { path: '/de/', priority: '1.0', changefreq: 'daily' },
  { path: '/de/companions', priority: '0.9', changefreq: 'weekly' },
  { path: '/de/categories', priority: '0.8', changefreq: 'weekly' },
  { path: '/de/deals', priority: '0.7', changefreq: 'weekly' },
  { path: '/de/news', priority: '0.7', changefreq: 'weekly' },
  { path: '/de/contact', priority: '0.5', changefreq: 'monthly' },
  { path: '/de/categories/adult-content-uncensored', priority: '0.7', changefreq: 'weekly' },
  { path: '/de/categories/adult-content-uncensored-companions', priority: '0.7', changefreq: 'weekly' }
];

// Find insertion point - after the last DE companion entry
const lastDeCompanionPattern = /<url>\s*<loc>https:\/\/companionguide\.ai\/de\/companions\/[^<]+<\/loc>\s*<lastmod>[^<]+<\/lastmod>\s*<changefreq>weekly<\/changefreq>\s*<priority>0\.8<\/priority>\s*<\/url>/g;

const matches = [...sitemap.matchAll(lastDeCompanionPattern)];
if (matches.length === 0) {
  console.error('❌ Could not find DE companion entries in sitemap');
  process.exit(1);
}

const lastMatch = matches[matches.length - 1];
const insertPosition = lastMatch.index + lastMatch[0].length;

// Generate DE main page entries
const deEntries = dePages.map(page => {
  return `
  <url>
    <loc>https://companionguide.ai${page.path}</loc>
    <lastmod>2025-11-16</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
}).join('');

// Insert DE entries
const newSitemap = sitemap.slice(0, insertPosition) + deEntries + sitemap.slice(insertPosition);

// Write updated sitemap
fs.writeFileSync(sitemapPath, newSitemap, 'utf8');

console.log(`✅ Added ${dePages.length} German main pages to sitemap.xml`);
console.log('DE pages added:', dePages.map(p => p.path).join(', '));
