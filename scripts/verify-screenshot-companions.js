const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

async function verify() {
  const companions = ['GirlfriendGPT', 'Hammer AI', 'SpicyChat', 'Lovescape', 'SoulGen AI', 'JOI AI', 'Ourdream AI', 'Secrets AI'];
  
  console.log('🔍 Verifying companions from screenshot (NL):\n');
  
  for (const name of companions) {
    const translations = await base(process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG)
      .select({
        filterByFormula: `AND({language} = "nl", FIND("${name}", {name (from companion)}))`,
        maxRecords: 1
      })
      .all();
      
    if (translations[0] && translations[0].fields.pricing_plans) {
      const pricing = translations[0].fields.pricing_plans;
      const plans = JSON.parse(pricing);
      if (Array.isArray(plans) && plans[0]) {
        console.log(`✅ ${name}: "${plans[0].name}"`);
      }
    }
    
    await new Promise(r => setTimeout(r, 100));
  }
}

verify().then(() => process.exit(0));
