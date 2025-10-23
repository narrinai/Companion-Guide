#!/usr/bin/env node

/**
 * Create NL and PT category pages from English category pages
 * Creates /nl/categories/ and /pt/categories/ directories
 */

const fs = require('fs');
const path = require('path');

// Directories
const categoriesDir = path.join(__dirname, '..', 'categories');
const nlCategoriesDir = path.join(__dirname, '..', 'nl', 'categories');
const ptCategoriesDir = path.join(__dirname, '..', 'pt', 'categories');

// Ensure directories exist
[nlCategoriesDir, ptCategoriesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✅ Created ${path.basename(path.dirname(dir))}/${path.basename(dir)}/ directory`);
  }
});

/**
 * Convert English HTML to NL HTML
 */
function convertEnToNl(htmlContent, filename) {
  let content = htmlContent;

  // 1. Update <html lang="en"> to <html lang="nl">
  content = content.replace(/<html lang="en">/g, '<html lang="nl">');

  // 2. Add /nl/ to canonical URL
  content = content.replace(
    /(<link rel="canonical" href="https:\/\/companionguide\.ai\/categories\/)/g,
    '$1'.replace('/categories/', '/nl/categories/')
  );
  content = content.replace(
    /(<link rel="canonical" href="https:\/\/companionguide\.ai)\/categories\//g,
    '$1/nl/categories/'
  );

  // 3. Add hreflang tags for EN and NL
  const categorySlug = filename.replace('.html', '');
  const hreflangTags = `
    <link rel="alternate" hreflang="en" href="https://companionguide.ai/categories/${categorySlug}">
    <link rel="alternate" hreflang="nl" href="https://companionguide.ai/nl/categories/${categorySlug}">
    <link rel="alternate" hreflang="pt" href="https://companionguide.ai/pt/categories/${categorySlug}">
    <link rel="alternate" hreflang="x-default" href="https://companionguide.ai/categories/${categorySlug}">`;

  // Insert hreflang after canonical or before first meta tag
  if (content.includes('<link rel="canonical"')) {
    content = content.replace(
      /(<link rel="canonical"[^>]*>)/,
      `$1${hreflangTags}`
    );
  } else {
    content = content.replace(
      /(<meta name="viewport"[^>]*>)/,
      `$1${hreflangTags}`
    );
  }

  // 4. Update Open Graph URLs
  content = content.replace(
    /(property="og:url" content="https:\/\/companionguide\.ai)\/categories\//g,
    '$1/nl/categories/'
  );

  // 5. Update Twitter URLs
  content = content.replace(
    /(property="twitter:url" content="https:\/\/companionguide\.ai)\/categories\//g,
    '$1/nl/categories/'
  );

  // 6. Add og:locale
  if (content.includes('<meta property="og:type"')) {
    content = content.replace(
      /(<meta property="og:type"[^>]*>)/,
      '$1\n    <meta property="og:locale" content="nl_NL">\n    <meta property="og:locale:alternate" content="en_US">'
    );
  }

  // 7. Update internal navigation links to point to /nl/ pages
  content = content.replace(/href="\//g, 'href="/nl/');
  // But keep external links and anchors as-is
  content = content.replace(/href="\/nl\/#/g, 'href="/#');
  content = content.replace(/href="\/nl\/https:/g, 'href="https:');
  content = content.replace(/href="\/nl\/http:/g, 'href="http:');

  // 8. Fix asset paths (CSS, JS, images should stay at root)
  content = content.replace(/href="\/nl\/style\.css/g, 'href="/style.css');
  content = content.replace(/href="\/nl\/cookie-banner\.css/g, 'href="/cookie-banner.css');
  content = content.replace(/src="\/nl\/script\.js/g, 'src="/script.js');
  content = content.replace(/src="\/nl\/js\//g, 'src="/js/');
  content = content.replace(/src="\/nl\/images\//g, 'src="/images/');
  content = content.replace(/href="\/nl\/images\//g, 'href="/images/');
  content = content.replace(/href="\/nl\/favicon/g, 'href="/favicon');

  return content;
}

/**
 * Convert English HTML to PT HTML
 */
function convertEnToPt(htmlContent, filename) {
  let content = htmlContent;

  // 1. Update <html lang="en"> to <html lang="pt">
  content = content.replace(/<html lang="en">/g, '<html lang="pt">');

  // 2. Add /pt/ to canonical URL
  content = content.replace(
    /(<link rel="canonical" href="https:\/\/companionguide\.ai)\/categories\//g,
    '$1/pt/categories/'
  );

  // 3. Add hreflang tags
  const categorySlug = filename.replace('.html', '');
  const hreflangTags = `
    <link rel="alternate" hreflang="en" href="https://companionguide.ai/categories/${categorySlug}">
    <link rel="alternate" hreflang="nl" href="https://companionguide.ai/nl/categories/${categorySlug}">
    <link rel="alternate" hreflang="pt" href="https://companionguide.ai/pt/categories/${categorySlug}">
    <link rel="alternate" hreflang="x-default" href="https://companionguide.ai/categories/${categorySlug}">`;

  if (content.includes('<link rel="canonical"')) {
    content = content.replace(
      /(<link rel="canonical"[^>]*>)/,
      `$1${hreflangTags}`
    );
  } else {
    content = content.replace(
      /(<meta name="viewport"[^>]*>)/,
      `$1${hreflangTags}`
    );
  }

  // 4. Update Open Graph URLs
  content = content.replace(
    /(property="og:url" content="https:\/\/companionguide\.ai)\/categories\//g,
    '$1/pt/categories/'
  );

  // 5. Update Twitter URLs
  content = content.replace(
    /(property="twitter:url" content="https:\/\/companionguide\.ai)\/categories\//g,
    '$1/pt/categories/'
  );

  // 6. Add og:locale
  if (content.includes('<meta property="og:type"')) {
    content = content.replace(
      /(<meta property="og:type"[^>]*>)/,
      '$1\n    <meta property="og:locale" content="pt_BR">\n    <meta property="og:locale:alternate" content="en_US">'
    );
  }

  // 7. Update internal navigation links
  content = content.replace(/href="\//g, 'href="/pt/');
  content = content.replace(/href="\/pt\/#/g, 'href="/#');
  content = content.replace(/href="\/pt\/https:/g, 'href="https:');
  content = content.replace(/href="\/pt\/http:/g, 'href="http:');

  // 8. Fix asset paths
  content = content.replace(/href="\/pt\/style\.css/g, 'href="/style.css');
  content = content.replace(/href="\/pt\/cookie-banner\.css/g, 'href="/cookie-banner.css');
  content = content.replace(/src="\/pt\/script\.js/g, 'src="/script.js');
  content = content.replace(/src="\/pt\/js\//g, 'src="/js/');
  content = content.replace(/src="\/pt\/images\//g, 'src="/images/');
  content = content.replace(/href="\/pt\/images\//g, 'href="/images/');
  content = content.replace(/href="\/pt\/favicon/g, 'href="/favicon');

  return content;
}

// Main execution
console.log('🚀 Creating NL and PT category pages...\n');

let nlCount = 0;
let ptCount = 0;

try {
  const categoryFiles = fs.readdirSync(categoriesDir)
    .filter(file => file.endsWith('.html'));

  console.log(`Found ${categoryFiles.length} category pages to convert\n`);

  for (const filename of categoryFiles) {
    const enPath = path.join(categoriesDir, filename);
    const enContent = fs.readFileSync(enPath, 'utf-8');

    // Create NL version
    const nlContent = convertEnToNl(enContent, filename);
    const nlPath = path.join(nlCategoriesDir, filename);
    fs.writeFileSync(nlPath, nlContent, 'utf-8');
    nlCount++;
    console.log(`✅ NL: ${filename}`);

    // Create PT version
    const ptContent = convertEnToPt(enContent, filename);
    const ptPath = path.join(ptCategoriesDir, filename);
    fs.writeFileSync(ptPath, ptContent, 'utf-8');
    ptCount++;
    console.log(`✅ PT: ${filename}`);
  }

  console.log('\n✅ All category pages created successfully!');
  console.log(`\nCreated:`);
  console.log(`  - ${nlCount} NL category pages in /nl/categories/`);
  console.log(`  - ${ptCount} PT category pages in /pt/categories/`);

} catch (error) {
  console.error('❌ Error creating category pages:', error);
  process.exit(1);
}
