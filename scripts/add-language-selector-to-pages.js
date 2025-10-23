#!/usr/bin/env node

/**
 * Add language selector to all multilingual key pages
 * Adds both desktop and mobile versions
 */

const fs = require('fs');
const path = require('path');

// Pages that need language selector (have translations)
const pagesNeedingSelector = {
  en: [
    'companions.html',
    'categories.html',
    'news.html',
    'deals.html',
    'contact.html',
    'companions-az.html'
  ],
  nl: [
    'nl/companions.html',
    'nl/categories.html',
    'nl/news.html',
    'nl/deals.html',
    'nl/contact.html',
    'nl/companions-az.html'
  ],
  pt: [
    'pt/companions.html',
    'pt/categories.html',
    'pt/news.html',
    'pt/deals.html',
    'pt/contact.html',
    'pt/companions-az.html'
  ]
};

/**
 * Generate language selector HTML based on current page language and path
 */
function generateLanguageSelectorHTML(lang, pagePath) {
  // Determine the base page name (e.g., 'companions.html', 'categories.html')
  const basePage = pagePath.replace(/^(nl\/|pt\/)/, '');

  // Generate URLs for all languages
  const enUrl = `/${basePage.replace('.html', '')}`;
  const nlUrl = `/nl/${basePage.replace('.html', '')}`;
  const ptUrl = `/pt/${basePage.replace('.html', '')}`;

  const currentFlag = lang === 'en' ? '🇬🇧 EN' : (lang === 'nl' ? '🇳🇱 NL' : '🇧🇷 PT');

  const selector = `
            <!-- Language Switcher -->
            <div class="language-switcher">
                <button id="lang-toggle" class="lang-current">
                    ${currentFlag}
                </button>
                <div class="lang-dropdown" id="lang-dropdown" style="display: none;">
                    <a href="${enUrl}" class="lang-option${lang === 'en' ? ' active' : ''}">🇬🇧 English</a>
                    <a href="${nlUrl}" class="lang-option${lang === 'nl' ? ' active' : ''}">🇳🇱 Nederlands</a>
                    <a href="${ptUrl}" class="lang-option${lang === 'pt' ? ' active' : ''}">🇧🇷 Português</a>
                </div>
            </div>`;

  return selector;
}

/**
 * Add language selector to a page if not already present
 */
function addLanguageSelector(filePath, lang) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Skip if already has language selector
  if (content.includes('language-switcher') || content.includes('lang-toggle')) {
    console.log(`⏭️  Already has selector: ${filePath}`);
    return false;
  }

  // Find the closing </ul> of nav menu
  const navMenuClosing = content.indexOf('</ul>', content.indexOf('nav-menu'));

  if (navMenuClosing === -1) {
    console.log(`❌ Could not find nav menu in: ${filePath}`);
    return false;
  }

  // Get the relative path for URL generation
  const relativePath = filePath.replace(/^\.\//, '');
  const selector = generateLanguageSelectorHTML(lang, relativePath);

  // Insert selector after </ul> and before </nav>
  const insertPosition = content.indexOf('</nav>', navMenuClosing);

  if (insertPosition === -1) {
    console.log(`❌ Could not find </nav> tag in: ${filePath}`);
    return false;
  }

  // Insert the language selector
  content = content.slice(0, insertPosition) + selector + '\n        ' + content.slice(insertPosition);

  // Write back
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Added selector: ${filePath}`);
  return true;
}

// Main execution
console.log('🚀 Adding language selector to multilingual pages...\n');

let totalUpdated = 0;

// Process English pages
console.log('📄 English pages:');
pagesNeedingSelector.en.forEach(page => {
  if (addLanguageSelector(page, 'en')) {
    totalUpdated++;
  }
});

// Process Dutch pages
console.log('\n📄 Nederlands pages:');
pagesNeedingSelector.nl.forEach(page => {
  if (addLanguageSelector(page, 'nl')) {
    totalUpdated++;
  }
});

// Process Portuguese pages
console.log('\n📄 Português pages:');
pagesNeedingSelector.pt.forEach(page => {
  if (addLanguageSelector(page, 'pt')) {
    totalUpdated++;
  }
});

console.log(`\n✅ Updated ${totalUpdated} pages with language selector`);
console.log('\n📝 Note: Language selector includes:');
console.log('   - Desktop version (in nav)');
console.log('   - Correct active state per language');
console.log('   - Links to equivalent page in other languages');
