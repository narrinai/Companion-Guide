#!/usr/bin/env node

/**
 * Fix static Dutch text in German companion pages
 * Replace Dutch placeholders with English (will be translated via i18n)
 */

const fs = require('fs');
const path = require('path');

const DE_COMPANIONS_DIR = path.join(__dirname, '../de/companions');

// Dutch to English replacements
const replacements = {
  'Bezoek Website': 'Visit Website',
  'Lees meer': 'Read more',
  'Lees Review': 'Read Review',
  'Gratis proberen': 'Try for free',
  'Bekijk deal': 'View deal'
};

function fixGermanPage(filename) {
  const filePath = path.join(DE_COMPANIONS_DIR, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changeCount = 0;

  // Replace Dutch text with English
  for (const [dutch, english] of Object.entries(replacements)) {
    const regex = new RegExp(dutch, 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, english);
      changeCount += matches.length;
    }
  }

  if (changeCount > 0) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${filename} (${changeCount} replacements)`);
  } else {
    console.log(`✓ ${filename} - no Dutch text found`);
  }
}

console.log('🚀 Fixing Dutch text in German companion pages...\n');

const files = fs.readdirSync(DE_COMPANIONS_DIR).filter(file => file.endsWith('.html'));

console.log(`Processing ${files.length} files\n`);

let totalFixed = 0;

files.forEach(file => {
  try {
    fixGermanPage(file);
    totalFixed++;
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log(`\n✅ Done! Processed ${totalFixed} German companion pages`);
