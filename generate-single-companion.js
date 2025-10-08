#!/usr/bin/env node

/**
 * Generate a companion HTML page based on Airtable data
 * Usage: node generate-single-companion.js <slug>
 * Example: node generate-single-companion.js ehentai-ai
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

const slug = process.argv[2];

if (!slug) {
  console.error('❌ Please provide a slug as argument');
  console.error('Usage: node generate-single-companion.js <slug>');
  console.error('Example: node generate-single-companion.js ehentai-ai');
  process.exit(1);
}

async function fetchCompanionData(slug) {
  return new Promise((resolve, reject) => {
    https.get(`https://companionguide.ai/.netlify/functions/companionguide-get`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const companion = json.companions.find(c => c.slug === slug);
          if (companion) {
            resolve(companion);
          } else {
            reject(new Error(`Companion with slug "${slug}" not found in Airtable`));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function generatePage(companion) {
  console.log(`📄 Generating page for ${companion.name}...`);

  // Read the secrets-ai template
  const templatePath = path.join(__dirname, 'companions/secrets-ai.html');
  const template = await fs.readFile(templatePath, 'utf-8');

  // Simple replacements for now
  let html = template
    .replace(/Secrets AI/g, companion.name)
    .replace(/secrets-ai/g, companion.slug)
    .replace(/9\.6/g, companion.rating.toFixed(1))
    .replace(/secrets-ai-review-companionguide\.png/g, `${companion.slug}.png`)
    .replace(/https:\/\/www\.secrets\.ai\/browse\?fpr=companionguide/g, companion.website_url || companion.affiliate_url);

  // Write the file
  const outputPath = path.join(__dirname, `companions/${companion.slug}.html`);
  await fs.writeFile(outputPath, html, 'utf-8');

  console.log(`✅ Successfully generated companions/${companion.slug}.html`);
  console.log(`🌐 View at: https://companionguide.ai/companions/${companion.slug}`);
}

async function main() {
  try {
    console.log(`🔍 Fetching data for "${slug}" from Airtable...`);
    const companion = await fetchCompanionData(slug);

    console.log(`✅ Found companion: ${companion.name}`);
    console.log(`   Rating: ${companion.rating}/10`);
    console.log(`   Categories: ${companion.categories?.join(', ') || 'none'}`);

    await generatePage(companion);

    console.log('\n✨ Done! You can now commit and push the file to deploy it.');
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();
