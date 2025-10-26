#!/usr/bin/env node

/**
 * Check what fields exist in translations table
 */

const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

async function checkFields() {
  console.log('\n🔍 Checking Translation Table Fields\n');

  // Get first PT record to see structure
  const records = await base(TRANSLATIONS_TABLE)
    .select({
      filterByFormula: '{language} = "pt"',
      maxRecords: 1
    })
    .all();

  if (records.length === 0) {
    console.log('❌ No PT translations found');
    return;
  }

  const record = records[0];
  console.log('📋 Available fields in translation record:');
  console.log(Object.keys(record.fields));
  console.log('\n📝 Sample field values:');
  for (const [key, value] of Object.entries(record.fields)) {
    if (typeof value === 'string' && value.length > 100) {
      console.log(`   ${key}: [string, length: ${value.length}]`);
    } else if (Array.isArray(value)) {
      console.log(`   ${key}: [array, length: ${value.length}] - ${JSON.stringify(value)}`);
    } else {
      console.log(`   ${key}:`, value);
    }
  }
}

checkFields().catch(console.error);
