#!/usr/bin/env node

/**
 * Remove duplicate "Key Features" section from all companion pages
 * Keep only the .intro-highlights grid under "What is X" section
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const COMPANIONS_DIR = path.join(__dirname, '../companions');

function removeKeyFeaturesSection(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // Find the "Key Features" section
  const featuresSection = document.querySelector('section.features');

  if (featuresSection) {
    // Check if this section contains h2 with "Key Features"
    const heading = featuresSection.querySelector('h2');
    if (heading && (heading.textContent.includes('Key Features') || heading.textContent.includes('Belangrijkste Functies'))) {
      featuresSection.remove();
      console.log(`✅ Removed Key Features section from: ${path.basename(filePath)}`);

      // Save the file
      fs.writeFileSync(filePath, dom.serialize(), 'utf-8');
      return true;
    }
  }

  return false;
}

// Process all HTML files in companions directory
function processAllCompanions() {
  const files = fs.readdirSync(COMPANIONS_DIR);
  const htmlFiles = files.filter(file => file.endsWith('.html'));

  console.log(`\n🔍 Processing ${htmlFiles.length} companion pages...\n`);

  let removedCount = 0;

  htmlFiles.forEach(file => {
    const filePath = path.join(COMPANIONS_DIR, file);
    if (removeKeyFeaturesSection(filePath)) {
      removedCount++;
    }
  });

  console.log(`\n✅ Done! Removed duplicate features sections from ${removedCount} pages.`);
}

// Run the script
processAllCompanions();
