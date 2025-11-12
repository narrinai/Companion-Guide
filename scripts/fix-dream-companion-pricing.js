const Airtable = require('airtable');

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
  .base(process.env.AIRTABLE_BASE_ID_CG);

async function fixDreamCompanionPricing() {
  try {
    console.log('🔧 Fixing Dream Companion pricing_plans...\n');

    // Find the EN record
    const records = await base(process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG)
      .select({
        filterByFormula: `AND({language} = "en", FIND("dream-companion", ARRAYJOIN({slug (from companion)})))`,
        maxRecords: 1
      })
      .all();

    if (records.length === 0) {
      console.log('❌ No EN record found');
      return;
    }

    const record = records[0];
    const oldValue = record.fields.pricing_plans;

    console.log('📋 Current value (first 100 chars):');
    console.log(oldValue.substring(0, 100));
    console.log('\n🔧 Removing outer quotes...\n');

    // Remove the outer quotes if present
    let fixedValue = oldValue;
    if (fixedValue.startsWith('"') && fixedValue.endsWith('"')) {
      fixedValue = fixedValue.substring(1, fixedValue.length - 1);
    }

    // Remove newlines and extra whitespace that break JSON
    fixedValue = fixedValue.replace(/\n\s+/g, ' ');
    fixedValue = fixedValue.replace(/\s+/g, ' ');

    // Test if it's valid JSON now
    try {
      const parsed = JSON.parse(fixedValue);
      console.log(`✅ Valid JSON after fix! (${parsed.length} plans)`);

      // Update in Airtable
      await base(process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG).update([
        {
          id: record.id,
          fields: {
            pricing_plans: fixedValue
          }
        }
      ]);

      console.log('\n✅ Updated pricing_plans in Airtable!');
      console.log('📋 Plans:');
      parsed.forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.name} - $${p.price}/${p.period}`);
      });

    } catch (e) {
      console.error('❌ Still invalid JSON after removing quotes:', e.message);
      console.log('Fixed value:', fixedValue.substring(0, 200));
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixDreamCompanionPricing();
