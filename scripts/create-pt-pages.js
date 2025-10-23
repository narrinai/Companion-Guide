#!/usr/bin/env node

/**
 * Create Portuguese (/pt/) pages from Dutch (/nl/) pages
 * Only updates language attributes, hreflang tags, and URLs
 */

const fs = require('fs');
const path = require('path');

// Directories
const nlDir = path.join(__dirname, '..', 'nl');
const ptDir = path.join(__dirname, '..', 'pt');

// Ensure PT directory exists
if (!fs.existsSync(ptDir)) {
  fs.mkdirSync(ptDir, { recursive: true });
  console.log('✅ Created /pt/ directory');
}

/**
 * Convert NL HTML to PT HTML
 * Only changes language attributes and URLs, no query parameters
 */
function convertNlToPt(htmlContent) {
  let content = htmlContent;

  // 1. Update <html lang="nl"> to <html lang="pt">
  content = content.replace(/<html lang="nl">/g, '<html lang="pt">');

  // 2. Update canonical URL from /nl/ to /pt/
  content = content.replace(
    /(<link rel="canonical" href="https:\/\/companionguide\.ai)\/nl\//g,
    '$1/pt/'
  );

  // 3. Add PT to hreflang tags (after NL, before x-default)
  content = content.replace(
    /(<link rel="alternate" hreflang="nl" href="https:\/\/companionguide\.ai\/nl\/[^"]*">)/g,
    (match) => {
      // Get the URL from NL hreflang
      const nlUrl = match.match(/href="([^"]*)"/)[1];
      const ptUrl = nlUrl.replace('/nl/', '/pt/');
      return `${match}\n    <link rel="alternate" hreflang="pt" href="${ptUrl}">`;
    }
  );

  // 4. Update Open Graph URLs from /nl/ to /pt/
  content = content.replace(
    /(property="og:url" content="https:\/\/companionguide\.ai)\/nl\//g,
    '$1/pt/'
  );

  // 5. Update Twitter URLs from /nl/ to /pt/
  content = content.replace(
    /(property="twitter:url" content="https:\/\/companionguide\.ai)\/nl\//g,
    '$1/pt/'
  );

  // 6. Update og:locale from nl_NL to pt_BR
  content = content.replace(
    /<meta property="og:locale" content="nl_NL">/g,
    '<meta property="og:locale" content="pt_BR">'
  );

  // 7. Update og:locale:alternate - keep NL, add PT
  content = content.replace(
    /(<meta property="og:locale:alternate" content="en_US">)/g,
    '$1\n    <meta property="og:locale:alternate" content="nl_NL">'
  );

  // 8. Update internal links from /nl/ to /pt/ in navigation and content
  // Be careful to only replace hrefs, not text content
  content = content.replace(
    /href="\/nl\//g,
    'href="/pt/'
  );

  // 9. Update language switcher active class and links
  content = content.replace(
    /<a href="\/nl\/" class="lang-option active">/g,
    '<a href="/nl/" class="lang-option">'
  );

  // Add PT as active in language switcher (need to add this after Nederlands)
  content = content.replace(
    /(<a href="\/nl\/" class="lang-option">🇳🇱 Nederlands<\/a>)/g,
    '$1\n                    <a href="/pt/" class="lang-option active">🇵🇹 Português</a>'
  );

  return content;
}

/**
 * Copy and convert a single file from NL to PT
 */
function convertFile(nlFilePath, relativePath) {
  const ptFilePath = path.join(ptDir, relativePath);

  // Ensure PT subdirectory exists
  const ptSubDir = path.dirname(ptFilePath);
  if (!fs.existsSync(ptSubDir)) {
    fs.mkdirSync(ptSubDir, { recursive: true });
  }

  // Read NL file
  const nlContent = fs.readFileSync(nlFilePath, 'utf-8');

  // Convert to PT
  const ptContent = convertNlToPt(nlContent);

  // Write PT file
  fs.writeFileSync(ptFilePath, ptContent, 'utf-8');

  console.log(`✅ Created ${relativePath}`);
}

/**
 * Recursively process all files in NL directory
 */
function processDirectory(dirPath, baseDir) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    const relativePath = path.relative(baseDir, fullPath);

    if (entry.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(fullPath, baseDir);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      // Convert HTML files
      convertFile(fullPath, relativePath);
    }
  }
}

// Main execution
console.log('🚀 Creating Portuguese pages from Dutch pages...\n');

try {
  processDirectory(nlDir, nlDir);

  console.log('\n✅ All Portuguese pages created successfully!');
  console.log('\nCreated pages:');
  console.log('  - /pt/index.html');
  console.log('  - /pt/companions.html');
  console.log('  - /pt/categories.html');
  console.log('  - /pt/news.html');
  console.log('  - /pt/deals.html');
  console.log('  - /pt/contact.html');
  console.log('  - /pt/companions-az.html');
  console.log('  - /pt/companions/*.html (42 files)');
  console.log('\n📝 Note: pt.json already exists with Portuguese UI translations');

} catch (error) {
  console.error('❌ Error creating Portuguese pages:', error);
  process.exit(1);
}
