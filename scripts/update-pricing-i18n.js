#!/usr/bin/env node

/**
 * Update pricing periods and links in all companion pages
 * 1. Add data-i18n attributes to period spans
 * 2. Ensure Visit Website links have data-i18n attributes
 */

const fs = require('fs');
const path = require('path');

const COMPANION_DIRS = [
  'companions',
  'nl/companions',
  'pt/companions',
  'de/companions'
];

function updateCompanionPage(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;

  // Fix 1: Add data-i18n to period spans for /month
  // Match: <span class="period">/month</span> or /monthly
  const monthPattern = /<span class="period">\/month(ly)?<\/span>/g;
  content = content.replace(monthPattern, (match) => {
    changeCount++;
    return '<span class="period" data-i18n="pricing.perMonth">/month</span>';
  });

  // Fix 2: Add data-i18n to period spans for /year
  const yearPattern = /<span class="period">\/year(ly)?<\/span>/g;
  content = content.replace(yearPattern, (match) => {
    changeCount++;
    return '<span class="period" data-i18n="pricing.perYear">/year</span>';
  });

  // Fix 3: Update period text that's not in span tags yet
  // Match: <div class="price">$X.XX /month</div>
  const priceMonthPattern = /(<div class="price">[^<]+)\s+\/month(ly)?(<\/div>)/g;
  content = content.replace(priceMonthPattern, (match, before, ly, after) => {
    changeCount++;
    return `${before} <span class="period" data-i18n="pricing.perMonth">/month</span>${after}`;
  });

  const priceYearPattern = /(<div class="price">[^<]+)\s+\/year(ly)?(<\/div>)/g;
  content = content.replace(priceYearPattern, (match, before, ly, after) => {
    changeCount++;
    return `${before} <span class="period" data-i18n="pricing.perYear">/year</span>${after}`;
  });

  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${path.basename(filePath)}: ${changeCount} changes`);
  } else {
    console.log(`✓ ${path.basename(filePath)}: already up to date`);
  }

  return changeCount;
}

console.log('🚀 Updating pricing i18n in all companion pages...\n');

let totalFixed = 0;
let totalFiles = 0;

COMPANION_DIRS.forEach(dir => {
  const dirPath = path.join(process.cwd(), dir);

  if (!fs.existsSync(dirPath)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.html'));
  console.log(`\nProcessing ${dir}/ (${files.length} files):`);

  files.forEach(file => {
    try {
      const changes = updateCompanionPage(path.join(dirPath, file));
      totalFixed += changes;
      totalFiles++;
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  });
});

console.log(`\n✅ Done! Updated ${totalFixed} pricing elements across ${totalFiles} companion pages`);
