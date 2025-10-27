const fs = require('fs');
const path = require('path');

/**
 * Fix 404 errors by creating _redirects entries
 *
 * Issues found:
 * 1. /companions/replika-ai should redirect to /companions/replika
 * 2. All /news/ pages (NL/PT) should redirect to /news (main page)
 *    OR we need to create these pages
 */

const redirects = [
  // Fix replika-ai URLs (EN, NL, PT)
  '/companions/replika-ai /companions/replika 301',
  '/nl/companions/replika-ai /nl/companions/replika 301',
  '/pt/companions/replika-ai /pt/companions/replika 301',

  // Redirect all missing news article URLs to main news page
  // EN news articles
  '/news/women-ai-boyfriends-chatgpt-upgrade /news 301',

  // NL news articles
  '/nl/news/* /nl/news 301',

  // PT news articles
  '/pt/news/* /pt/news 301'
];

// Read existing _redirects file
const redirectsPath = path.join(__dirname, '..', '_redirects');
let existingRedirects = '';

if (fs.existsSync(redirectsPath)) {
  existingRedirects = fs.readFileSync(redirectsPath, 'utf8');
  console.log('✅ Found existing _redirects file\n');
} else {
  console.log('⚠️  No existing _redirects file found, creating new one\n');
}

// Check which redirects already exist
const newRedirects = [];
for (const redirect of redirects) {
  const redirectPath = redirect.split(' ')[0];
  if (!existingRedirects.includes(redirectPath)) {
    newRedirects.push(redirect);
  } else {
    console.log(`⏭️  Redirect already exists: ${redirectPath}`);
  }
}

if (newRedirects.length === 0) {
  console.log('\n✅ All redirects already exist!');
  process.exit(0);
}

// Add new redirects
console.log(`\n📝 Adding ${newRedirects.length} new redirects:\n`);
newRedirects.forEach(r => console.log(`   ${r}`));

const updatedRedirects = existingRedirects + '\n' + newRedirects.join('\n') + '\n';

// Write updated _redirects file
fs.writeFileSync(redirectsPath, updatedRedirects);

console.log('\n✅ Updated _redirects file!');
console.log(`\nTotal redirects added: ${newRedirects.length}`);
