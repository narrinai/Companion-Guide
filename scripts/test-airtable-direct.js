/**
 * Test direct Airtable connection using EXACT same code as companionguide-get.js
 */

const Airtable = require('airtable');

console.log('Testing Airtable connection...\n');

// Exact same initialization as companionguide-get.js
const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
  .base(process.env.AIRTABLE_BASE_ID_CG);

const tableId = process.env.AIRTABLE_TABLE_ID_CG;

console.log('Base ID:', process.env.AIRTABLE_BASE_ID_CG);
console.log('Table ID:', tableId);
console.log('\nTrying to fetch records...\n');

// Exact same query as companionguide-get.js
const selectOptions = {
  filterByFormula: '{status} = "Active"',
  sort: [{ field: 'rating', direction: 'desc' }],
  maxRecords: 5
};

base(tableId)
  .select(selectOptions)
  .all()
  .then(records => {
    console.log(`✅ SUCCESS! Found ${records.length} records`);
    records.forEach((record, i) => {
      console.log(`${i + 1}. ${record.fields.name} - Rating: ${record.fields.rating}`);
    });
  })
  .catch(error => {
    console.error('❌ ERROR:', error.message);
    console.error('Error type:', error.statusCode);
  });
