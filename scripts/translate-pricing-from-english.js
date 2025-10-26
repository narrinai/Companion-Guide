const Airtable = require('airtable');
require('dotenv').config();

/**
 * Translate pricing_plans from English Companions table to NL/PT
 *
 * Takes clean English pricing_plans and translates them properly,
 * preserving tech terms like NSFW, messages, chat, etc.
 *
 * Usage: node scripts/translate-pricing-from-english.js
 */

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const COMPANIONS_TABLE_ID = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE_ID = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

if (!COMPANIONS_TABLE_ID || !TRANSLATIONS_TABLE_ID) {
  console.error('❌ Required environment variables not set');
  process.exit(1);
}

/**
 * Translate text from English to NL/PT while preserving tech terms
 */
function translateText(text, lang) {
  if (!text || lang === 'en') return text;

  let translated = text;

  if (lang === 'nl') {
    // Plan names
    translated = translated.replace(/\bFree\s+Tier\b/g, 'Gratis Tier');
    translated = translated.replace(/\bFree\s+Plan\b/g, 'Gratis Plan');
    translated = translated.replace(/\bFree\s+Trial\b/g, 'Gratis Proefversie');
    translated = translated.replace(/\bFree\b(?!\s+(Dream\s+)?Coins)/g, 'Gratis');
    translated = translated.replace(/\bBasic\s+Plan\b/g, 'Basis Plan');
    translated = translated.replace(/\bStandard\s+Plan\b/g, 'Standaard Plan');
    translated = translated.replace(/\bPremium\s+Plan\b/g, 'Premium Plan');
    translated = translated.replace(/\bUltimate\s+Plan\b/g, 'Ultimate Plan');
    translated = translated.replace(/\bMonthly\b/g, 'Maandelijks');
    translated = translated.replace(/\bYearly\b/g, 'Jaarlijks');
    translated = translated.replace(/\bAnnual\b/g, 'Jaarlijks');

    // General words
    translated = translated.replace(/\bUnlimited\b/g, 'Onbeperkt');
    translated = translated.replace(/\bLimited\b/g, 'Beperkt');
    translated = translated.replace(/\bBasic\b/g, 'Basis');
    translated = translated.replace(/\bStandard\b/g, 'Standaard');
    translated = translated.replace(/\bAdvanced\b/g, 'Geavanceerd');
    translated = translated.replace(/\bCreate\b/g, 'Maak');
    translated = translated.replace(/\byour\s+own\b/g, 'je eigen');
    translated = translated.replace(/\bMore\b/g, 'Meer');
    translated = translated.replace(/\bUltra\s+fast\b/g, 'Ultra snel');
    translated = translated.replace(/\bFast\b/g, 'Snel');
    translated = translated.replace(/\bPriority\b/g, 'Prioriteit');
    translated = translated.replace(/\bBilled\s+yearly?\s+at\b/g, 'Jaarlijks gefactureerd op');
    translated = translated.replace(/\bper\s+year\b/g, 'per jaar');
    translated = translated.replace(/\bper\s+month\b/g, 'per maand');
    translated = translated.replace(/\bdaily\b/g, 'dagelijks');
    translated = translated.replace(/\bDaily\b/g, 'Dagelijks');

  } else if (lang === 'pt') {
    // Plan names
    translated = translated.replace(/\bFree\s+Tier\b/g, 'Nível Gratuito');
    translated = translated.replace(/\bFree\s+Plan\b/g, 'Plano Gratuito');
    translated = translated.replace(/\bFree\s+Trial\b/g, 'Teste Gratuito');
    translated = translated.replace(/\bFree\b(?!\s+(Dream\s+)?Coins)/g, 'Grátis');
    translated = translated.replace(/\bBasic\s+Plan\b/g, 'Plano Básico');
    translated = translated.replace(/\bStandard\s+Plan\b/g, 'Plano Padrão');
    translated = translated.replace(/\bPremium\s+Plan\b/g, 'Plano Premium');
    translated = translated.replace(/\bUltimate\s+Plan\b/g, 'Plano Ultimate');
    translated = translated.replace(/\bMonthly\b/g, 'Mensal');
    translated = translated.replace(/\bYearly\b/g, 'Anual');
    translated = translated.replace(/\bAnnual\b/g, 'Anual');

    // General words
    translated = translated.replace(/\bUnlimited\b/g, 'Ilimitado');
    translated = translated.replace(/\bLimited\b/g, 'Limitado');
    translated = translated.replace(/\bBasic\b/g, 'Básico');
    translated = translated.replace(/\bStandard\b/g, 'Padrão');
    translated = translated.replace(/\bAdvanced\b/g, 'Avançado');
    translated = translated.replace(/\bCreate\b/g, 'Criar');
    translated = translated.replace(/\byour\s+own\b/g, 'seus próprios');
    translated = translated.replace(/\bMore\b/g, 'Mais');
    translated = translated.replace(/\bUltra\s+fast\b/g, 'Ultra rápido');
    translated = translated.replace(/\bFast\b/g, 'Rápido');
    translated = translated.replace(/\bPriority\b/g, 'Prioritário');
    translated = translated.replace(/\bBilled\s+yearly?\s+at\b/g, 'Cobrado anualmente em');
    translated = translated.replace(/\bper\s+year\b/g, 'por ano');
    translated = translated.replace(/\bper\s+month\b/g, 'por mês');
    translated = translated.replace(/\bdaily\b/g, 'diário');
    translated = translated.replace(/\bDaily\b/g, 'Diário');
  }

  return translated;
}

/**
 * Translate pricing plans array
 */
function translatePricingPlans(englishPlansJson, lang) {
  if (!englishPlansJson || lang === 'en') return englishPlansJson;

  try {
    let plans;
    if (typeof englishPlansJson === 'string') {
      plans = JSON.parse(englishPlansJson);

      // Handle double-encoded JSON (string of string)
      if (typeof plans === 'string') {
        plans = JSON.parse(plans);
      }
    } else {
      plans = englishPlansJson;
    }

    if (!Array.isArray(plans)) {
      return englishPlansJson;
    }

    const translatedPlans = plans.map(plan => {
      const translated = { ...plan };

      // Translate plan name
      if (translated.name) {
        translated.name = translateText(translated.name, lang);
      }

      // Translate features
      if (Array.isArray(translated.features)) {
        translated.features = translated.features.map(feature =>
          translateText(feature, lang)
        );
      }

      return translated;
    });

    return JSON.stringify(translatedPlans);

  } catch (error) {
    console.error('Error translating pricing_plans:', error);
    return englishPlansJson;
  }
}

/**
 * Main function
 */
async function translateAllPricingPlans() {
  console.log('🚀 Translating pricing_plans from English source...\n');

  try {
    // Step 1: Fetch all English companions with pricing_plans
    console.log('📥 Fetching English companions...');
    const companionRecords = await base(COMPANIONS_TABLE_ID)
      .select({
        filterByFormula: '{status} = "Active"',
        maxRecords: 1000
      })
      .all();

    console.log(`Found ${companionRecords.length} active companions\n`);

    // Create map of companion ID -> pricing_plans
    const companionPricingMap = new Map();
    companionRecords.forEach(record => {
      if (record.fields.pricing_plans) {
        companionPricingMap.set(record.id, record.fields.pricing_plans);
      }
    });

    // Step 2: Fetch all NL/PT translation records
    console.log('📥 Fetching NL/PT translations...');
    const translationRecords = await base(TRANSLATIONS_TABLE_ID)
      .select({
        filterByFormula: 'OR({language} = "nl", {language} = "pt")',
        maxRecords: 1000
      })
      .all();

    console.log(`Found ${translationRecords.length} NL/PT translation records\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Step 3: Update each translation with translated pricing_plans
    for (const record of translationRecords) {
      const fields = record.fields;
      const companionName = fields['name (from companion)']?.[0] || 'Unknown';
      const language = fields.language || 'unknown';
      const companionId = fields.companion?.[0];

      try {
        if (!companionId) {
          console.log(`⏭️  ${companionName} (${language}): No companion link`);
          skippedCount++;
          continue;
        }

        const englishPricing = companionPricingMap.get(companionId);
        if (!englishPricing) {
          console.log(`⏭️  ${companionName} (${language}): No English pricing_plans`);
          skippedCount++;
          continue;
        }

        // Translate from English to target language
        const translatedPricing = translatePricingPlans(englishPricing, language);

        // Update the record
        await base(TRANSLATIONS_TABLE_ID).update(record.id, {
          pricing_plans: translatedPricing
        });

        console.log(`✅ ${companionName} (${language}): Translated pricing_plans`);

        // Show sample
        try {
          const parsed = JSON.parse(translatedPricing);
          if (parsed[0]) {
            console.log(`   Sample: ${parsed[0].name}`);
          }
        } catch (e) {
          // Silent fail
        }
        console.log('');

        updatedCount++;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ ${companionName} (${language}): ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total processed: ${translationRecords.length}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
translateAllPricingPlans().then(() => {
  console.log('\n🎉 Done!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
