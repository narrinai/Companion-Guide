const Airtable = require('airtable');
require('dotenv').config();

/**
 * Restore Dutch/Portuguese connectors (with/and/for -> met/en/voor or com/e/para)
 * that were incorrectly translated to English
 *
 * Usage: node scripts/restore-tagline-connectors.js
 */

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE_ID = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

if (!TRANSLATIONS_TABLE_ID) {
  console.error('❌ AIRTABLE_TRANSLATIONS_TABLE_ID_CG not set in .env');
  process.exit(1);
}

/**
 * Restore Dutch connectors
 */
function restoreDutchConnectors(text) {
  if (!text) return text;

  let fixed = text;

  // Restore connectors
  fixed = fixed.replace(/\swith\s/gi, ' met ');
  fixed = fixed.replace(/\sand\s/gi, ' en ');
  fixed = fixed.replace(/\sfor\s/gi, ' voor ');

  return fixed;
}

/**
 * Restore Portuguese connectors
 */
function restorePortugueseConnectors(text) {
  if (!text) return text;

  let fixed = text;

  // Restore connectors
  fixed = fixed.replace(/\swith\s/gi, ' com ');
  fixed = fixed.replace(/\sand\s/gi, ' e ');
  fixed = fixed.replace(/\sfor\s/gi, ' para ');

  return fixed;
}

/**
 * Main function to restore all tagline connectors
 */
async function restoreAllConnectors() {
  console.log('🚀 Starting tagline connector restoration...\n');

  try {
    // Fetch all NL and PT translation records
    const records = await base(TRANSLATIONS_TABLE_ID)
      .select({
        filterByFormula: 'OR({language} = "nl", {language} = "pt")',
        maxRecords: 1000
      })
      .all();

    console.log(`📊 Found ${records.length} NL/PT translation records\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const record of records) {
      const fields = record.fields;
      const companionName = fields['name (from companion)']?.[0]
        || fields['slug (from companion)']?.[0]
        || 'Unknown';
      const language = fields.language || 'unknown';

      try {
        const originalTagline = fields.tagline || '';
        const fixedTagline = language === 'nl'
          ? restoreDutchConnectors(originalTagline)
          : restorePortugueseConnectors(originalTagline);

        // Check if tagline changed
        if (originalTagline === fixedTagline) {
          console.log(`⏭️  ${companionName} (${language}): No changes needed`);
          skippedCount++;
          continue;
        }

        // Update the record
        await base(TRANSLATIONS_TABLE_ID).update(record.id, {
          tagline: fixedTagline
        });

        console.log(`✅ ${companionName} (${language}):`);
        console.log(`   Before: "${originalTagline}"`);
        console.log(`   After:  "${fixedTagline}"\n`);
        updatedCount++;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ ${companionName} (${language}): Error - ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total processed: ${records.length}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
restoreAllConnectors().then(() => {
  console.log('\n🎉 Done!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
