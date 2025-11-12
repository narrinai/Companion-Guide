#!/usr/bin/env node

/**
 * Create German language pages in /de/
 * - Copy key HTML files from root to /de/
 * - Update meta tags (lang, title, description)
 * - Add canonical and hreflang tags
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const ROOT_DIR = path.join(__dirname, '..');
const DE_DIR = path.join(ROOT_DIR, 'de');

// Files to copy from root
const ROOT_FILES = [
  'index.html',
  'companions.html',
  'categories.html',
  'news.html',
  'deals.html',
  'contact.html'
];

// Create de directory if it doesn't exist
if (!fs.existsSync(DE_DIR)) {
  fs.mkdirSync(DE_DIR, { recursive: true });
  console.log('✅ Created /de directory');
}

function createDEPage(filename) {
  const sourcePath = path.join(ROOT_DIR, filename);
  const destPath = path.join(DE_DIR, filename);

  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  Source file not found: ${filename}`);
    return;
  }

  // Read the English HTML file
  const html = fs.readFileSync(sourcePath, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // 1. Update <html lang="en"> to <html lang="de">
  const htmlElement = document.querySelector('html');
  if (htmlElement) {
    htmlElement.setAttribute('lang', 'de');
  }

  // 2. Update canonical URL to point to /de/
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    const currentHref = canonicalLink.getAttribute('href');
    let deHref = currentHref;

    // Handle different URL structures
    if (filename === 'index.html') {
      deHref = 'https://companionguide.ai/de';
    } else {
      const page = filename.replace('.html', '');
      deHref = `https://companionguide.ai/de/${page}`;
    }

    canonicalLink.setAttribute('href', deHref);
  } else {
    // Create canonical if it doesn't exist
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');

    if (filename === 'index.html') {
      canonicalLink.setAttribute('href', 'https://companionguide.ai/de');
    } else {
      const page = filename.replace('.html', '');
      canonicalLink.setAttribute('href', `https://companionguide.ai/de/${page}`);
    }

    document.head.appendChild(canonicalLink);
  }

  // 3. Add hreflang tags
  // Remove existing hreflang tags first
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => link.remove());

  const page = filename === 'index.html' ? '' : filename.replace('.html', '');

  // Add English hreflang
  const hreflangEN = document.createElement('link');
  hreflangEN.setAttribute('rel', 'alternate');
  hreflangEN.setAttribute('hreflang', 'en');
  hreflangEN.setAttribute('href', `https://companionguide.ai/${page}`);
  document.head.appendChild(hreflangEN);

  // Add Dutch hreflang
  const hreflangNL = document.createElement('link');
  hreflangNL.setAttribute('rel', 'alternate');
  hreflangNL.setAttribute('hreflang', 'nl');
  hreflangNL.setAttribute('href', `https://companionguide.ai/nl/${page}`);
  document.head.appendChild(hreflangNL);

  // Add Portuguese hreflang
  const hreflangPT = document.createElement('link');
  hreflangPT.setAttribute('rel', 'alternate');
  hreflangPT.setAttribute('hreflang', 'pt');
  hreflangPT.setAttribute('href', `https://companionguide.ai/pt/${page}`);
  document.head.appendChild(hreflangPT);

  // Add German hreflang
  const hreflangDE = document.createElement('link');
  hreflangDE.setAttribute('rel', 'alternate');
  hreflangDE.setAttribute('hreflang', 'de');
  hreflangDE.setAttribute('href', `https://companionguide.ai/de/${page}`);
  document.head.appendChild(hreflangDE);

  // Add x-default hreflang (pointing to English)
  const hreflangDefault = document.createElement('link');
  hreflangDefault.setAttribute('rel', 'alternate');
  hreflangDefault.setAttribute('hreflang', 'x-default');
  hreflangDefault.setAttribute('href', `https://companionguide.ai/${page}`);
  document.head.appendChild(hreflangDefault);

  // Write the modified HTML
  fs.writeFileSync(destPath, dom.serialize(), 'utf-8');
  console.log(`✅ Created ${filename}`);
}

// Create all root pages
console.log('🚀 Creating German pages...\n');
ROOT_FILES.forEach(file => createDEPage(file));

// Create companions directory
const DE_COMPANIONS_DIR = path.join(DE_DIR, 'companions');
if (!fs.existsSync(DE_COMPANIONS_DIR)) {
  fs.mkdirSync(DE_COMPANIONS_DIR, { recursive: true });
  console.log('✅ Created /de/companions directory');
}

// Create categories directory
const DE_CATEGORIES_DIR = path.join(DE_DIR, 'categories');
if (!fs.existsSync(DE_CATEGORIES_DIR)) {
  fs.mkdirSync(DE_CATEGORIES_DIR, { recursive: true });
  console.log('✅ Created /de/categories directory');
}

// Create news directory
const DE_NEWS_DIR = path.join(DE_DIR, 'news');
if (!fs.existsSync(DE_NEWS_DIR)) {
  fs.mkdirSync(DE_NEWS_DIR, { recursive: true });
  console.log('✅ Created /de/news directory');
}

console.log('\n✅ All German pages created successfully!');
console.log('Note: Individual companion, category, and news pages need to be generated separately.');
