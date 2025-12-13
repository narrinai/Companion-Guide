const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all HTML files with lang-dropdown
const findFiles = execSync(
  'grep -l "lang-dropdown" /Users/sebastiaansmits/Documents/AI-Companion-Reviews/*.html /Users/sebastiaansmits/Documents/AI-Companion-Reviews/*/*.html 2>/dev/null',
  { encoding: 'utf-8' }
).trim().split('\n');

let updated = 0;
let skipped = 0;

findFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf-8');
  let modified = false;

  // Skip if already has ES in dropdown
  if (content.includes('🇪🇸')) {
    skipped++;
    return;
  }

  // Get page info for building ES path
  const relativePath = file.replace('/Users/sebastiaansmits/Documents/AI-Companion-Reviews', '');
  const pageName = path.basename(file, '.html');

  // Determine the ES path
  let esPath;
  if (relativePath.startsWith('/de/') || relativePath.startsWith('/nl/') || relativePath.startsWith('/pt/')) {
    esPath = '/es/' + pageName;
  } else if (relativePath.startsWith('/companions/')) {
    esPath = '/es/companions/' + pageName;
  } else if (relativePath.startsWith('/categories/')) {
    esPath = '/es/categories/' + pageName;
  } else if (relativePath.startsWith('/news/')) {
    esPath = '/es/news/' + pageName;
  } else {
    if (pageName === 'index') {
      esPath = '/es/';
    } else {
      esPath = '/es/' + pageName;
    }
  }

  // Pattern 1: Add ES link after GB when followed by DE
  const dropdownPattern1 = /(<a href="[^"]*" class="lang-option[^"]*">🇬🇧<\/a>)\n(\s*)(<a href="[^"]*\/de)/;
  if (dropdownPattern1.test(content)) {
    content = content.replace(dropdownPattern1, (match, gb, ws, de) => {
      return `${gb}\n${ws}<a href="${esPath}" class="lang-option">🇪🇸</a>\n${ws}${de}`;
    });
    modified = true;
  }

  // Pattern 2: Add ES link after GB when followed by NL (no DE)
  const dropdownPattern2 = /(<a href="[^"]*" class="lang-option[^"]*">🇬🇧<\/a>)\n(\s*)(<a href="[^"]*\/nl)/;
  if (!modified && dropdownPattern2.test(content)) {
    content = content.replace(dropdownPattern2, (match, gb, ws, nl) => {
      return `${gb}\n${ws}<a href="${esPath}" class="lang-option">🇪🇸</a>\n${ws}${nl}`;
    });
    modified = true;
  }

  // Pattern 3: Add ES link after GB when followed by NL (with # links like news articles)
  const dropdownPattern3 = /(<a href="#" class="lang-option active">🇬🇧<\/a>)\n(\s*)(<a href="#" class="lang-option">🇳🇱)/;
  if (!modified && dropdownPattern3.test(content)) {
    content = content.replace(dropdownPattern3, (match, gb, ws, nl) => {
      return `${gb}\n${ws}<a href="#" class="lang-option">🇪🇸</a>\n${ws}${nl}`;
    });
    modified = true;
  }

  // Add ES to JavaScript detection (if not already there)
  const jsPattern = /if \(currentPath\.startsWith\('\/nl\/'\)/;
  if (jsPattern.test(content) && !content.includes("currentPath.startsWith('/es/')")) {
    content = content.replace(jsPattern,
      `if (currentPath.startsWith('/es/') || currentPath === '/es') {
                    currentLang = 'ES';
                    currentFlag = '🇪🇸';
                } else if (currentPath.startsWith('/nl/')`
    );
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(file, content);
    updated++;
    console.log('Updated:', relativePath);
  }
});

console.log('\nTotal updated:', updated);
console.log('Skipped (already has ES):', skipped);
