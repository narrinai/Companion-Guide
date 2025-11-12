const Airtable = require('airtable');

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
  .base(process.env.AIRTABLE_BASE_ID_CG);

async function showRawPricing() {
  try {
    console.log('🔍 Showing raw pricing_plans content...\n');

    const records = await base(process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG)
      .select({
        filterByFormula: `AND({language} = "en", FIND("dream-companion", ARRAYJOIN({slug (from companion)})))`,
        maxRecords: 1
      })
      .all();

    if (records.length > 0) {
      const fields = records[0].fields;
      console.log('=== RAW pricing_plans CONTENT ===');
      console.log(fields.pricing_plans);
      console.log('\n=== TYPE ===');
      console.log(typeof fields.pricing_plans);
      console.log('\n=== LENGTH ===');
      console.log(fields.pricing_plans ? fields.pricing_plans.length : 0);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

showRawPricing();
