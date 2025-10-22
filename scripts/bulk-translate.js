/**
 * Bulk Translation Script for CompanionGuide.ai
 * Translates all companions to specified language and uploads to Airtable
 *
 * Usage: node scripts/bulk-translate.js [language_code]
 * Example: node scripts/bulk-translate.js nl
 */

const Airtable = require('airtable');
const OpenAI = require('openai');

// Configuration
const TARGET_LANGUAGE = process.argv[2] || 'nl';
const LANGUAGE_NAMES = {
  nl: 'Dutch',
  es: 'Spanish',
  de: 'German',
  fr: 'French',
  it: 'Italian',
  pt: 'Portuguese',
  pl: 'Polish'
};

const DRY_RUN = process.argv.includes('--dry-run');

// Check if language is supported
if (!LANGUAGE_NAMES[TARGET_LANGUAGE]) {
  console.error(`❌ Unsupported language: ${TARGET_LANGUAGE}`);
  console.error(`Supported languages: ${Object.keys(LANGUAGE_NAMES).join(', ')}`);
  process.exit(1);
}

console.log(`🌍 Bulk Translation to ${LANGUAGE_NAMES[TARGET_LANGUAGE]} (${TARGET_LANGUAGE})`);
console.log(`${DRY_RUN ? '🔍 DRY RUN MODE - No changes will be made' : '✍️  LIVE MODE - Will upload to Airtable'}\n`);

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

// Use table IDs from environment variables
const companionsTable = base(process.env.AIRTABLE_TABLE_ID_CG);
const translationsTable = base(process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG);

console.log(`📋 Companions table ID: ${process.env.AIRTABLE_TABLE_ID_CG}`);
console.log(`📋 Translations table ID: ${process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG}`);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_COMPANIONGUIDE
});

/**
 * Translate text using OpenAI GPT-4
 */
async function translateText(text, fieldName, companionName) {
  if (!text || text.trim() === '') {
    return '';
  }

  const prompt = `You are a professional translator specializing in AI companion platform content.

Translate the following ${fieldName} for the AI companion platform "${companionName}" from English to ${LANGUAGE_NAMES[TARGET_LANGUAGE]}.

IMPORTANT RULES:
1. Keep the companion name "${companionName}" unchanged - DO NOT translate it
2. Maintain the same tone and style (professional, engaging)
3. Keep technical terms like "AI", "chat", "roleplay" in English when appropriate
4. For SEO fields (meta_title, meta_description), optimize for search while translating
5. Preserve any formatting, punctuation, and special characters
6. Be natural and fluent in ${LANGUAGE_NAMES[TARGET_LANGUAGE]}

Text to translate:
${text}

Translated ${LANGUAGE_NAMES[TARGET_LANGUAGE]} text:`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate to ${LANGUAGE_NAMES[TARGET_LANGUAGE]}. Return ONLY the translated text, no explanations.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    });

    const translation = response.choices[0].message.content.trim();
    return translation;
  } catch (error) {
    console.error(`❌ Translation error for ${fieldName}:`, error.message);
    return text; // Fallback to original
  }
}

/**
 * Translate a single companion
 */
async function translateCompanion(companion) {
  const { id, fields } = companion;
  const name = fields.name || 'Unknown';

  console.log(`\n📝 Translating: ${name}`);
  console.log(`   Description length: ${(fields.description || '').length} chars`);

  const translations = {};

  // Translate description
  if (fields.description) {
    console.log(`   ⏳ Translating description...`);
    translations.description = await translateText(
      fields.description,
      'description',
      name
    );
    console.log(`   ✅ Description translated (${translations.description.length} chars)`);
  }

  // Translate best_for
  if (fields.best_for) {
    console.log(`   ⏳ Translating best_for...`);
    translations.best_for = await translateText(
      fields.best_for,
      'best_for',
      name
    );
    console.log(`   ✅ Best for: ${translations.best_for}`);
  }

  // Translate tagline
  if (fields.tagline) {
    console.log(`   ⏳ Translating tagline...`);
    translations.tagline = await translateText(
      fields.tagline,
      'tagline',
      name
    );
    console.log(`   ✅ Tagline: ${translations.tagline}`);
  }

  // Generate meta_title
  console.log(`   ⏳ Generating meta_title...`);
  translations.meta_title = await translateText(
    `${name} Review - CompanionGuide.ai`,
    'meta_title (SEO)',
    name
  );
  console.log(`   ✅ Meta title: ${translations.meta_title}`);

  // Generate meta_description
  const metaDescBase = fields.short_description || fields.description || `Review of ${name}`;
  console.log(`   ⏳ Generating meta_description...`);
  translations.meta_description = await translateText(
    metaDescBase.substring(0, 150) + '...',
    'meta_description (SEO)',
    name
  );
  console.log(`   ✅ Meta description: ${translations.meta_description}`);

  return {
    companionId: id,
    companionName: name,
    translations
  };
}

/**
 * Check if translation already exists
 */
async function translationExists(companionId, language) {
  try {
    const records = await translationsTable
      .select({
        filterByFormula: `AND({companion} = "${companionId}", {language} = "${language}")`,
        maxRecords: 1
      })
      .firstPage();

    return records.length > 0 ? records[0] : null;
  } catch (error) {
    console.error(`❌ Error checking existing translation:`, error.message);
    return null;
  }
}

/**
 * Upload translation to Airtable
 */
async function uploadTranslation(companionId, companionName, translations) {
  if (DRY_RUN) {
    console.log(`   🔍 [DRY RUN] Would upload translation for ${companionName}`);
    return;
  }

  try {
    // Check if translation already exists
    const existing = await translationExists(companionId, TARGET_LANGUAGE);

    if (existing) {
      console.log(`   🔄 Updating existing translation...`);
      await translationsTable.update(existing.id, {
        description: translations.description || '',
        best_for: translations.best_for || '',
        tagline: translations.tagline || '',
        meta_title: translations.meta_title || '',
        meta_description: translations.meta_description || ''
      });
      console.log(`   ✅ Updated translation record`);
    } else {
      console.log(`   📤 Creating new translation...`);
      await translationsTable.create({
        companion: [companionId], // Link to companion (array format)
        language: TARGET_LANGUAGE,
        description: translations.description || '',
        best_for: translations.best_for || '',
        tagline: translations.tagline || '',
        meta_title: translations.meta_title || '',
        meta_description: translations.meta_description || ''
      });
      console.log(`   ✅ Created translation record`);
    }
  } catch (error) {
    console.error(`   ❌ Upload error:`, error.message);
    if (error.statusCode) {
      console.error(`   Status: ${error.statusCode}`);
    }
    if (error.message.includes('INVALID_REQUEST_UNKNOWN')) {
      console.error(`   This might be a field name mismatch. Check Airtable field names.`);
    }
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting bulk translation...\n');

  // Fetch all active companions
  console.log('📥 Fetching companions from Airtable...');
  let companions = [];

  try {
    companions = await companionsTable
      .select({
        filterByFormula: '{status} = "Active"',
        sort: [{ field: 'rating', direction: 'desc' }]
      })
      .all();

    console.log(`✅ Found ${companions.length} active companions\n`);
  } catch (error) {
    console.error('❌ Failed to fetch companions:', error.message);
    process.exit(1);
  }

  if (companions.length === 0) {
    console.log('⚠️  No companions found to translate');
    return;
  }

  // Translate each companion
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < companions.length; i++) {
    const companion = companions[i];
    console.log(`\n[${ i + 1 }/${companions.length}] ===================`);

    try {
      const { companionId, companionName, translations } = await translateCompanion(companion);

      // Upload to Airtable
      await uploadTranslation(companionId, companionName, translations);

      successCount++;

      // Rate limiting: wait 2 seconds between translations to avoid API limits
      if (i < companions.length - 1) {
        console.log(`   ⏱️  Waiting 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`   ❌ Failed to process companion:`, error.message);
      errorCount++;
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 TRANSLATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successfully translated: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log(`🌍 Target language: ${LANGUAGE_NAMES[TARGET_LANGUAGE]} (${TARGET_LANGUAGE})`);
  console.log(`${DRY_RUN ? '🔍 DRY RUN - No changes made to Airtable' : '✅ Translations uploaded to Airtable'}`);
  console.log('='.repeat(60));
}

// Run the script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
