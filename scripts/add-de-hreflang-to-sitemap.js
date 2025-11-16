#!/usr/bin/env node

/**
 * Add DE hreflang links to English companion pages in sitemap
 */

const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

// Pattern to find EN companion entries with hreflang links but no DE
// Match: EN companion URLs that have PT hreflang but not DE
const pattern = /(<url>\s*<loc>https:\/\/companionguide\.ai\/companions\/([^<]+)<\/loc>[\s\S]*?<xhtml:link rel="alternate" hreflang="pt" href="https:\/\/companionguide\.ai\/pt\/companions\/\2" \/>)\s*(<xhtml:link rel="alternate" hreflang="x-default")/g;

let count = 0;
const newSitemap = sitemap.replace(pattern, (match, before, slug, after) => {
  count++;
  return `${before}
    <xhtml:link rel="alternate" hreflang="de" href="https://companionguide.ai/de/companions/${slug}" />
    ${after}`;
});

if (count > 0) {
  fs.writeFileSync(sitemapPath, newSitemap, 'utf8');
  console.log(`✅ Added DE hreflang links to ${count} English companion pages`);
} else {
  console.log('⚠️  No changes made - DE hreflang links might already exist');
}
