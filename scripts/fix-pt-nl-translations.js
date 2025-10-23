#!/usr/bin/env node

/**
 * Fix PT and NL translation issues
 * - Add missing i18n keys to JSON files
 * - Add data-i18n attributes to HTML files
 * - Fix Dutch text in PT pages
 */

const fs = require('fs');
const path = require('path');

// Add missing translation keys
console.log('📝 Adding missing translation keys...\n');

// Load existing JSON files
const nlJsonPath = path.join(__dirname, '..', 'locales', 'nl.json');
const ptJsonPath = path.join(__dirname, '..', 'locales', 'pt.json');

const nlJson = JSON.parse(fs.readFileSync(nlJsonPath, 'utf-8'));
const ptJson = JSON.parse(fs.readFileSync(ptJsonPath, 'utf-8'));

// Add missing keys
nlJson.sections = nlJson.sections || {};
nlJson.sections.latestNewsDescription = 'Blijf op de hoogte van het laatste nieuws en inzichten uit de AI companion industrie';
nlJson.sections.explorePlatformsTitle = 'Ontdek AI Platforms per Categorie';
nlJson.sections.explorePlatformsDescription = 'Vind AI companion platforms die passen bij jouw specifieke behoeften';

ptJson.sections = ptJson.sections || {};
ptJson.sections.latestNewsDescription = 'Fique atualizado com as últimas notícias e insights da indústria de companions de IA';
ptJson.sections.explorePlatformsTitle = 'Descubra Plataformas de IA por Categoria';
ptJson.sections.explorePlatformsDescription = 'Encontre plataformas de companion de IA adequadas às suas necessidades específicas';

// Save updated JSON files
fs.writeFileSync(nlJsonPath, JSON.stringify(nlJson, null, 2), 'utf-8');
fs.writeFileSync(ptJsonPath, JSON.stringify(ptJson, null, 2), 'utf-8');

console.log('✅ Updated nl.json');
console.log('✅ Updated pt.json\n');

// Fix HTML files
console.log('🔧 Fixing HTML files...\n');

const filesToFix = [
  { path: 'nl/index.html', lang: 'nl' },
  { path: 'pt/index.html', lang: 'pt' }
];

filesToFix.forEach(({ path: filePath, lang }) => {
  const fullPath = path.join(__dirname, '..', filePath);

  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');

  // Fix news section description
  content = content.replace(
    /<p>Blijf op de hoogte van het laatste nieuws en inzichten uit de AI companion industrie<\/p>/g,
    '<p data-i18n="sections.latestNewsDescription">Blijf op de hoogte van het laatste nieuws en inzichten uit de AI companion industrie</p>'
  );

  // Fix explore platforms section
  content = content.replace(
    /<h2 data-i18n="sections\.exploreCategory">Ontdek AI Platforms per Categorie<\/h2>/g,
    '<h2 data-i18n="sections.explorePlatformsTitle">Ontdek AI Platforms per Categorie</h2>'
  );

  content = content.replace(
    /<p>Vind AI companion platforms die passen bij jouw specifieke behoeften<\/p>/g,
    '<p data-i18n="sections.explorePlatformsDescription">Vind AI companion platforms die passen bij jouw specifieke behoeften</p>'
  );

  fs.writeFileSync(fullPath, content, 'utf-8');
  console.log(`✅ Fixed ${filePath}`);
});

console.log('\n✅ All translation fixes applied!');
