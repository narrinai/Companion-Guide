#!/usr/bin/env node

/**
 * Add DE hreflang links to main English pages in sitemap
 */

const fs = require('fs');
const path = require('path');

const sitemapPath = path.join(process.cwd(), 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');

// Define EN main pages that need DE hreflang
const pages = [
  { enPath: '/', dePath: '/de/' },
  { enPath: '/companions', dePath: '/de/companions' },
  { enPath: '/categories', dePath: '/de/categories' },
  { enPath: '/deals', dePath: '/de/deals' },
  { enPath: '/news', dePath: '/de/news' },
  { enPath: '/contact', dePath: '/de/contact' },
  { enPath: '/categories/adult-content-uncensored', dePath: '/de/categories/adult-content-uncensored' }
];

let totalChanges = 0;

pages.forEach(page => {
  // Escape special characters for regex
  const escapedPath = page.enPath.replace(/\//g, '\\/');

  // Pattern to match EN page with PT hreflang but no DE
  const pattern = new RegExp(
    `(<loc>https:\\/\\/companionguide\\.ai${escapedPath}<\\/loc>[\\s\\S]*?<xhtml:link rel="alternate" hreflang="pt" href="https:\\/\\/companionguide\\.ai\\/pt${escapedPath}" \\/>)\\s*(<xhtml:link rel="alternate" hreflang="x-default")`,
    'g'
  );

  const before = sitemap;
  sitemap = sitemap.replace(pattern, (match, before, after) => {
    totalChanges++;
    return `${before}
    <xhtml:link rel="alternate" hreflang="de" href="https://companionguide.ai${page.dePath}" />
    ${after}`;
  });

  if (sitemap !== before) {
    console.log(`✅ Added DE hreflang to: ${page.enPath}`);
  }
});

if (totalChanges > 0) {
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
  console.log(`\n✅ Added DE hreflang links to ${totalChanges} English main pages`);
} else {
  console.log('⚠️  No changes made - DE hreflang links might already exist');
}
