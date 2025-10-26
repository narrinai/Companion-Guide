const Airtable = require('airtable');
require('dotenv').config();

/**
 * Fix tagline translations in Airtable to use common English terms
 * instead of literal translations
 *
 * Replaces:
 * - "AI-vriendinnenplatform" -> "AI girlfriend platform"
 * - "AI Karakterchat" -> "AI character chat"
 * - "AI-metgezel" -> "AI companion"
 * - etc.
 *
 * Usage: node scripts/fix-tagline-translations.js
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
 * Dutch term replacements - keep common English terms
 */
const dutchReplacements = [
  // AI terms
  { from: /AI[- ]?vriendinnen?platform/gi, to: 'AI girlfriend platform' },
  { from: /AI[- ]?vriendin(nen)?/gi, to: 'AI girlfriend' },
  { from: /AI[- ]?karakter(en)?chat/gi, to: 'AI character chat' },
  { from: /AI[- ]?karakter(en)?/gi, to: 'AI character' },
  { from: /AI[- ]?metgeze(l|llen)/gi, to: 'AI companion' },
  { from: /AI[- ]?gezel(len)?/gi, to: 'AI companion' },
  { from: /AI[- ]?personage(s)?/gi, to: 'AI character' },
  { from: /karakterchat/gi, to: 'character chat' },

  // Platform/content terms (keep English)
  { from: /\bweb\s*&\s*mobiele\s*apps?\b/gi, to: 'Web & Mobile apps' },
  { from: /\bmobiele\s*apps?\b/gi, to: 'mobile apps' },
  { from: /\bdesktop\b/gi, to: 'Desktop' },

  // Content types
  { from: /\bNSFW[\/\s]*volwassen\s*inhoud/gi, to: 'NSFW/Adult content' },
  { from: /\bvolwassen\s*inhoud/gi, to: 'adult content' },
  { from: /\bongecensureerde?/gi, to: 'uncensored' },
  { from: /\bzonder\s*censuur/gi, to: 'uncensored' },

  // Features
  { from: /\bspraakoproep(en)?/gi, to: 'voice calls' },
  { from: /\bspraakberichten/gi, to: 'voice messages' },
  { from: /\bbeeldgeneratie/gi, to: 'image generation' },
  { from: /\bvideogeneratie/gi, to: 'video generation' },
  { from: /\brollenspel/gi, to: 'roleplay' },
  { from: /\baanpasbare?/gi, to: 'customizable' },
  { from: /\bgepersonaliseerde?/gi, to: 'personalized' }
];

/**
 * Portuguese term replacements - keep common English terms
 */
const portugueseReplacements = [
  // AI terms
  { from: /AI[- ]?namorada(s)?/gi, to: 'AI girlfriend' },
  { from: /\bnamorada\s*AI/gi, to: 'AI girlfriend' },
  { from: /plataforma\s*de\s*AI[- ]?namorada/gi, to: 'AI girlfriend platform' },
  { from: /\bpersonagens?\s*AI/gi, to: 'AI character' },
  { from: /\bpersonagens?\s*de\s*AI/gi, to: 'AI character' },
  { from: /chat\s*de\s*personagens?\s*AI/gi, to: 'AI character chat' },
  { from: /\bcompanheiro\s*AI/gi, to: 'AI companion' },
  { from: /\bcompanion\s*AI/gi, to: 'AI companion' },

  // Platform/content terms
  { from: /\bweb\s*&\s*apps?\s*m[óo]veis/gi, to: 'Web & Mobile apps' },
  { from: /\bweb\s*e\s*apps?\s*m[óo]veis/gi, to: 'Web & Mobile apps' },
  { from: /\bapps?\s*m[óo]veis/gi, to: 'mobile apps' },
  { from: /\baplicativos?\s*m[óo]veis/gi, to: 'mobile apps' },

  // Content types
  { from: /\bNSFW[\/\s]*conte[úu]do\s*adulto/gi, to: 'NSFW/Adult content' },
  { from: /\bconte[úu]do\s*adulto/gi, to: 'adult content' },
  { from: /\bsem\s*censura/gi, to: 'uncensored' },

  // Features
  { from: /\bchamadas\s*de\s*voz/gi, to: 'voice calls' },
  { from: /\bmensagens\s*de\s*voz/gi, to: 'voice messages' },
  { from: /\bgera[çc][ãa]o\s*de\s*imagens?/gi, to: 'image generation' },
  { from: /\bgera[çc][ãa]o\s*de\s*v[íi]deos?/gi, to: 'video generation' },
  { from: /\bpersonaliz[áa]vel/gi, to: 'customizable' },
  { from: /\bpersonalizado/gi, to: 'personalized' }
];

/**
 * Apply replacements to text
 */
function fixTranslation(text, language) {
  if (!text) return text;

  const replacements = language === 'nl' ? dutchReplacements : portugueseReplacements;
  let fixed = text;

  for (const { from, to } of replacements) {
    fixed = fixed.replace(from, to);
  }

  return fixed;
}

/**
 * Main function to fix all tagline translations
 */
async function fixAllTaglines() {
  console.log('🚀 Starting tagline translation fix...\n');

  try {
    // Fetch all NL and PT translation records
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
        const originalTagline = fields.tagline || '';
        const fixedTagline = fixTranslation(originalTagline, language);

        // Check if tagline changed
        if (originalTagline === fixedTagline) {
          console.log(`⏭️  ${companionName} (${language}): No changes needed`);
          skippedCount++;
          continue;
        }

        // Update the record
        await base(TRANSLATIONS_TABLE_ID).update(record.id, {
          tagline: fixedTagline
        });

        console.log(`✅ ${companionName} (${language}):`);
        console.log(`   Before: "${originalTagline}"`);
        console.log(`   After:  "${fixedTagline}"\n`);
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
fixAllTaglines().then(() => {
  console.log('\n🎉 Done!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
