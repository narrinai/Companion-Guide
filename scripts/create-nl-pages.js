#!/usr/bin/env node

/**
 * Create Dutch language companion pages in /nl/companions/
 * - Copy all HTML files from /companions/ to /nl/companions/
 * - Update meta tags (lang, title, description)
 * - Add canonical and hreflang tags
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const COMPANIONS_DIR = path.join(__dirname, '../companions');
const NL_COMPANIONS_DIR = path.join(__dirname, '../nl/companions');

// Dutch translations for meta tags
const META_TRANSLATIONS = {
  'Review': 'Review',
  'Complete Guide': 'Volledige Gids',
  'Best': 'Beste',
  'AI Chat': 'AI Chat',
  'Platform': 'Platform',
  'In-depth': 'Diepgaande',
  'review covering': 'review met',
  'features': 'functies',
  'pricing': 'prijzen',
  'pros and cons': 'voor- en nadelen',
  'Everything you need to know about': 'Alles wat je moet weten over',
  '2025': '2025'
};

function translateMetaText(text) {
  let translated = text;

  // Simple word replacements for common meta tag phrases
  Object.keys(META_TRANSLATIONS).forEach(en => {
    const nl = META_TRANSLATIONS[en];
    translated = translated.replace(new RegExp(en, 'gi'), nl);
  });

  return translated;
}

function createNLCompanionPage(sourceFile) {
  const sourcePath = path.join(COMPANIONS_DIR, sourceFile);
  const destPath = path.join(NL_COMPANIONS_DIR, sourceFile);

  // Read the English HTML file
  const html = fs.readFileSync(sourcePath, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // 1. Update <html lang="en"> to <html lang="nl">
  const htmlElement = document.querySelector('html');
  if (htmlElement) {
    htmlElement.setAttribute('lang', 'nl');
  }

  // 2. Update canonical URL to point to /nl/companions/
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    const currentHref = canonicalLink.getAttribute('href');
    const nlHref = currentHref.replace('/companions/', '/nl/companions/');
    canonicalLink.setAttribute('href', nlHref);
  } else {
    // Create canonical if it doesn't exist
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    const slug = sourceFile.replace('.html', '');
    canonicalLink.setAttribute('href', `https://companionguide.ai/nl/companions/${slug}`);
    document.head.appendChild(canonicalLink);
  }

  // 3. Add hreflang tags
  // Remove existing hreflang tags first
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => link.remove());

  const slug = sourceFile.replace('.html', '');

  // Add English hreflang
  const hreflangEN = document.createElement('link');
  hreflangEN.setAttribute('rel', 'alternate');
  hreflangEN.setAttribute('hreflang', 'en');
  hreflangEN.setAttribute('href', `https://companionguide.ai/companions/${slug}`);
  document.head.appendChild(hreflangEN);

  // Add Dutch hreflang
  const hreflangNL = document.createElement('link');
  hreflangNL.setAttribute('rel', 'alternate');
  hreflangNL.setAttribute('hreflang', 'nl');
  hreflangNL.setAttribute('href', `https://companionguide.ai/nl/companions/${slug}`);
  document.head.appendChild(hreflangNL);

  // Add x-default hreflang (pointing to English)
  const hreflangDefault = document.createElement('link');
  hreflangDefault.setAttribute('rel', 'alternate');
  hreflangDefault.setAttribute('hreflang', 'x-default');
  hreflangDefault.setAttribute('href', `https://companionguide.ai/companions/${slug}`);
  document.head.appendChild(hreflangDefault);

  // 4. Update Open Graph URLs to /nl/ version
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) {
    const currentUrl = ogUrl.getAttribute('content');
    ogUrl.setAttribute('content', currentUrl.replace('/companions/', '/nl/companions/'));
  }

  const twitterUrl = document.querySelector('meta[property="twitter:url"]');
  if (twitterUrl) {
    const currentUrl = twitterUrl.getAttribute('content');
    twitterUrl.setAttribute('content', currentUrl.replace('/companions/', '/nl/companions/'));
  }

  // 5. Update schema.org URL
  const schemaScript = document.querySelector('script[type="application/ld+json"]');
  if (schemaScript) {
    try {
      const schema = JSON.parse(schemaScript.textContent);
      if (schema.url) {
        schema.url = schema.url.replace('/companions/', '/nl/companions/');
        schemaScript.textContent = JSON.stringify(schema, null, 2);
      }
    } catch (e) {
      console.error(`Error updating schema for ${sourceFile}:`, e.message);
    }
  }

  // 6. Fix all relative CSS/JS paths to absolute paths
  // Update stylesheet links
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('../')) {
      // Convert ../style.css to /style.css
      link.setAttribute('href', href.replace(/^\.\.\//, '/'));
    }
  });

  // Update script src paths
  document.querySelectorAll('script[src]').forEach(script => {
    const src = script.getAttribute('src');
    if (src && src.startsWith('../')) {
      // Convert ../js/something.js to /js/something.js
      script.setAttribute('src', src.replace(/^\.\.\//, '/'));
    }
  });

  // Update image paths (logos, etc)
  document.querySelectorAll('img[src]').forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('../images/')) {
      // Convert ../images/logo.svg to /images/logo.svg
      img.setAttribute('src', src.replace(/^\.\.\//, '/'));
    }
  });

  // Save the Dutch version
  fs.writeFileSync(destPath, dom.serialize(), 'utf-8');

  console.log(`✅ Created: /nl/companions/${sourceFile}`);
}

function main() {
  console.log('\n🌍 Creating Dutch companion pages...\n');

  // Create /nl/companions/ directory if it doesn't exist
  if (!fs.existsSync(NL_COMPANIONS_DIR)) {
    fs.mkdirSync(NL_COMPANIONS_DIR, { recursive: true });
    console.log('📁 Created directory: /nl/companions/\n');
  }

  // Get all HTML files from /companions/
  const files = fs.readdirSync(COMPANIONS_DIR);
  const htmlFiles = files.filter(file => file.endsWith('.html'));

  console.log(`📄 Found ${htmlFiles.length} companion pages to process\n`);

  // Process each file
  htmlFiles.forEach(file => {
    createNLCompanionPage(file);
  });

  console.log(`\n✅ Done! Created ${htmlFiles.length} Dutch companion pages in /nl/companions/`);
  console.log(`\n🔗 URLs will be:`);
  console.log(`   English: https://companionguide.ai/companions/[slug]`);
  console.log(`   Dutch:   https://companionguide.ai/nl/companions/[slug]`);
  console.log(`\n📌 Next steps:`);
  console.log(`   1. Update JavaScript to detect /nl/ path (i18n.js, companion-header.js, alternatives.js)`);
  console.log(`   2. Test a Dutch page: http://localhost:8888/nl/companions/character-ai`);
}

main();
