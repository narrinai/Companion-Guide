#!/usr/bin/env node

/**
 * Create German companion pages from Dutch companion pages (nl/companions/ -> de/companions/)
 * Dutch pages already have all data-i18n attributes, so we copy those
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const NL_COMPANIONS_DIR = path.join(__dirname, '../nl/companions');
const DE_COMPANIONS_DIR = path.join(__dirname, '../de/companions');

// Ensure de/companions directory exists
if (!fs.existsSync(DE_COMPANIONS_DIR)) {
  fs.mkdirSync(DE_COMPANIONS_DIR, { recursive: true });
  console.log('✅ Created de/companions/ directory\n');
}

function createDECompanionPage(filename) {
  const sourcePath = path.join(NL_COMPANIONS_DIR, filename);
  const destPath = path.join(DE_COMPANIONS_DIR, filename);

  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  Source file not found: ${filename}`);
    return;
  }

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
    canonicalLink.setAttribute('href', href.replace('/nl/', '/de/'));
  }

  // 4. Update hreflang tags - remove existing and add new ones
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => link.remove());

  const companionSlug = filename.replace('.html', '');

  // Add all hreflang tags
  const hreflangs = [
    { lang: 'en', url: `https://companionguide.ai/companions/${companionSlug}` },
    { lang: 'nl', url: `https://companionguide.ai/nl/companions/${companionSlug}` },
    { lang: 'pt', url: `https://companionguide.ai/pt/companions/${companionSlug}` },
    { lang: 'de', url: `https://companionguide.ai/de/companions/${companionSlug}` },
    { lang: 'x-default', url: `https://companionguide.ai/companions/${companionSlug}` }
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
    ogUrl.setAttribute('content', content.replace('/nl/', '/de/'));
  }

  // Update twitter:url
  const twitterUrl = document.querySelector('meta[property="twitter:url"]');
  if (twitterUrl) {
    const content = twitterUrl.getAttribute('content');
    twitterUrl.setAttribute('content', content.replace('/nl/', '/de/'));
  }

  // 6. Update language switcher in the page
  const langOptions = document.querySelectorAll('.lang-option');
  langOptions.forEach(option => {
    const href = option.getAttribute('href');
    if (href) {
      // Update the active class
      if (href.includes('/de/')) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    }
  });

  // Write the file
  fs.writeFileSync(destPath, dom.serialize(), 'utf-8');
  console.log(`✅ Created ${filename}`);
}

console.log('🚀 Creating German companion pages from Dutch templates...\n');

// Get all HTML files from nl/companions/
const files = fs.readdirSync(NL_COMPANIONS_DIR).filter(file => file.endsWith('.html'));

console.log(`Found ${files.length} companion pages to process\n`);

let successCount = 0;
let errorCount = 0;

files.forEach(file => {
  try {
    createDECompanionPage(file);
    successCount++;
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
    errorCount++;
  }
});

console.log(`\n✅ German companion pages created successfully!`);
console.log(`   Processed: ${successCount} pages`);
if (errorCount > 0) {
  console.log(`   Errors: ${errorCount} pages`);
}
console.log(`   All data-i18n attributes are in place.`);
console.log(`   Pages will automatically load German translations from /locales/de.json`);
