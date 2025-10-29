const Airtable = require('airtable');
require('dotenv').config();

/**
 * Clear NL and PT body_text fields
 * User will translate manually
 *
 * Usage: node scripts/clear-nl-pt-body-texts.js
 */

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

async function clearNLPTBodyTexts() {
  console.log('\n🗑️  Clearing NL and PT body_text fields...\n');

  try {
    // Get all NL and PT translations
    const translations = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: 'OR({language} = "nl", {language} = "pt")',
        fields: ['language', 'name (from companion)', 'body_text']
      })
      .all();

    console.log(`✅ Found ${translations.length} NL/PT records\n`);

    let cleared = 0;

    for (const translation of translations) {
      const name = translation.fields['name (from companion)']?.[0] || 'Unknown';
      const lang = translation.fields.language;
      const bodyText = translation.fields.body_text;

      if (bodyText && bodyText.trim().length > 0) {
        await base(TRANSLATIONS_TABLE).update([
          {
            id: translation.id,
            fields: { body_text: '' }
          }
        ]);

        console.log(`✅ Cleared: ${name} (${lang})`);
        cleared++;

        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Cleared: ${cleared}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

clearNLPTBodyTexts().then(() => {
  console.log('🎉 NL/PT body_text fields cleared!');
  process.exit(0);
});
