#!/usr/bin/env node

/**
 * Test script to debug PT translation fetching
 */

const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const COMPANIONS_TABLE = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

async function test() {
  const slug = 'secrets-ai';
  const lang = 'pt';

  console.log('\n🔍 Testing Translation Fetch for:', slug, lang);

  // Step 1: Find companion
  console.log('\n1️⃣ Finding companion by slug...');
  const companionRecords = await base(COMPANIONS_TABLE)
    .select({
      filterByFormula: `{slug} = "${slug}"`,
      maxRecords: 1
    })
    .all();

  if (companionRecords.length === 0) {
    console.log('❌ Companion not found!');
    return;
  }

  console.log('✅ Found companion:', companionRecords[0].id);
  const companionRecordId = companionRecords[0].id;

  // Step 2: Find translation
  console.log('\n2️⃣ Finding PT translation...');
  console.log('Filter:', `AND({language} = "${lang}", FIND("${companionRecordId}", ARRAYJOIN({companion})))`);

  const translationRecords = await base(TRANSLATIONS_TABLE)
    .select({
      filterByFormula: `AND({language} = "${lang}", FIND("${companionRecordId}", ARRAYJOIN({companion})))`,
      maxRecords: 1
    })
    .all();

  if (translationRecords.length === 0) {
    console.log('❌ Translation not found!');

    // Debug: Check all PT translations
    console.log('\n🔍 Checking all PT translations...');
    const allPT = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: `{language} = "pt"`,
        maxRecords: 5
      })
      .all();

    console.log(`Found ${allPT.length} PT translations`);
    allPT.forEach(record => {
      console.log('- ID:', record.id);
      console.log('  companion:', record.fields.companion);
      console.log('  my_verdict length:', record.fields.my_verdict?.length || 0);
    });

    return;
  }

  console.log('✅ Found translation!');
  console.log('- ID:', translationRecords[0].id);
  console.log('- Language:', translationRecords[0].fields.language);
  console.log('- my_verdict length:', translationRecords[0].fields.my_verdict?.length || 0);
  console.log('- my_verdict preview:', translationRecords[0].fields.my_verdict?.substring(0, 200));
}

test().catch(console.error);
