#!/usr/bin/env node

/**
 * Remove hardcoded pricing labels from companion pages
 * Removes: CURRENT PLAN, BILLED MONTHLY, BEST DEAL, etc.
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

  // Remove all hardcoded pricing label paragraphs like:
  // <p style="color: var(--accent-green); ...">CURRENT PLAN</p>
  // <p style="color: var(--accent-purple); ...">BILLED MONTHLY</p>

  const labelPattern = /<p style="color: var\(--accent-[^)]+\); font-size: 0\.875rem; margin-bottom: var\(--space-4\); font-weight: 600;">[^<]+<\/p>\s*/g;

  const newContent = content.replace(labelPattern, () => {
    changeCount++;
    return '';
  });

  // Also remove strikethrough price lines like:
  // <p style="color: var(--text-muted); font-size: 0.875rem; text-decoration: line-through;">$11.99</p>
  const strikethroughPattern = /<p style="color: var\(--text-muted\); font-size: 0\.875rem; text-decoration: line-through;">\$[^<]+<\/p>\s*/g;

  const finalContent = newContent.replace(strikethroughPattern, () => {
    changeCount++;
    return '';
  });

  if (changeCount > 0) {
    fs.writeFileSync(filePath, finalContent, 'utf8');
    console.log(`✅ Fixed ${path.basename(filePath)}: removed ${changeCount} labels`);
  } else {
    console.log(`✓ ${path.basename(filePath)}: already clean`);
  }

  return changeCount;
}

console.log('🚀 Removing pricing labels from all companion pages...\n');

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

console.log(`\n✅ Done! Removed ${totalFixed} labels across ${totalFiles} companion pages`);
