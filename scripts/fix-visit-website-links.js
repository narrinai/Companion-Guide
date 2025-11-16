#!/usr/bin/env node

/**
 * Fix Visit Website links across all companion pages
 * 1. Add data-i18n attribute to all pricing-cta links
 * 2. Change pricing-cta class to text-link style for pricing tiers
 */

const fs = require('fs');
const path = require('path');

const COMPANION_DIRS = [
  'companions',
  'nl/companions',
  'pt/companions',
  'de/companions'
];

function fixCompanionPage(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;

  // Fix 1: Add data-i18n to pricing-cta links that don't have it
  // Match: <a href="..." class="pricing-cta" target="_blank">Visit Website →</a>
  // Replace with: <a href="..." class="pricing-cta" target="_blank" data-i18n="companionCard.visitWebsite">Visit Website</a>

  const pricingCtaPattern = /<a\s+href="([^"]+)"\s+class="pricing-cta"\s+target="_blank"(?!\s+data-i18n)>Visit Website\s*→?<\/a>/g;

  const newContent = content.replace(pricingCtaPattern, (match, url) => {
    changeCount++;
    return `<a href="${url}" class="pricing-cta" target="_blank" data-i18n="companionCard.visitWebsite">Visit Website</a>`;
  });

  if (changeCount > 0) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fixed ${path.basename(filePath)}: ${changeCount} links updated`);
  } else {
    console.log(`✓ ${path.basename(filePath)}: already up to date`);
  }

  return changeCount;
}

console.log('🚀 Fixing Visit Website links in all companion pages...\n');

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
      const changes = fixCompanionPage(path.join(dirPath, file));
      totalFixed += changes;
      totalFiles++;
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  });
});

console.log(`\n✅ Done! Updated ${totalFixed} links across ${totalFiles} companion pages`);
