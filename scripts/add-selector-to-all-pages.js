#!/usr/bin/env node

/**
 * Add language selector to ALL multilingual pages
 * Including companion pages and category pages
 */

const fs = require('fs');
const path = require('path');

// Get all companion files
const companionsDir = path.join(__dirname, '..', 'companions');
const companionFiles = fs.readdirSync(companionsDir)
  .filter(f => f.endsWith('.html'))
  .map(f => f.replace('.html', ''));

// Get all category files (excluding backups)
const categoriesDir = path.join(__dirname, '..', 'categories');
const categoryFiles = fs.readdirSync(categoriesDir)
  .filter(f => f.endsWith('.html') && !f.includes('backup'))
  .map(f => f.replace('.html', ''));

console.log(`Found ${companionFiles.length} companion pages`);
console.log(`Found ${categoryFiles.length} category pages\n`);

/**
 * Generate language selector HTML
 */
function generateLanguageSelectorHTML(lang, type, slug) {
  const flags = { en: '🇬🇧 EN', nl: '🇳🇱 NL', pt: '🇧🇷 PT' };
  const currentFlag = flags[lang];

  // Build URLs based on page type
  const enUrl = `/${type}/${slug}`;
  const nlUrl = `/nl/${type}/${slug}`;
  const ptUrl = `/pt/${type}/${slug}`;

  const enActive = lang === 'en' ? ' active' : '';
  const nlActive = lang === 'nl' ? ' active' : '';
  const ptActive = lang === 'pt' ? ' active' : '';

  const selector = '\n            <!-- Language Switcher -->\n' +
    '            <div class="language-switcher">\n' +
    '                <button id="lang-toggle" class="lang-current">\n' +
    '                    ' + currentFlag + '\n' +
    '                </button>\n' +
    '                <div class="lang-dropdown" id="lang-dropdown" style="display: none;">\n' +
    '                    <a href="' + enUrl + '" class="lang-option' + enActive + '">🇬🇧 English</a>\n' +
    '                    <a href="' + nlUrl + '" class="lang-option' + nlActive + '">🇳🇱 Nederlands</a>\n' +
    '                    <a href="' + ptUrl + '" class="lang-option' + ptActive + '">🇧🇷 Português</a>\n' +
    '                </div>\n' +
    '            </div>';

  return selector;
}

/**
 * Add selector to a file
 */
function addSelector(filePath, lang, type, slug) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Skip if already has selector
  if (content.includes('language-switcher') || content.includes('lang-toggle')) {
    return false;
  }

  // Find nav closing
  const navMenuClosing = content.indexOf('</ul>', content.indexOf('nav-menu'));
  if (navMenuClosing === -1) return false;

  const navClosing = content.indexOf('</nav>', navMenuClosing);
  if (navClosing === -1) return false;

  // Generate and insert selector
  const selector = generateLanguageSelectorHTML(lang, type, slug);
  content = content.slice(0, navClosing) + selector + '\n        ' + content.slice(navClosing);

  fs.writeFileSync(filePath, content, 'utf-8');
  return true;
}

// Process all pages
let totalUpdated = 0;

console.log('🔄 Processing companion pages...\n');

// English companions
console.log('📄 English companions:');
let enCount = 0;
companionFiles.forEach(slug => {
  if (addSelector(`companions/${slug}.html`, 'en', 'companions', slug)) {
    enCount++;
  }
});
console.log(`✅ Updated ${enCount} English companion pages`);
totalUpdated += enCount;

// Dutch companions
console.log('\n📄 Nederlands companions:');
let nlCount = 0;
companionFiles.forEach(slug => {
  if (addSelector(`nl/companions/${slug}.html`, 'nl', 'companions', slug)) {
    nlCount++;
  }
});
console.log(`✅ Updated ${nlCount} Nederlands companion pages`);
totalUpdated += nlCount;

// Portuguese companions
console.log('\n📄 Português companions:');
let ptCount = 0;
companionFiles.forEach(slug => {
  if (addSelector(`pt/companions/${slug}.html`, 'pt', 'companions', slug)) {
    ptCount++;
  }
});
console.log(`✅ Updated ${ptCount} Português companion pages`);
totalUpdated += ptCount;

console.log('\n🔄 Processing category pages...\n');

// English categories
console.log('📄 English categories:');
let enCatCount = 0;
categoryFiles.forEach(slug => {
  if (addSelector(`categories/${slug}.html`, 'en', 'categories', slug)) {
    enCatCount++;
  }
});
console.log(`✅ Updated ${enCatCount} English category pages`);
totalUpdated += enCatCount;

// Dutch categories
console.log('\n📄 Nederlands categories:');
let nlCatCount = 0;
categoryFiles.forEach(slug => {
  if (addSelector(`nl/categories/${slug}.html`, 'nl', 'categories', slug)) {
    nlCatCount++;
  }
});
console.log(`✅ Updated ${nlCatCount} Nederlands category pages`);
totalUpdated += nlCatCount;

// Portuguese categories
console.log('\n📄 Português categories:');
let ptCatCount = 0;
categoryFiles.forEach(slug => {
  if (addSelector(`pt/categories/${slug}.html`, 'pt', 'categories', slug)) {
    ptCatCount++;
  }
});
console.log(`✅ Updated ${ptCatCount} Português category pages`);
totalUpdated += ptCatCount;

console.log(`\n✅ Total updated: ${totalUpdated} pages`);
console.log('\n📊 Summary:');
console.log(`   - Companion pages: ${enCount + nlCount + ptCount} (${enCount} EN + ${nlCount} NL + ${ptCount} PT)`);
console.log(`   - Category pages: ${enCatCount + nlCatCount + ptCatCount} (${enCatCount} EN + ${nlCatCount} NL + ${ptCatCount} PT)`);
