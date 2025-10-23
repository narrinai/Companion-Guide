#!/usr/bin/env node

/**
 * Fix all language selectors to include PT option
 * Updates existing selectors that only have EN and NL
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all HTML files with language selector
const files = execSync('grep -rl "lang-dropdown" --include="*.html" . 2>/dev/null || true', { encoding: 'utf-8' })
  .trim()
  .split('\n')
  .filter(f => f && !f.includes('node_modules') && !f.includes('test') && !f.includes('backup'));

console.log(`Found ${files.length} files with language selector\n`);

let updatedCount = 0;

files.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf-8');
  const originalContent = content;

  // Check if already has PT option
  if (content.includes('🇧🇷 Português') || content.includes('🇵🇹 Português')) {
    console.log(`⏭️  Already has PT: ${filePath}`);
    return;
  }

  // Detect current language from path
  let currentLang = 'en';
  if (filePath.startsWith('nl/')) currentLang = 'nl';
  if (filePath.startsWith('pt/')) currentLang = 'pt';

  // Detect page type for correct URLs
  let pageName = path.basename(filePath, '.html');
  if (pageName === 'index') pageName = '';

  // Build correct URLs
  const enUrl = pageName ? `/${pageName}` : '/';
  const nlUrl = pageName ? `/nl/${pageName}` : '/nl/';
  const ptUrl = pageName ? `/pt/${pageName}` : '/pt/';

  // Pattern 1: Add PT after NL line in dropdown
  const nlLinePattern = /(<a href="[^"]*?" class="lang-option[^"]*">🇳🇱 Nederlands<\/a>)/;

  if (nlLinePattern.test(content)) {
    content = content.replace(
      nlLinePattern,
      `$1\n                    <a href="${ptUrl}" class="lang-option${currentLang === 'pt' ? ' active' : ''}">🇧🇷 Português</a>`
    );
  }

  // Also fix the active class on current language
  if (currentLang === 'en') {
    content = content.replace(
      /(<a href="[^"]*?" class="lang-option)(">🇬🇧 English<\/a>)/,
      '$1 active$2'
    );
    // Remove active from others
    content = content.replace(
      /(<a href="[^"]*?" class="lang-option) active(">🇳🇱 Nederlands<\/a>)/,
      '$1$2'
    );
  } else if (currentLang === 'nl') {
    content = content.replace(
      /(<a href="[^"]*?" class="lang-option)(">🇳🇱 Nederlands<\/a>)/,
      '$1 active$2'
    );
    // Remove active from others
    content = content.replace(
      /(<a href="[^"]*?" class="lang-option) active(">🇬🇧 English<\/a>)/,
      '$1$2'
    );
  }

  // Update flag in button if needed
  if (currentLang === 'en' && !content.includes('🇬🇧 EN')) {
    content = content.replace(
      /(<button id="lang-toggle" class="lang-current">\s*)\S+\s+\S+/,
      '$1🇬🇧 EN'
    );
  } else if (currentLang === 'nl' && !content.includes('🇳🇱 NL')) {
    content = content.replace(
      /(<button id="lang-toggle" class="lang-current">\s*)\S+\s+\S+/,
      '$1🇳🇱 NL'
    );
  } else if (currentLang === 'pt' && !content.includes('🇧🇷 PT')) {
    content = content.replace(
      /(<button id="lang-toggle" class="lang-current">\s*)\S+\s+\S+/,
      '$1🇧🇷 PT'
    );
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✅ Fixed: ${filePath}`);
    updatedCount++;
  }
});

console.log(`\n✅ Fixed ${updatedCount} language selectors`);
