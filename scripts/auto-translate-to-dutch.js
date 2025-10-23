#!/usr/bin/env node

/**
 * Automatically translate all English companion content to Dutch using Anthropic API
 * Reads language='en' records from Airtable, translates, creates language='nl' records
 */

const Airtable = require('airtable');
const Anthropic = require('@anthropic-ai/sdk');

require('dotenv').config();

// Initialize Airtable
if (!process.env.AIRTABLE_TOKEN_CG) {
  console.error('❌ AIRTABLE_TOKEN_CG environment variable not set');
  process.exit(1);
}

if (!process.env.AIRTABLE_BASE_ID_CG) {
  console.error('❌ AIRTABLE_BASE_ID_CG environment variable not set');
  process.exit(1);
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

// Initialize Anthropic
const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY_CG;
if (!anthropicKey) {
  console.error('❌ ANTHROPIC_API_KEY or ANTHROPIC_KEY_CG environment variable not set');
  process.exit(1);
}

const anthropic = new Anthropic({
  apiKey: anthropicKey,
});

/**
 * Check if Dutch translation already exists for this companion
 */
async function checkDutchTranslationExists(companionRecordId) {
  try {
    const records = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: `AND(RECORD_ID({companion}) = "${companionRecordId}", {language} = "nl")`,
        maxRecords: 1
      })
      .all();

    return records.length > 0;
  } catch (error) {
    console.error('Error checking existing Dutch translation:', error.message);
    return false;
  }
}

/**
 * Translate text using Anthropic Claude
 */
async function translateWithClaude(text, fieldName) {
  if (!text || text.trim() === '') {
    return '';
  }

  const isJSON = fieldName === 'features' || fieldName === 'pros_cons' ||
                 fieldName === 'pricing_plans' || fieldName === 'faq';

  const prompt = isJSON
    ? `Translate this JSON data from English to Dutch. Keep the exact same JSON structure, only translate the text values. Return ONLY the translated JSON, no explanation.

${text}`
    : `Translate this text from English to Dutch. Maintain the same tone and style. Return ONLY the translated text, no explanation.

${text}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const translatedText = message.content[0].text.trim();

    // For JSON fields, validate that it's still valid JSON
    if (isJSON) {
      try {
        JSON.parse(translatedText);
        return translatedText;
      } catch (e) {
        console.error(`⚠️  Invalid JSON returned for ${fieldName}, using original`);
        return text;
      }
    }

    return translatedText;
  } catch (error) {
    console.error(`Error translating ${fieldName}:`, error.message);
    return text; // Return original on error
  }
}

/**
 * Translate all fields of an English record to Dutch
 */
async function translateRecord(englishRecord) {
  const fields = englishRecord.fields;
  const companionName = fields.companion ? fields.companion[0] : 'Unknown';

  console.log(`\n📝 Translating: ${companionName}`);

  const translatedFields = {
    companion: fields.companion, // Keep the same link
    language: 'nl'
  };

  // Fields to translate
  const fieldsToTranslate = [
    'description',
    'best_for',
    'tagline',
    'meta_title',
    'meta_description',
    'body_text',
    'my_verdict'
  ];

  const jsonFieldsToTranslate = [
    'features',
    'pros_cons',
    'pricing_plans',
    'faq'
  ];

  // Translate text fields
  for (const fieldName of fieldsToTranslate) {
    if (fields[fieldName]) {
      process.stdout.write(`   - ${fieldName}...`);
      translatedFields[fieldName] = await translateWithClaude(fields[fieldName], fieldName);
      console.log(' ✓');

      // Rate limiting - wait 500ms between API calls
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Translate JSON fields
  for (const fieldName of jsonFieldsToTranslate) {
    if (fields[fieldName]) {
      process.stdout.write(`   - ${fieldName} (JSON)...`);
      translatedFields[fieldName] = await translateWithClaude(fields[fieldName], fieldName);
      console.log(' ✓');

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return translatedFields;
}

/**
 * Create Dutch translation record in Airtable
 */
async function createDutchRecord(translatedFields, companionName) {
  try {
    await base(TRANSLATIONS_TABLE).create([
      { fields: translatedFields }
    ]);
    console.log(`✅ Created Dutch translation for: ${companionName}`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating Dutch record for ${companionName}:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n🌐 Auto-Translation: English → Dutch\n');
  console.log('Using Anthropic Claude API for translations...\n');

  try {
    // Fetch all English records
    console.log('📚 Fetching English records from Airtable...\n');

    const englishRecords = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: '{language} = "en"'
      })
      .all();

    console.log(`Found ${englishRecords.length} English records\n`);

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const record of englishRecords) {
      const companionRecordId = record.fields.companion ? record.fields.companion[0] : null;

      if (!companionRecordId) {
        console.log(`⚠️  Skipping record without companion link`);
        skippedCount++;
        continue;
      }

      // Check if Dutch translation already exists
      const dutchExists = await checkDutchTranslationExists(companionRecordId);

      if (dutchExists) {
        console.log(`⏭️  Skipping (Dutch already exists): ${record.fields.companion}`);
        skippedCount++;
        continue;
      }

      try {
        // Translate all fields
        const translatedFields = await translateRecord(record);

        // Create Dutch record in Airtable
        const success = await createDutchRecord(
          translatedFields,
          record.fields.companion ? record.fields.companion[0] : 'Unknown'
        );

        if (success) {
          successCount++;
        } else {
          errorCount++;
        }

        // Rate limiting between records
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Error processing record:`, error.message);
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Translation Complete!`);
    console.log(`   Total English records: ${englishRecords.length}`);
    console.log(`   Successfully translated: ${successCount}`);
    console.log(`   Skipped (already exists): ${skippedCount}`);
    console.log(`   Errors: ${errorCount}`);
    console.log('\n📋 Next steps:');
    console.log('   1. Check Airtable for all Dutch translations');
    console.log('   2. Review translations for quality');
    console.log('   3. Test Dutch pages: http://localhost:8888/nl/companions/[slug]');
    console.log('\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
