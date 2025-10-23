#!/usr/bin/env node

/**
 * Remove duplicate Dutch translation records
 * Keep only one NL record per companion (the most complete one)
 */

const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

/**
 * Count how many fields are filled in a record
 */
function countFilledFields(record) {
  const importantFields = [
    'description', 'best_for', 'tagline', 'meta_title', 'meta_description',
    'body_text', 'features', 'pros_cons', 'pricing_plans', 'my_verdict',
    'faq', 'hero_specs', 'ready_try'
  ];

  return importantFields.filter(field => {
    const value = record.fields[field];
    return value && value.trim && value.trim() !== '';
  }).length;
}

/**
 * Main function
 */
async function main() {
  console.log('\n🧹 Removing Duplicate Dutch Translation Records\n');

  try {
    // Get all Dutch translation records
    const dutchRecords = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: '{language} = "nl"'
      })
      .all();

    console.log(`Found ${dutchRecords.length} Dutch translation records\n`);

    // Group by companion ID
    const groupedByCompanion = {};

    dutchRecords.forEach(record => {
      const companionId = record.fields.companion ? record.fields.companion[0] : null;

      if (!companionId) {
        console.log(`⚠️  Skipping record without companion link: ${record.id}`);
        return;
      }

      if (!groupedByCompanion[companionId]) {
        groupedByCompanion[companionId] = [];
      }

      groupedByCompanion[companionId].push(record);
    });

    // Find duplicates
    let duplicatesFound = 0;
    let recordsToDelete = [];

    for (const [companionId, records] of Object.entries(groupedByCompanion)) {
      if (records.length > 1) {
        duplicatesFound++;
        console.log(`\n🔍 Found ${records.length} Dutch records for companion: ${companionId}`);

        // Sort by completeness (most complete first)
        records.sort((a, b) => {
          const scoreA = countFilledFields(a);
          const scoreB = countFilledFields(b);
          return scoreB - scoreA;
        });

        // Keep the most complete one
        const keepRecord = records[0];
        const deleteRecords = records.slice(1);

        console.log(`   ✅ Keeping: ${keepRecord.id} (${countFilledFields(keepRecord)} fields filled)`);

        deleteRecords.forEach(record => {
          console.log(`   ❌ Deleting: ${record.id} (${countFilledFields(record)} fields filled)`);
          recordsToDelete.push(record.id);
        });
      }
    }

    if (recordsToDelete.length === 0) {
      console.log('\n✅ No duplicates found!\n');
      return;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Companions with duplicates: ${duplicatesFound}`);
    console.log(`   Total records to delete: ${recordsToDelete.length}`);
    console.log('\n🗑️  Deleting duplicate records...\n');

    // Delete in batches of 10 (Airtable API limit)
    const batchSize = 10;
    let deletedCount = 0;

    for (let i = 0; i < recordsToDelete.length; i += batchSize) {
      const batch = recordsToDelete.slice(i, i + batchSize);

      try {
        await base(TRANSLATIONS_TABLE).destroy(batch);
        deletedCount += batch.length;
        console.log(`   Deleted ${deletedCount}/${recordsToDelete.length} records...`);
      } catch (error) {
        console.error(`   ❌ Error deleting batch:`, error.message);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Cleanup Complete!`);
    console.log(`   Deleted: ${deletedCount} duplicate records`);
    console.log(`   Remaining: ${dutchRecords.length - deletedCount} Dutch records`);
    console.log('\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
