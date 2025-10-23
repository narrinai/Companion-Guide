#!/usr/bin/env node

/**
 * Add my_verdict field to existing English translation records
 * Extracts from HTML files
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const Airtable = require('airtable');

require('dotenv').config();

const COMPANIONS_DIR = path.join(__dirname, '../companions');

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const COMPANIONS_TABLE = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

/**
 * Extract my_verdict from HTML file
 */
function extractMyVerdictFromHTML(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const verdictSection = document.querySelector('.verdict, section.verdict');
  if (!verdictSection) {
    return '';
  }

  const paragraphs = Array.from(verdictSection.querySelectorAll('.verdict-text p, p'))
    .map(p => p.textContent.trim())
    .filter(p => p && !p.includes('Ready to Try') && !p.includes('Our Verdict'));

  return paragraphs.join('\n\n');
}

/**
 * Find companion record ID by slug
 */
async function findCompanionRecordId(slug) {
  try {
    const records = await base(COMPANIONS_TABLE)
      .select({
        filterByFormula: `{slug} = "${slug}"`,
        maxRecords: 1
      })
      .all();

    return records.length > 0 ? records[0].id : null;
  } catch (error) {
    console.error(`Error finding companion ${slug}:`, error.message);
    return null;
  }
}

/**
 * Get all English translation records (cached)
 */
let allEnglishRecords = null;

async function getAllEnglishTranslations() {
  if (allEnglishRecords) {
    return allEnglishRecords;
  }

  try {
    allEnglishRecords = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: '{language} = "en"'
      })
      .all();

    return allEnglishRecords;
  } catch (error) {
    console.error('Error fetching English translations:', error.message);
    return [];
  }
}

/**
 * Get English translation record for a specific companion
 */
async function getEnglishTranslation(companionRecordId) {
  const allRecords = await getAllEnglishTranslations();

  return allRecords.find(record => {
    const companionIds = record.fields.companion || [];
    return companionIds.includes(companionRecordId);
  }) || null;
}

/**
 * Update English translation with my_verdict
 */
async function updateEnglishTranslation(recordId, myVerdict) {
  try {
    await base(TRANSLATIONS_TABLE).update([
      {
        id: recordId,
        fields: {
          my_verdict: myVerdict
        }
      }
    ]);
    return true;
  } catch (error) {
    console.error('Error updating translation:', error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n📝 Adding my_verdict to English Translation Records\n');

  const files = fs.readdirSync(COMPANIONS_DIR);
  const htmlFiles = files.filter(file => file.endsWith('.html'));

  console.log(`Found ${htmlFiles.length} companion HTML files\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const file of htmlFiles) {
    const slug = file.replace('.html', '');
    const htmlPath = path.join(COMPANIONS_DIR, file);

    console.log(`\n📄 Processing: ${slug}`);

    try {
      // Extract my_verdict from HTML
      const myVerdict = extractMyVerdictFromHTML(htmlPath);

      if (!myVerdict) {
        console.log('   ⏭️  No verdict found in HTML - skipping');
        skipCount++;
        continue;
      }

      // Find companion record ID
      const companionRecordId = await findCompanionRecordId(slug);

      if (!companionRecordId) {
        console.log('   ❌ Companion not found in Airtable');
        errorCount++;
        continue;
      }

      // Get English translation record
      const englishRecord = await getEnglishTranslation(companionRecordId);

      if (!englishRecord) {
        console.log('   ❌ No English translation record found');
        errorCount++;
        continue;
      }

      // Check if already has my_verdict
      if (englishRecord.fields.my_verdict) {
        console.log('   ⏭️  Already has my_verdict - skipping');
        skipCount++;
        continue;
      }

      // Update with my_verdict
      console.log('   ✍️  Adding my_verdict...');
      const success = await updateEnglishTranslation(englishRecord.id, myVerdict);

      if (success) {
        console.log('   ✅ Updated successfully');
        successCount++;
      } else {
        console.log('   ❌ Update failed');
        errorCount++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`   ❌ Error processing ${slug}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Done!`);
  console.log(`   Processed: ${htmlFiles.length} companions`);
  console.log(`   Updated: ${successCount}`);
  console.log(`   Skipped: ${skipCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log('\n');
}

main();
