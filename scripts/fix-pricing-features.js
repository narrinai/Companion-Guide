#!/usr/bin/env node

/**
 * Fix pricing features in companion pages
 * 1. Remove ❌ and ✅ emoji's from feature text
 * 2. Add class="feature-excluded" to features with ❌
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

  // Find all <li> tags within pricing-tier sections and fix them
  // Pattern: <li>❌ Feature Text</li> or <li>✅ Feature Text</li>

  // Fix 1: Add class="feature-excluded" to <li> with ❌ and remove the ❌
  const excludedPattern = /<li>(❌\s*)([^<]+)<\/li>/g;
  content = content.replace(excludedPattern, (match, emoji, text) => {
    changeCount++;
    return `<li class="feature-excluded">${text.trim()}</li>`;
  });

  // Fix 2: Remove ✅ from <li> tags (CSS will add ✓)
  const includedPattern = /<li>(✅\s*)([^<]+)<\/li>/g;
  content = content.replace(includedPattern, (match, emoji, text) => {
    changeCount++;
    return `<li>${text.trim()}</li>`;
  });

  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${path.basename(filePath)}: ${changeCount} features`);
  } else {
    console.log(`✓ ${path.basename(filePath)}: already up to date`);
  }

  return changeCount;
}

console.log('🚀 Fixing pricing features in all companion pages...\n');

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

console.log(`\n✅ Done! Fixed ${totalFixed} features across ${totalFiles} companion pages`);
