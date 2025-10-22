const Airtable = require('airtable');

// Load env from command line for testing
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN_CG;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID_CG;
const COMPANIONS_TABLE_ID = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE_ID = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

console.log('🔍 Testing Airtable connection...\n');
console.log(`Base ID: ${AIRTABLE_BASE_ID}`);
console.log(`Companions Table: ${COMPANIONS_TABLE_ID}`);
console.log(`Translations Table: ${TRANSLATIONS_TABLE_ID}\n`);

if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !COMPANIONS_TABLE_ID) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const base = new Airtable({ apiKey: AIRTABLE_TOKEN }).base(AIRTABLE_BASE_ID);

async function testConnection() {
  try {
    console.log('📋 Testing Companions table...');

    const records = await base(COMPANIONS_TABLE_ID)
      .select({
        maxRecords: 3,
        fields: ['name', 'slug', 'status']
      })
      .firstPage();

    console.log(`✅ Successfully fetched ${records.length} records from Companions table\n`);

    records.forEach((record, i) => {
      console.log(`${i + 1}. ${record.fields.name} (${record.fields.slug})`);
      console.log(`   Status: ${record.fields.status}`);
      console.log(`   Record ID: ${record.id}`);
    });

    console.log('\n📋 Testing Translations table...');

    const transRecords = await base(TRANSLATIONS_TABLE_ID)
      .select({
        maxRecords: 3
      })
      .firstPage();

    console.log(`✅ Found ${transRecords.length} existing translation records\n`);

    if (transRecords.length > 0) {
      transRecords.forEach((record, i) => {
        console.log(`${i + 1}. Language: ${record.fields.language || 'N/A'}`);
        console.log(`   Companion: ${record.fields.companion || 'N/A'}`);
      });
    }

    console.log('\n✅ All connection tests passed!');

  } catch (error) {
    console.error('\n❌ Connection test failed:');
    console.error(`Error: ${error.message}`);
    if (error.statusCode) {
      console.error(`Status Code: ${error.statusCode}`);
    }
    process.exit(1);
  }
}

testConnection();
