#!/usr/bin/env node

/**
 * Check translation coverage for key pages
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking translation coverage for key pages...\n');

const keyPages = [
  { name: 'Homepage', paths: ['index.html', 'nl/index.html', 'pt/index.html'] },
  { name: 'Companions', paths: ['companions.html', 'nl/companions.html', 'pt/companions.html'] },
  { name: 'Categories', paths: ['categories.html', 'nl/categories.html', 'pt/categories.html'] },
  { name: 'News', paths: ['news.html', 'nl/news.html', 'pt/news.html'] },
  { name: 'Deals', paths: ['deals.html', 'nl/deals.html', 'pt/deals.html'] },
  { name: 'Contact', paths: ['contact.html', 'nl/contact.html', 'pt/contact.html'] },
  { name: 'Companions A-Z', paths: ['companions-az.html', 'nl/companions-az.html', 'pt/companions-az.html'] }
];

function checkFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    return {
      exists: false,
      hasI18nScript: false,
      hasDutchText: false,
      hasDataI18n: false,
      dutchWords: []
    };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  // Check for i18n.js script
  const hasI18nScript = content.includes('/js/i18n.js') || content.includes('window.i18n');

  // Check for data-i18n attributes
  const hasDataI18n = content.includes('data-i18n=');

  // Common Dutch words that shouldn't appear in PT pages
  const dutchWords = [];
  const dutchPatterns = [
    /\bBlijf op de hoogte\b/gi,
    /\bVind AI companion platforms\b/gi,
    /\bOntdek AI Platforms\b/gi,
    /\bVeelgestelde vragen\b/gi,
    /\bLaatste Nieuws\b/gi,
    /\bHoe kies ik\b/gi,
    /\bWat zijn de best\b/gi,
    /\bWelke AI\b/gi,
    /\bHoe werken\b/gi
  ];

  dutchPatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      dutchWords.push(...matches);
    }
  });

  return {
    exists: true,
    hasI18nScript,
    hasDataI18n,
    hasDutchText: dutchWords.length > 0,
    dutchWords: [...new Set(dutchWords)]
  };
}

const results = {};

keyPages.forEach(({ name, paths }) => {
  console.log(`\n📄 ${name}`);
  console.log('='.repeat(60));

  results[name] = {};

  paths.forEach(filePath => {
    const lang = filePath.startsWith('nl/') ? 'NL' :
                 filePath.startsWith('pt/') ? 'PT' : 'EN';

    const check = checkFile(filePath);
    results[name][lang] = check;

    if (!check.exists) {
      console.log(`❌ ${lang}: File not found - ${filePath}`);
      return;
    }

    // Status indicators
    const i18nStatus = check.hasI18nScript ? '✅' : '❌';
    const dataI18nStatus = check.hasDataI18n ? '✅' : '⚠️';
    const textStatus = check.hasDutchText ? '❌' : '✅';

    console.log(`\n${lang} (${filePath}):`);
    console.log(`  i18n.js loaded: ${i18nStatus}`);
    console.log(`  data-i18n attrs: ${dataI18nStatus}`);

    if (lang === 'PT' && check.hasDutchText) {
      console.log(`  Dutch text: ${textStatus} FOUND ${check.dutchWords.length} Dutch words!`);
      check.dutchWords.forEach(word => {
        console.log(`    - "${word}"`);
      });
    } else if (lang === 'PT') {
      console.log(`  Dutch text: ${textStatus} Clean`);
    }
  });
});

// Summary
console.log('\n\n📊 SUMMARY');
console.log('='.repeat(60));

let totalIssues = 0;

Object.entries(results).forEach(([pageName, langs]) => {
  const issues = [];

  if (langs.PT && langs.PT.hasDutchText) {
    issues.push(`PT has Dutch text (${langs.PT.dutchWords.length} words)`);
    totalIssues++;
  }

  if (langs.PT && !langs.PT.hasI18nScript) {
    issues.push('PT missing i18n.js');
    totalIssues++;
  }

  if (langs.NL && !langs.NL.hasI18nScript) {
    issues.push('NL missing i18n.js');
    totalIssues++;
  }

  if (issues.length > 0) {
    console.log(`\n⚠️  ${pageName}:`);
    issues.forEach(issue => console.log(`   - ${issue}`));
  } else {
    console.log(`\n✅ ${pageName}: All good`);
  }
});

console.log(`\n\nTotal issues found: ${totalIssues}`);

if (totalIssues === 0) {
  console.log('🎉 All key pages are properly translated!');
} else {
  console.log('⚠️  Some pages need attention.');
}
