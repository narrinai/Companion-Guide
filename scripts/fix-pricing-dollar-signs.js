const Airtable = require('airtable');
require('dotenv').config();

/**
 * Fix pricing plans in NL and PT - add dollar signs to prices
 *
 * Current issue: Prices show as "19.99" instead of "$19.99"
 * This script adds $ prefix to all numeric prices in NL and PT translations
 *
 * Usage: node scripts/fix-pricing-dollar-signs.js
 */

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

async function fixPricingDollarSigns() {
  console.log('\n💲 Fixing pricing plans - adding dollar signs...\n');

  try {
    // Get all NL and PT translations
    const translations = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: 'OR({language} = "nl", {language} = "pt")',
        fields: ['language', 'name (from companion)', 'slug (from companion)', 'pricing_plans']
      })
      .all();

    console.log(`✅ Found ${translations.length} translations to check\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const translation of translations) {
      const name = translation.fields['name (from companion)']?.[0] || 'Unknown';
      const lang = translation.fields.language || 'unknown';
      const pricingPlans = translation.fields.pricing_plans;

      if (!pricingPlans) {
        skipped++;
        continue;
      }

      try {
        let plans = typeof pricingPlans === 'string' ? JSON.parse(pricingPlans) : pricingPlans;
        let changed = false;

        // Fix each plan's price
        plans = plans.map(plan => {
          if (typeof plan.price === 'number' && plan.price > 0) {
            // Add dollar sign if not already present
            plan.price = `$${plan.price}`;
            changed = true;
          } else if (typeof plan.price === 'string' && !plan.price.startsWith('$') && !isNaN(parseFloat(plan.price))) {
            // If it's a string number without $, add $
            plan.price = `$${plan.price}`;
            changed = true;
          } else if (plan.price === 0 || plan.price === '0') {
            // Free tier - keep as is or make it "Gratis" / "Free"
            plan.price = lang === 'nl' ? 'Gratis' : (lang === 'pt' ? 'Grátis' : 'Free');
            changed = true;
          }
          return plan;
        });

        if (changed) {
          // Update the record
          await base(TRANSLATIONS_TABLE).update([
            {
              id: translation.id,
              fields: {
                pricing_plans: JSON.stringify(plans)
              }
            }
          ]);

          console.log(`✅ Updated: ${name} (${lang})`);
          updated++;

          // Small delay
          await new Promise(resolve => setTimeout(resolve, 200));
        } else {
          console.log(`⏭️  Already correct: ${name} (${lang})`);
          skipped++;
        }

      } catch (error) {
        console.error(`❌ Error processing ${name} (${lang}): ${error.message}`);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped (no pricing or already correct): ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

fixPricingDollarSigns().then(() => {
  console.log('🎉 Pricing fix complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
