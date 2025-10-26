#!/usr/bin/env node

/**
 * Test querying translations by slug + language
 */

const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

async function testSlugQuery() {
  const slug = 'secrets-ai';
  const lang = 'pt';

  console.log('\n🔍 Testing slug-based query\n');
  console.log(`Searching for: slug="${slug}", language="${lang}"\n`);

  // Test the query
  console.log('Filter formula:', `AND({language} = "${lang}", FIND("${slug}", ARRAYJOIN({slug (from companion)})))`);

  const records = await base(TRANSLATIONS_TABLE)
    .select({
      filterByFormula: `AND({language} = "${lang}", FIND("${slug}", ARRAYJOIN({slug (from companion)})))`,
      maxRecords: 1
    })
    .all();

  if (records.length === 0) {
    console.log('❌ No translation found with this query\n');

    // Try alternative - search all PT and check which have secrets-ai
    console.log('🔍 Searching all PT translations for secrets-ai manually...\n');
    const allPT = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: '{language} = "pt"'
      })
      .all();

    for (const record of allPT) {
      const slugField = record.fields['slug (from companion)'];
      if (slugField && slugField.includes('secrets-ai')) {
        console.log('✨ FOUND IT!');
        console.log('   Record ID:', record.id);
        console.log('   slug (from companion):', slugField);
        console.log('   my_verdict length:', record.fields.my_verdict?.length || 0);
        console.log('   my_verdict preview:', record.fields.my_verdict?.substring(0, 200));
      }
    }
  } else {
    console.log('✅ Translation found!');
    const record = records[0];
    console.log('   Record ID:', record.id);
    console.log('   Language:', record.fields.language);
    console.log('   slug (from companion):', record.fields['slug (from companion)']);
    console.log('   my_verdict length:', record.fields.my_verdict?.length || 0);
    console.log('   my_verdict preview:', record.fields.my_verdict?.substring(0, 200));
  }
}

testSlugQuery().catch(console.error);
