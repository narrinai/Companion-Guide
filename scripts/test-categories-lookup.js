const Airtable = require('airtable');
require('dotenv').config();

/**
 * Test script to verify categories lookup field in Companion_Translations
 *
 * This will:
 * 1. Fetch a few records from Companion_Translations
 * 2. Check if categories field exists and has data
 * 3. Verify the data structure matches what the API expects
 *
 * Run AFTER adding "categories (from companion)" lookup field in Airtable
 *
 * Usage: node scripts/test-categories-lookup.js
 */

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE_ID = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

async function testCategoriesLookup() {
  console.log('🔍 Testing categories lookup field in Companion_Translations...\n');

  try {
    // Fetch 5 English records to test
    const records = await base(TRANSLATIONS_TABLE_ID)
      .select({
        filterByFormula: '{language} = "en"',
        maxRecords: 5
      })
      .all();

    console.log(`📊 Found ${records.length} test records\n`);

    let hasCategories = 0;
    let missingCategories = 0;

    for (const record of records) {
      const fields = record.fields;
      const companionName = fields['name (from companion)']?.[0] || fields.name || 'Unknown';

      console.log(`\n📌 ${companionName}:`);
      console.log(`   Language: ${fields.language}`);

      // Check if categories field exists
      if (fields.categories) {
        console.log(`   ✅ Categories field EXISTS`);
        console.log(`   Categories type: ${Array.isArray(fields.categories) ? 'Array' : typeof fields.categories}`);
        console.log(`   Categories value:`, fields.categories);
        hasCategories++;
      } else if (fields['categories (from companion)']) {
        console.log(`   ✅ Categories (from companion) field EXISTS`);
        console.log(`   Categories type: ${Array.isArray(fields['categories (from companion)']) ? 'Array' : typeof fields['categories (from companion)']}`);
        console.log(`   Categories value:`, fields['categories (from companion)']);
        hasCategories++;
      } else {
        console.log(`   ❌ NO categories field found`);
        console.log(`   Available fields:`, Object.keys(fields).filter(k => k.includes('cat') || k.includes('from')));
        missingCategories++;
      }

      // Also check rating field for comparison
      if (fields['rating (from companion)']) {
        console.log(`   Rating (from companion): ${fields['rating (from companion)']}`);
      }
    }

    console.log('\n\n📈 Summary:');
    console.log(`   ✅ Records with categories: ${hasCategories}`);
    console.log(`   ❌ Records missing categories: ${missingCategories}`);

    if (hasCategories === records.length) {
      console.log('\n✨ SUCCESS! All records have categories field.');
      console.log('The API should now work correctly for category filtering.');
    } else {
      console.log('\n⚠️  WARNING: Some records are missing categories.');
      console.log('Please add the "categories (from companion)" lookup field in Airtable:');
      console.log('   1. Open Companion_Translations table');
      console.log('   2. Add new field: Lookup');
      console.log('   3. Link to: companion');
      console.log('   4. Lookup field: categories');
      console.log('   5. Field name: "categories (from companion)"');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testCategoriesLookup().then(() => {
  console.log('\n🎉 Test complete!');
  process.exit(0);
});
