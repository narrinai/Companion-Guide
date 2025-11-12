const Airtable = require('airtable');

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
  .base(process.env.AIRTABLE_BASE_ID_CG);

async function checkDreamCompanionPricing() {
  try {
    console.log('🔍 Checking Dream Companion pricing...\n');

    // Check in Companion_Translations (EN)
    console.log('=== COMPANION_TRANSLATIONS (EN) ===');
    const translationRecords = await base(process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG)
      .select({
        filterByFormula: `AND({language} = "en", FIND("dream-companion", ARRAYJOIN({slug (from companion)})))`,
        maxRecords: 1
      })
      .all();

    if (translationRecords.length > 0) {
      const fields = translationRecords[0].fields;
      console.log(`✅ Record found (${translationRecords[0].id})`);
      console.log(`   pricing_plans field exists: ${fields.pricing_plans ? 'YES' : 'NO'}`);

      if (fields.pricing_plans) {
        let plans = fields.pricing_plans;
        if (typeof plans === 'string') {
          try {
            plans = JSON.parse(plans);
            console.log(`   Number of plans: ${plans.length}`);
            plans.forEach((p, i) => {
              console.log(`   ${i + 1}. ${p.name} - ${p.price}`);
            });
          } catch (e) {
            console.log(`   ⚠️ Failed to parse JSON`);
          }
        } else if (Array.isArray(plans)) {
          console.log(`   Number of plans: ${plans.length}`);
          plans.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name} - ${p.price}`);
          });
        }
      } else {
        console.log(`   ⚠️ No pricing_plans field`);
      }
    } else {
      console.log('❌ No EN translation found');
    }

    // Check in Table 1
    console.log('\n=== TABLE 1 (Base Companions) ===');
    const companionRecords = await base(process.env.AIRTABLE_TABLE_ID_CG)
      .select({
        filterByFormula: `{slug} = 'dream-companion'`,
        maxRecords: 1
      })
      .all();

    if (companionRecords.length > 0) {
      const fields = companionRecords[0].fields;
      console.log(`✅ Found Dream Companion in Table 1`);
      console.log(`   pricing_plans field exists: ${fields.pricing_plans ? 'YES' : 'NO'}`);

      if (fields.pricing_plans) {
        let plans = fields.pricing_plans;
        if (typeof plans === 'string') {
          try {
            plans = JSON.parse(plans);
            console.log(`   Number of plans: ${plans.length}`);
            plans.forEach((p, i) => {
              console.log(`   ${i + 1}. ${p.name} - ${p.price}`);
            });
          } catch (e) {
            console.log(`   ⚠️ Failed to parse JSON`);
          }
        } else if (Array.isArray(plans)) {
          console.log(`   Number of plans: ${plans.length}`);
          plans.forEach((p, i) => {
            console.log(`   ${i + 1}. ${p.name} - ${p.price}`);
          });
        }
      } else {
        console.log(`   ⚠️ No pricing_plans field`);
      }
    } else {
      console.log('❌ Dream Companion not found in Table 1');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDreamCompanionPricing();
