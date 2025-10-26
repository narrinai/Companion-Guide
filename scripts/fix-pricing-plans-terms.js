const Airtable = require('airtable');
require('dotenv').config();

/**
 * Fix pricing_plans in Airtable Companion_Translations to preserve English tech terms
 *
 * Keeps English: NSFW, messages, features, characters, chat, voice messages, etc.
 * Translates only: tier names, basic connector words
 *
 * Usage: node scripts/fix-pricing-plans-terms.js
 */

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE_ID = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

if (!TRANSLATIONS_TABLE_ID) {
  console.error('❌ AIRTABLE_TRANSLATIONS_TABLE_ID_CG not set in .env');
  process.exit(1);
}

/**
 * Fix pricing plan text to preserve English terms
 */
function fixPricingPlanText(text, lang) {
  if (!text) return text;

  let fixed = text;

  // Keep these terms in English for both NL and PT
  const replacements = [
    // Features
    { from: /\btext\s*berichten/gi, to: 'text messages' },
    { from: /\bmensagens\s*de\s*texto/gi, to: 'text messages' },
    { from: /\bonbeperkte?\s*berichten/gi, to: 'Unlimited messages' },
    { from: /\bmensagens\s*ilimitadas/gi, to: 'Unlimited messages' },

    // NSFW
    { from: /\bNSFW\s*video\s*generatie/gi, to: 'NSFW video generation' },
    { from: /\bgera[çc][ãa]o\s*de\s*v[íi]deo\s*NSFW/gi, to: 'NSFW video generation' },
    { from: /\bNSFW\s*inhoud/gi, to: 'NSFW content' },
    { from: /\bconte[úu]do\s*NSFW/gi, to: 'NSFW content' },

    // Characters
    { from: /\bkarakter\s*interacties/gi, to: 'character interactions' },
    { from: /\bintera[çc][õo]es\s*de\s*personagens/gi, to: 'character interactions' },
    { from: /\bMaak\s*je\s*eigen\s*karakters?/gi, to: 'Create your own characters' },
    { from: /\bCrie\s*seus\s*pr[óo]prios\s*personagens/gi, to: 'Create your own characters' },

    // Images
    { from: /\bOngecensureerde\s*in[-\s]chat\s*afbeeldingen/gi, to: 'Uncensored in-chat images' },
    { from: /\bImagens\s*uncensored\s*no\s*chat/gi, to: 'Uncensored in-chat images' },
    { from: /\bafbeeldingen\s*in\s*chat/gi, to: 'in-chat images' },
    { from: /\bimagens\s*no\s*chat/gi, to: 'in-chat images' },

    // Voice
    { from: /\bStem\s*berichten/gi, to: 'Voice messages' },
    { from: /\bMensagens\s*de\s*voz/gi, to: 'Voice messages' },
    { from: /\bUltra\s*snelle\s*stem\s*berichten/gi, to: 'Ultra fast voice messages' },
    { from: /\bMensagens\s*de\s*voz\s*ultra\s*r[áa]pidas/gi, to: 'Ultra fast voice messages' },

    // Memory/Chat
    { from: /\bStandaard\s*chat\s*geheugen/gi, to: 'Standard chat memory' },
    { from: /\bMem[óo]ria\s*de\s*chat\s*padr[ãa]o/gi, to: 'Standard chat memory' },
    { from: /\bUltra\s*lange[-\s]termijn\s*chat\s*geheugen/gi, to: 'Ultra long-term chat memory' },
    { from: /\bMem[óo]ria\s*de\s*chat\s*ultra\s*longo\s*prazo/gi, to: 'Ultra long-term chat memory' },

    // Response time
    { from: /\bPrioriteit\s*responstijd/gi, to: 'Priority response time' },
    { from: /\bTempo\s*de\s*resposta\s*priorit[áa]rio/gi, to: 'Priority response time' },

    // Community
    { from: /\bGemeenschaps\s*functies/gi, to: 'Community features' },
    { from: /\bRecursos\s*da\s*comunidade/gi, to: 'Community features' },

    // Coins/Credits
    { from: /\bDREAM\s*Coins?/gi, to: 'Dream Coins' },
    { from: /\bGRATIS\s*Dream\s*Coins/gi, to: 'FREE Dream Coins' },
    { from: /\bDream\s*Coins\s*gr[áa]tis/gi, to: 'FREE Dream Coins' },

    // Limited/Basic
    { from: /\bBeperkte\s*text\s*berichten/gi, to: 'Limited text messages' },
    { from: /\bMensagens\s*de\s*texto\s*limitadas/gi, to: 'Limited text messages' },
    { from: /\bBasis\s*karakter\s*interacties/gi, to: 'Basic character interactions' },
    { from: /\bIntera[çc][õo]es\s*b[áa]sicas\s*de\s*personagens/gi, to: 'Basic character interactions' },

    // Billed
    { from: /\bGefactureerd\s*jaar/gi, to: 'Billed yearly' },
    { from: /\bCobrado\s*anualmente/gi, to: 'Billed yearly' },
    { from: /\bper\s*jaar/gi, to: 'per year' },
    { from: /\bpor\s*ano/gi, to: 'per year' }
  ];

  for (const { from, to } of replacements) {
    fixed = fixed.replace(from, to);
  }

  return fixed;
}

/**
 * Fix pricing plans JSON
 */
function fixPricingPlans(pricingPlansJson, lang) {
  if (!pricingPlansJson) return pricingPlansJson;

  try {
    let plans;
    if (typeof pricingPlansJson === 'string') {
      plans = JSON.parse(pricingPlansJson);
    } else {
      plans = pricingPlansJson;
    }

    if (!Array.isArray(plans)) return pricingPlansJson;

    // Fix each plan
    const fixedPlans = plans.map(plan => {
      const fixedPlan = { ...plan };

      // Fix plan name
      if (fixedPlan.name) {
        fixedPlan.name = fixPricingPlanText(fixedPlan.name, lang);
      }

      // Fix features array
      if (Array.isArray(fixedPlan.features)) {
        fixedPlan.features = fixedPlan.features.map(feature =>
          fixPricingPlanText(feature, lang)
        );
      }

      return fixedPlan;
    });

    return JSON.stringify(fixedPlans);

  } catch (error) {
    console.error('Error parsing pricing_plans:', error);
    return pricingPlansJson;
  }
}

/**
 * Main function
 */
async function fixAllPricingPlans() {
  console.log('🚀 Starting pricing_plans term fixes...\n');

  try {
    // Fetch all NL and PT records
    const records = await base(TRANSLATIONS_TABLE_ID)
      .select({
        filterByFormula: 'OR({language} = "nl", {language} = "pt")',
        maxRecords: 1000
      })
      .all();

    console.log(`📊 Found ${records.length} NL/PT translation records\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const record of records) {
      const fields = record.fields;
      const companionName = fields['name (from companion)']?.[0]
        || fields['slug (from companion)']?.[0]
        || 'Unknown';
      const language = fields.language || 'unknown';

      try {
        const originalPlans = fields.pricing_plans;
        if (!originalPlans) {
          console.log(`⏭️  ${companionName} (${language}): No pricing_plans`);
          skippedCount++;
          continue;
        }

        const fixedPlans = fixPricingPlans(originalPlans, language);

        if (originalPlans === fixedPlans) {
          console.log(`⏭️  ${companionName} (${language}): No changes needed`);
          skippedCount++;
          continue;
        }

        // Update the record
        await base(TRANSLATIONS_TABLE_ID).update(record.id, {
          pricing_plans: fixedPlans
        });

        console.log(`✅ ${companionName} (${language}): Updated pricing_plans`);

        // Show sample of changes
        try {
          const parsed = JSON.parse(fixedPlans);
          if (parsed[0]) {
            console.log(`   Sample plan: ${parsed[0].name}`);
            if (parsed[0].features && parsed[0].features[0]) {
              console.log(`   Sample feature: ${parsed[0].features[0]}`);
            }
          }
        } catch (e) {
          // Silent fail
        }
        console.log('');

        updatedCount++;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ ${companionName} (${language}): Error - ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total processed: ${records.length}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
fixAllPricingPlans().then(() => {
  console.log('\n🎉 Done!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
