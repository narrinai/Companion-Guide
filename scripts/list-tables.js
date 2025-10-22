/**
 * Debug script to list all tables in Airtable base
 */

const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

console.log('🔍 Trying to list tables...\n');
console.log('Base ID:', process.env.AIRTABLE_BASE_ID_CG);
console.log('Table ID from env:', process.env.AIRTABLE_TABLE_ID_CG);
console.log('\nAttempting to query with table ID...\n');

// Try with the TABLE_ID from environment
base(process.env.AIRTABLE_TABLE_ID_CG)
  .select({ maxRecords: 1 })
  .firstPage()
  .then(records => {
    console.log('✅ Successfully connected to table using ID:', process.env.AIRTABLE_TABLE_ID_CG);
    console.log('✅ Found', records.length, 'record(s)');
    if (records.length > 0) {
      console.log('✅ First record fields:', Object.keys(records[0].fields));
    }
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
  });
