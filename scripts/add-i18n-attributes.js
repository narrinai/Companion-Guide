#!/usr/bin/env node

/**
 * Add data-i18n attributes to companion pages
 *
 * This script adds data-i18n attributes to static UI elements
 * so they can be translated via i18n.js when ?lang=nl is used
 *
 * Dynamic content (ratings, taglines, descriptions) comes from Airtable
 * via companion-header.js and doesn't need data-i18n attributes
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const companionsDir = path.join(__dirname, '../companions');

// Map of selectors to i18n keys
// These are STATIC UI elements that need translation
const I18N_MAPPINGS = {
  // Buttons
  'a.platform-btn': 'companionCard.visitWebsite',

  // Section headers
  'h2:contains("Key Features")': 'companion.keyFeatures',
  'h2:contains("Pros")': 'companion.pros',
  'h2:contains("Cons")': 'companion.cons',
  'h2:contains("Overview")': 'companion.overview',
  'h2:contains("What is")': 'companion.whatIs',
  'h2:contains("Pricing")': 'companion.pricing',
  'h2:contains("Our Verdict")': 'companion.verdict',
  'h2:contains("Similar Alternatives")': 'companion.alternatives',
  'h2:contains("Frequently Asked Questions")': 'companion.faqs',
  'h2:contains("User Reviews")': 'companion.reviews',

  // Quick facts labels
  '.fact-item strong:contains("Pricing")': 'companion.pricingLabel',
  '.fact-item strong:contains("Best For")': 'companion.bestForLabel',
  '.fact-item strong:contains("Platform")': 'companion.platformLabel',
  '.fact-item strong:contains("Content Policy")': 'companion.contentPolicyLabel',
  '.fact-item strong:contains("Free Trial")': 'companion.freeTrialLabel',
  '.fact-item strong:contains("Rating")': 'companion.ratingLabel',

  // Common text
  'text:contains("Free")': 'pricing.free',
  'text:contains("From")': 'pricing.from',
  'text:contains("per month")': 'pricing.perMonth',
  'text:contains("/month")': 'pricing.perMonth'
};

/**
 * Check if element contains specific text
 */
function elementContainsText(element, text) {
  const textContent = element.textContent.trim();
  return textContent.includes(text) || textContent === text;
}

/**
 * Add data-i18n attribute to element
 */
function addI18nAttribute(element, key) {
  if (!element.hasAttribute('data-i18n')) {
    element.setAttribute('data-i18n', key);
    return true;
  }
  return false;
}

/**
 * Process a single companion HTML file
 */
function processCompanionFile(filename) {
  const filePath = path.join(companionsDir, filename);
  const slug = path.basename(filename, '.html');

  console.log(`\nProcessing: ${slug}`);

  const html = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  let changeCount = 0;

  // Add data-i18n to "Visit Website" button
  const visitButtons = document.querySelectorAll('a.platform-btn');
  visitButtons.forEach(btn => {
    if (elementContainsText(btn, 'Visit Website')) {
      if (addI18nAttribute(btn, 'companionCard.visitWebsite')) {
        changeCount++;
      }
    }
  });

  // Add data-i18n to section headers
  const headers = document.querySelectorAll('h2, h3');
  headers.forEach(header => {
    const text = header.textContent.trim();

    if (text.includes('Key Features')) {
      if (addI18nAttribute(header, 'companion.keyFeatures')) changeCount++;
    } else if (text === 'Pros' || text.includes('Pros ')) {
      if (addI18nAttribute(header, 'companion.pros')) changeCount++;
    } else if (text === 'Cons' || text.includes('Cons ')) {
      if (addI18nAttribute(header, 'companion.cons')) changeCount++;
    } else if (text.includes('Overview')) {
      if (addI18nAttribute(header, 'companion.overview')) changeCount++;
    } else if (text.startsWith('What is')) {
      if (addI18nAttribute(header, 'companion.whatIs')) changeCount++;
    } else if (text.includes('Pricing')) {
      if (addI18nAttribute(header, 'companion.pricing')) changeCount++;
    } else if (text.includes('Our Verdict')) {
      if (addI18nAttribute(header, 'companion.verdict')) changeCount++;
    } else if (text.includes('Similar Alternatives') || text.includes('Alternatives')) {
      if (addI18nAttribute(header, 'companion.alternatives')) changeCount++;
    } else if (text.includes('Frequently Asked Questions') || text.includes('FAQs')) {
      if (addI18nAttribute(header, 'companion.faqs')) changeCount++;
    } else if (text.includes('User Reviews') || text.includes('Reviews')) {
      if (addI18nAttribute(header, 'companion.reviews')) changeCount++;
    }
  });

  // Add data-i18n to quick facts labels
  const factLabels = document.querySelectorAll('.fact-item strong, .fact-item b');
  factLabels.forEach(label => {
    const text = label.textContent.trim().replace(':', '');

    if (text === 'Pricing') {
      if (addI18nAttribute(label, 'companion.pricingLabel')) changeCount++;
    } else if (text === 'Best For') {
      if (addI18nAttribute(label, 'companion.bestForLabel')) changeCount++;
    } else if (text === 'Platform') {
      if (addI18nAttribute(label, 'companion.platformLabel')) changeCount++;
    } else if (text === 'Content Policy') {
      if (addI18nAttribute(label, 'companion.contentPolicyLabel')) changeCount++;
    } else if (text === 'Free Trial') {
      if (addI18nAttribute(label, 'companion.freeTrialLabel')) changeCount++;
    } else if (text === 'Rating') {
      if (addI18nAttribute(label, 'companion.ratingLabel')) changeCount++;
    }
  });

  if (changeCount > 0) {
    fs.writeFileSync(filePath, dom.serialize(), 'utf-8');
    console.log(`✅ Added ${changeCount} data-i18n attributes`);
  } else {
    console.log(`⏭️  No changes needed`);
  }

  return { slug, changes: changeCount };
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🏷️  Adding data-i18n attributes to companion pages\n');

  const files = fs.readdirSync(companionsDir)
    .filter(f => f.endsWith('.html'))
    .sort();

  console.log(`Found ${files.length} companion pages\n`);

  const results = [];

  for (const file of files) {
    try {
      const result = processCompanionFile(file);
      results.push(result);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 SUMMARY');
  console.log('='.repeat(60));

  const totalChanges = results.reduce((sum, r) => sum + r.changes, 0);
  const filesChanged = results.filter(r => r.changes > 0).length;

  console.log(`Files processed: ${results.length}`);
  console.log(`Files changed: ${filesChanged}`);
  console.log(`Total attributes added: ${totalChanges}`);

  console.log('\n✨ Done!\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
