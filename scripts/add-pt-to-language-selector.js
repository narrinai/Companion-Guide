#!/usr/bin/env node

/**
 * Add PT to language selector in all pages
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all HTML files with language selector
const files = execSync('grep -rl "lang-dropdown" --include="*.html" .', { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(f => f && !f.includes('node_modules'));

console.log(`Found ${files.length} files with language selector\n`);

let updatedCount = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Add PT option after NL in language dropdown
  // Pattern: <a href="/nl/" class="lang-option active">🇳🇱 Nederlands</a>
  // After this, add PT line if not exists

  if (!content.includes('🇧🇷 Português') && !content.includes('🇵🇹 Português')) {
    // Add PT after NL line
    content = content.replace(
      /(<a href="\/nl\/" class="lang-option.*?">🇳🇱 Nederlands<\/a>)/,
      '$1\n                    <a href="/pt/" class="lang-option">🇧🇷 Português</a>'
    );

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Updated: ${filePath}`);
      updatedCount++;
    }
  }
});

console.log(`\n✅ Updated ${updatedCount} files with PT language option`);
