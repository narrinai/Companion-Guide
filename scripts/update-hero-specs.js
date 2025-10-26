const Airtable = require('airtable');
require('dotenv').config();

/**
 * Update hero_specs field in Airtable Companion_Translations table
 *
 * This script extracts information from existing fields (description, pros_cons,
 * tagline, pricing_plans, body_text) and generates a hero_specs JSON object with:
 * - pricing: extracted from pricing_plans or description
 * - best_for: extracted from tagline or description
 * - platform: extracted from description or body_text
 * - content_policy: extracted from pros_cons or description
 *
 * Usage: node scripts/update-hero-specs.js
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
 * Translations for static text based on language
 */
const translations = {
  en: {
    free_with_premium: 'Free with premium options',
    from_price: 'From',
    per_month: '/month',
    see_pricing: 'See pricing page',
    ai_companion: 'AI companion experiences',
    web: 'Web',
    mobile_apps: 'Mobile Apps',
    nsfw_allowed: 'NSFW/Adult content allowed',
    family_friendly: 'Family-friendly (filtered)',
    moderated: 'Moderated content',
    check_policy: 'Check content policy'
  },
  nl: {
    free_with_premium: 'Gratis met premium opties',
    from_price: 'Vanaf',
    per_month: '/maand',
    see_pricing: 'Zie prijspagina',
    ai_companion: 'AI companion ervaringen',
    web: 'Web',
    mobile_apps: 'Mobiele apps',
    nsfw_allowed: 'NSFW/Adult content toegestaan',
    family_friendly: 'Gezinsvriendelijk (gefilterd)',
    moderated: 'Gemodereerd',
    check_policy: 'Bekijk content policy'
  },
  pt: {
    free_with_premium: 'Grátis com opções premium',
    from_price: 'A partir de',
    per_month: '/mês',
    see_pricing: 'Ver página de preços',
    ai_companion: 'AI companion experiences',
    web: 'Web',
    mobile_apps: 'Apps móveis',
    nsfw_allowed: 'NSFW/Adult content permitido',
    family_friendly: 'Family-friendly (filtrado)',
    moderated: 'Moderado',
    check_policy: 'Ver content policy'
  }
};

/**
 * Extract pricing information - use actual translated data from description/body_text
 */
function extractPricing(fields, lang = 'en') {
  const t = translations[lang] || translations.en;

  // Search for pricing information in description and body_text
  const text = `${fields.description || ''} ${fields.body_text || ''}`.toLowerCase();

  // Look for "free" mentions
  if (text.includes('free') || text.includes('gratis') || text.includes('gratuito')) {
    // Check if it's freemium
    if (text.includes('premium') || text.includes('paid') || text.includes('subscription')) {
      return t.free_with_premium;
    }
    return lang === 'en' ? 'Free' : (lang === 'nl' ? 'Gratis' : 'Gratuito');
  }

  // Look for price patterns
  const priceMatch = text.match(/[\$€£](\d+\.?\d*)/);
  if (priceMatch) {
    return `${t.from_price} ${priceMatch[0]}${t.per_month}`;
  }

  // Try pricing_plans as last resort
  if (fields.pricing_plans) {
    try {
      const plans = typeof fields.pricing_plans === 'string'
        ? JSON.parse(fields.pricing_plans)
        : fields.pricing_plans;

      if (Array.isArray(plans) && plans.length > 0) {
        const cheapest = plans.reduce((min, plan) => {
          const price = parseFloat(plan.price || 0);
          const minPrice = parseFloat(min.price || 0);
          return price < minPrice ? plan : min;
        });

        if (cheapest.price === '0' || cheapest.price === 0) {
          return t.free_with_premium;
        }
        return `${t.from_price} $${cheapest.price}${t.per_month}`;
      }
    } catch (e) {
      // Silent fail
    }
  }

  return t.free_with_premium; // Better default than "see pricing"
}

/**
 * Extract "best for" - use tagline (already translated in Airtable)
 */
function extractBestFor(fields, lang = 'en') {
  const t = translations[lang] || translations.en;

  // Tagline is already translated per language in the Translations table
  if (fields.tagline) {
    return fields.tagline;
  }

  // Fall back to first sentence of description (also translated)
  if (fields.description) {
    const firstSentence = fields.description.split(/[.!?]/)[0].trim();
    if (firstSentence && firstSentence.length <= 120) {
      return firstSentence;
    }
    if (fields.description.length <= 120) {
      return fields.description.trim();
    }
    return fields.description.substring(0, 117).trim() + '...';
  }

  return t.ai_companion;
}

/**
 * Extract platform - detect from translated content
 */
function extractPlatform(fields, lang = 'en') {
  const t = translations[lang] || translations.en;
  const text = `${fields.body_text || ''} ${fields.description || ''}`.toLowerCase();

  const platforms = [];

  // Check for platform mentions
  if (text.includes('web') || text.includes('browser') || text.includes('navegador')) {
    platforms.push(t.web);
  }
  if (text.includes('ios') || text.includes('iphone') || text.includes('app store')) {
    platforms.push('iOS');
  }
  if (text.includes('android') || text.includes('google play') || text.includes('play store')) {
    platforms.push('Android');
  }
  if (text.includes('desktop') || text.includes('windows') || text.includes('mac') || text.includes('computador')) {
    platforms.push('Desktop');
  }

  // If we found specific platforms, return them
  if (platforms.length > 0) {
    return platforms.join(' & ');
  }

  // Check for generic "mobile" mentions
  if (text.includes('mobile') || text.includes('app') || text.includes('aplicativo') || text.includes('mobiel')) {
    return t.mobile_apps;
  }

  // Default to web & mobile
  return `${t.web} & ${t.mobile_apps}`;
}

/**
 * Extract content policy - detect from translated content
 */
function extractContentPolicy(fields, lang = 'en') {
  const t = translations[lang] || translations.en;
  const text = `${fields.pros_cons || ''} ${fields.description || ''}`.toLowerCase();

  // Check for NSFW/adult content mentions
  if (text.includes('nsfw') || text.includes('uncensored') || text.includes('adult') ||
      text.includes('sem censura') || text.includes('ongecensureerd') || text.includes('volwassen') ||
      text.includes('adulto') || text.includes('18+')) {
    return t.nsfw_allowed;
  }

  // Check for family-friendly mentions
  if (text.includes('sfw') || text.includes('family-friendly') || text.includes('safe') ||
      text.includes('filtered') || text.includes('gezinsvriendelijk') || text.includes('família')) {
    return t.family_friendly;
  }

  // Check for moderation mentions
  if (text.includes('moderat') || text.includes('gemodereerde')) {
    return t.moderated;
  }

  // Default: assume moderated if no clear indicator
  return t.moderated;
}

/**
 * Generate hero_specs JSON object
 */
function generateHeroSpecs(fields, lang = 'en') {
  return {
    pricing: extractPricing(fields, lang),
    best_for: extractBestFor(fields, lang),
    platform: extractPlatform(fields, lang),
    content_policy: extractContentPolicy(fields, lang)
  };
}

/**
 * Main function to update all translation records
 */
async function updateAllHeroSpecs() {
  console.log('🚀 Starting hero_specs update...\n');

  try {
    // Fetch all translation records
    const records = await base(TRANSLATIONS_TABLE_ID)
      .select({
        maxRecords: 1000
      })
      .all();

    console.log(`📊 Found ${records.length} translation records\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const record of records) {
      const fields = record.fields;
      // companion is a linked record (array of record IDs)
      // Try to get name from lookup field or use slug
      const companionName = fields['name (from companion)']?.[0]
        || fields['slug (from companion)']?.[0]
        || (fields.companion ? `ID: ${fields.companion[0]}` : 'Unknown');
      const language = fields.language || 'unknown';

      try {
        // Generate hero_specs with correct language
        const heroSpecs = generateHeroSpecs(fields, language);
        const heroSpecsJson = JSON.stringify(heroSpecs, null, 2);

        // Check if hero_specs already exists and is the same
        if (fields.hero_specs === heroSpecsJson) {
          console.log(`⏭️  ${companionName} (${language}): Already up to date`);
          skippedCount++;
          continue;
        }

        // Update the record
        await base(TRANSLATIONS_TABLE_ID).update(record.id, {
          hero_specs: heroSpecsJson
        });

        console.log(`✅ ${companionName} (${language}): Updated`);
        console.log(`   ${JSON.stringify(heroSpecs)}\n`);
        updatedCount++;

        // Rate limiting - wait 200ms between updates to avoid hitting Airtable limits
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ ${companionName} (${language}): Error - ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Skipped (already up to date): ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total processed: ${records.length}`);

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
updateAllHeroSpecs().then(() => {
  console.log('\n🎉 Done!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
