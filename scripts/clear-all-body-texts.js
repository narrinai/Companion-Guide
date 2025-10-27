const Airtable = require('airtable');
require('dotenv').config();

/**
 * Clear all body_text fields in Companion_Translations table
 *
 * This will set all body_text fields to empty string for EN, NL, and PT
 *
 * Usage: node scripts/clear-all-body-texts.js
 */

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

async function clearAllBodyTexts() {
  console.log('\n🗑️  Clearing all body_text fields...\n');

  try {
    // Get all translations (EN, NL, PT)
    const translations = await base(TRANSLATIONS_TABLE)
      .select({
        fields: ['language', 'name (from companion)', 'body_text', 'slug (from companion)']
      })
      .all();

    console.log(`✅ Found ${translations.length} total records\n`);

    let cleared = 0;
    let skipped = 0;

    for (const translation of translations) {
      const name = translation.fields['name (from companion)']?.[0] || 'Unknown';
      const lang = translation.fields.language || 'unknown';
      const bodyText = translation.fields.body_text;

      // Only clear if body_text exists
      if (bodyText && bodyText.trim().length > 0) {
        try {
          await base(TRANSLATIONS_TABLE).update([
            {
              id: translation.id,
              fields: {
                body_text: ''
              }
            }
          ]);

          console.log(`✅ Cleared: ${name} (${lang})`);
          cleared++;

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`❌ Error clearing ${name} (${lang}): ${error.message}`);
        }
      } else {
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Cleared: ${cleared}`);
    console.log(`   ⏭️  Already empty: ${skipped}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

clearAllBodyTexts().then(() => {
  console.log('🎉 All body_text fields cleared!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
