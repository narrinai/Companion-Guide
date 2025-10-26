const Airtable = require('airtable');
require('dotenv').config();

/**
 * Fix ALL translation fields in Airtable to preserve common English tech terms
 *
 * Updates: description, best_for, tagline, meta_title, meta_description
 * Preserves: AI companion, NSFW, girlfriend, character, etc.
 *
 * Usage: node scripts/fix-all-translation-fields.js
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
 * Common term replacements for both NL and PT
 */
const commonReplacements = [
  // AI terms - keep English
  { from: /AI[- ]?vriendinnen?platform/gi, to: 'AI girlfriend platform' },
  { from: /AI[- ]?vriendin(nen)?/gi, to: 'AI girlfriend' },
  { from: /AI[- ]?namorada(s)?/gi, to: 'AI girlfriend' },
  { from: /\bnamorada\s*AI/gi, to: 'AI girlfriend' },
  { from: /plataforma\s*de\s*AI[- ]?namorada/gi, to: 'AI girlfriend platform' },

  { from: /AI[- ]?karakter(en)?chat/gi, to: 'AI character chat' },
  { from: /AI[- ]?karakter(en)?/gi, to: 'AI character' },
  { from: /\bpersonagens?\s*AI/gi, to: 'AI character' },
  { from: /\bpersonagens?\s*de\s*AI/gi, to: 'AI character' },
  { from: /chat\s*de\s*personagens?\s*AI/gi, to: 'AI character chat' },

  { from: /AI[- ]?metgeze(l|llen)/gi, to: 'AI companion' },
  { from: /AI[- ]?gezel(len)?/gi, to: 'AI companion' },
  { from: /\bcompanheiro\s*AI/gi, to: 'AI companion' },
  { from: /\bcompanion\s*AI/gi, to: 'AI companion' },

  { from: /AI[- ]?personage(s)?/gi, to: 'AI character' },
  { from: /karakterchat/gi, to: 'character chat' },

  // Content types - keep English
  { from: /\bNSFW[\/\s]*volwassen\s*inhoud/gi, to: 'NSFW/Adult content' },
  { from: /\bNSFW[\/\s]*conte[úu]do\s*adulto/gi, to: 'NSFW/Adult content' },
  { from: /\bvolwassen\s*inhoud/gi, to: 'adult content' },
  { from: /\bconte[úu]do\s*adulto/gi, to: 'adult content' },
  { from: /\bongecensureerde?/gi, to: 'uncensored' },
  { from: /\bzonder\s*censuur/gi, to: 'uncensored' },
  { from: /\bsem\s*censura/gi, to: 'uncensored' },

  // Features - keep English
  { from: /\bspraakoproep(en)?/gi, to: 'voice calls' },
  { from: /\bchamadas\s*de\s*voz/gi, to: 'voice calls' },
  { from: /\bspraakberichten/gi, to: 'voice messages' },
  { from: /\bmensagens\s*de\s*voz/gi, to: 'voice messages' },
  { from: /\bbeeldgeneratie/gi, to: 'image generation' },
  { from: /\bgera[çc][ãa]o\s*de\s*imagens?/gi, to: 'image generation' },
  { from: /\bvideogeneratie/gi, to: 'video generation' },
  { from: /\bgera[çc][ãa]o\s*de\s*v[íi]deos?/gi, to: 'video generation' },
  { from: /\brollenspel/gi, to: 'roleplay' },
  { from: /\baanpasbare?/gi, to: 'customizable' },
  { from: /\bpersonaliz[áa]vel/gi, to: 'customizable' },
  { from: /\bgepersonaliseerde?/gi, to: 'personalized' },
  { from: /\bpersonalizado/gi, to: 'personalized' },

  // Platform terms - keep English
  { from: /\bweb\s*&\s*mobiele\s*apps?\b/gi, to: 'Web & Mobile apps' },
  { from: /\bweb\s*e\s*apps?\s*m[óo]veis/gi, to: 'Web & Mobile apps' },
  { from: /\bmobiele\s*apps?\b/gi, to: 'mobile apps' },
  { from: /\bapps?\s*m[óo]veis/gi, to: 'mobile apps' },
  { from: /\baplicativos?\s*m[óo]veis/gi, to: 'mobile apps' }
];

/**
 * Apply all replacements to text
 */
function fixTranslation(text) {
  if (!text) return text;

  let fixed = text;

  for (const { from, to } of commonReplacements) {
    fixed = fixed.replace(from, to);
  }

  return fixed;
}

/**
 * Main function to fix all translation fields
 */
async function fixAllTranslationFields() {
  console.log('🚀 Starting translation field fixes for NL and PT...\n');

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
    let fieldUpdateCounts = {
      description: 0,
      best_for: 0,
      tagline: 0,
      meta_title: 0,
      meta_description: 0
    };

    for (const record of records) {
      const fields = record.fields;
      const companionName = fields['name (from companion)']?.[0]
        || fields['slug (from companion)']?.[0]
        || 'Unknown';
      const language = fields.language || 'unknown';

      try {
        const updates = {};
        let hasChanges = false;

        // Fields to update
        const fieldsToFix = ['description', 'best_for', 'tagline', 'meta_title', 'meta_description'];

        for (const fieldName of fieldsToFix) {
          const originalText = fields[fieldName] || '';
          if (!originalText) continue;

          const fixedText = fixTranslation(originalText);

          if (originalText !== fixedText) {
            updates[fieldName] = fixedText;
            hasChanges = true;
            fieldUpdateCounts[fieldName]++;
          }
        }

        if (!hasChanges) {
          console.log(`⏭️  ${companionName} (${language}): No changes needed`);
          skippedCount++;
          continue;
        }

        // Update the record
        await base(TRANSLATIONS_TABLE_ID).update(record.id, updates);

        console.log(`✅ ${companionName} (${language}): Updated ${Object.keys(updates).length} fields`);
        Object.keys(updates).forEach(field => {
          if (updates[field].length < 100) {
            console.log(`   ${field}: "${updates[field]}"`);
          } else {
            console.log(`   ${field}: "${updates[field].substring(0, 80)}..."`);
          }
        });
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
    console.log(`   ✅ Updated: ${updatedCount} records`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total processed: ${records.length}`);
    console.log('\n📋 Field Update Counts:');
    Object.entries(fieldUpdateCounts).forEach(([field, count]) => {
      console.log(`   ${field}: ${count} updates`);
    });

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
fixAllTranslationFields().then(() => {
  console.log('\n🎉 Done!');
  process.exit(0);
}).catch(error => {
  console.error('\n❌ Script failed:', error);
  process.exit(1);
});
