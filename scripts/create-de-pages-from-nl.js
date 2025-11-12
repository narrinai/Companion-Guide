#!/usr/bin/env node

/**
 * Create German pages from Dutch pages (nl/ -> de/)
 * Dutch pages already have all data-i18n attributes, so we copy those instead of English
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const NL_DIR = path.join(__dirname, '../nl');
const DE_DIR = path.join(__dirname, '../de');

// Files to copy
const FILES = [
  'index.html',
  'companions.html',
  'categories.html',
  'news.html',
  'deals.html',
  'contact.html'
];

// Ensure de directory exists
if (!fs.existsSync(DE_DIR)) {
  fs.mkdirSync(DE_DIR, { recursive: true });
}

function createDEPageFromNL(filename) {
  const sourcePath = path.join(NL_DIR, filename);
  const destPath = path.join(DE_DIR, filename);

  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  Source file not found: ${filename}`);
    return;
  }

  console.log(`📄 Processing: ${filename}`);

  // Read the Dutch HTML
  const html = fs.readFileSync(sourcePath, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // 1. Update <html lang="nl"> to <html lang="de">
  const htmlElement = document.querySelector('html');
  if (htmlElement) {
    htmlElement.setAttribute('lang', 'de');
  }

  // 2. Update all /nl/ URLs to /de/
  // Update all hrefs
  const links = document.querySelectorAll('a[href]');
  links.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.includes('/nl')) {
      link.setAttribute('href', href.replace(/\/nl(\/|$)/g, '/de$1'));
    }
  });

  // 3. Update canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    const href = canonicalLink.getAttribute('href');
    canonicalLink.setAttribute('href', href.replace('/nl/', '/de/').replace('/nl', '/de'));
  }

  // 4. Update hreflang tags
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => link.remove());

  const page = filename === 'index.html' ? '' : filename.replace('.html', '');
  const basePath = page ? `/${page}` : '';

  // Add all hreflang tags
  const hreflangs = [
    { lang: 'en', url: `https://companionguide.ai${basePath}` },
    { lang: 'nl', url: `https://companionguide.ai/nl${basePath}` },
    { lang: 'pt', url: `https://companionguide.ai/pt${basePath}` },
    { lang: 'de', url: `https://companionguide.ai/de${basePath}` },
    { lang: 'x-default', url: `https://companionguide.ai${basePath}` }
  ];

  hreflangs.forEach(({ lang, url }) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', lang);
    link.setAttribute('href', url);
    document.head.appendChild(link);
  });

  // 5. Update Open Graph locale
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) {
    ogLocale.setAttribute('content', 'de_DE');
  }

  // Update og:url
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) {
    const content = ogUrl.getAttribute('content');
    ogUrl.setAttribute('content', content.replace('/nl/', '/de/').replace('/nl', '/de'));
  }

  // Update twitter:url
  const twitterUrl = document.querySelector('meta[property="twitter:url"]');
  if (twitterUrl) {
    const content = twitterUrl.getAttribute('content');
    twitterUrl.setAttribute('content', content.replace('/nl/', '/de/').replace('/nl', '/de'));
  }

  // Write the file
  fs.writeFileSync(destPath, dom.serialize(), 'utf-8');
  console.log(`✅ Created ${filename}`);
}

console.log('🚀 Creating German pages from Dutch templates...\n');

FILES.forEach(file => {
  try {
    createDEPageFromNL(file);
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n✅ All German pages created successfully!');
console.log('   All data-i18n attributes are in place.');
console.log('   Pages will automatically load German translations from /locales/de.json');
