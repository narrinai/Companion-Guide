#!/usr/bin/env node

/**
 * Check what fields are actually in Airtable for EN records
 */

const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

async function main() {
  try {
    const records = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: '{language} = "en"',
        maxRecords: 1
      })
      .all();

    if (records.length === 0) {
      console.log('No English records found');
      return;
    }

    const record = records[0];
    console.log('\nFirst English record fields:');
    console.log('Companion:', record.fields.companion);
    console.log('\nFields present:');
    Object.keys(record.fields).forEach(key => {
      const value = record.fields[key];
      const preview = typeof value === 'string'
        ? (value.length > 50 ? value.substring(0, 50) + '...' : value)
        : value;
      console.log(`  ${key}: ${preview}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

main();
