const Airtable = require('airtable');

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
  .base(process.env.AIRTABLE_BASE_ID_CG);

async function checkIsMonth() {
  try {
    console.log('🔍 Checking is_month field...\n');

    // Check Table 1
    const records = await base(process.env.AIRTABLE_TABLE_ID_CG)
      .select({
        fields: ['name', 'slug', 'is_month'],
        filterByFormula: '{is_month} = TRUE()'
      })
      .all();

    console.log(`=== COMPANIONS WITH is_month = TRUE (${records.length}) ===`);

    if (records.length === 0) {
      console.log('❌ No companion has is_month = true\n');

      // Show all companions with their is_month value
      console.log('=== ALL COMPANIONS ===');
      const allRecords = await base(process.env.AIRTABLE_TABLE_ID_CG)
        .select({
          fields: ['name', 'slug', 'is_month']
        })
        .all();

      allRecords.forEach(r => {
        console.log(`  ${r.fields.name} (${r.fields.slug}): is_month = ${r.fields.is_month || 'NOT SET'}`);
      });
    } else {
      records.forEach(r => {
        console.log(`  ✅ ${r.fields.name} (${r.fields.slug})`);
        console.log(`     is_month: ${r.fields.is_month}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkIsMonth();
