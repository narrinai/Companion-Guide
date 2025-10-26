const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

async function test() {
  const checks = [
    { name: 'Dream Companion', lang: 'nl' },
    { name: 'eHentai AI', lang: 'pt' },
    { name: 'Fantasy AI', lang: 'nl' },
    { name: 'Crushon AI', lang: 'pt' },
    { name: 'Nextpart AI', lang: 'nl' }
  ];
  
  console.log('🔍 Checking pricing_plans translations:\n');
  
  for (const check of checks) {
    const translations = await base(process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG)
      .select({
        filterByFormula: `AND({language} = "${check.lang}", FIND("${check.name}", {name (from companion)}))`,
        maxRecords: 1
      })
      .all();
      
    if (translations[0] && translations[0].fields.pricing_plans) {
      const plans = JSON.parse(translations[0].fields.pricing_plans);
      if (Array.isArray(plans) && plans[0]) {
        console.log(`✅ ${check.name} (${check.lang}):`);
        console.log(`   First plan: "${plans[0].name}"`);
        if (plans[0].features && plans[0].features[0]) {
          console.log(`   First feature: "${plans[0].features[0]}"`);
        }
        console.log('');
      }
    }
  }
}

test().then(() => process.exit(0));
