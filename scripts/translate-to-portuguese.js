#!/usr/bin/env node

/**
 * Automatically translate all English companion content to Portuguese
 * Creates language='pt' records in Companion_Translations table
 */

const Airtable = require('airtable');
const Anthropic = require('@anthropic-ai/sdk');

require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY_CG;
const anthropic = new Anthropic({ apiKey: anthropicKey });

/**
 * Translate text using Claude to Portuguese
 */
async function translateWithClaude(text, fieldName) {
  if (!text || text.trim() === '') {
    return '';
  }

  const isJSON = ['features', 'pros_cons', 'pricing_plans', 'faq', 'hero_specs'].includes(fieldName);

  const prompt = isJSON
    ? `Translate this JSON data from English to Portuguese (Brazil). Keep the exact same JSON structure, only translate the text values. Return ONLY the translated JSON, no explanation.

${text}`
    : `Translate this text from English to Portuguese (Brazil). Maintain the same tone and style. Return ONLY the translated text, no explanation.

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
    return text;
  }
}

/**
 * Check if Portuguese translation already exists
 */
async function checkPortugueseExists(companionRecordId) {
  const allRecords = await getAllPortugueseTranslations();
  return allRecords.find(record => {
    const companionIds = record.fields.companion || [];
    return companionIds.includes(companionRecordId);
  });
}

let allPortugueseRecords = null;

async function getAllPortugueseTranslations() {
  if (allPortugueseRecords) {
    return allPortugueseRecords;
  }

  try {
    allPortugueseRecords = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: '{language} = "pt"'
      })
      .all();

    return allPortugueseRecords;
  } catch (error) {
    console.error('Error fetching Portuguese translations:', error.message);
    return [];
  }
}

/**
 * Translate all fields of an English record to Portuguese
 */
async function translateRecord(englishRecord) {
  const fields = englishRecord.fields;
  const companionName = fields.companion ? 'Companion' : 'Unknown';

  console.log(`\n📝 Translating: ${companionName}`);

  const translatedFields = {
    companion: fields.companion,
    language: 'pt'
  };

  // Fields to translate
  const textFields = [
    'description',
    'best_for',
    'tagline',
    'meta_title',
    'meta_description',
    'body_text',
    'my_verdict',
    'ready_try'
  ];

  const jsonFields = [
    'features',
    'pros_cons',
    'pricing_plans',
    'faq',
    'hero_specs'
  ];

  // Translate text fields
  for (const fieldName of textFields) {
    if (fields[fieldName]) {
      process.stdout.write(`   - ${fieldName}...`);
      translatedFields[fieldName] = await translateWithClaude(fields[fieldName], fieldName);
      console.log(' ✓');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  // Translate JSON fields
  for (const fieldName of jsonFields) {
    if (fields[fieldName]) {
      process.stdout.write(`   - ${fieldName} (JSON)...`);
      translatedFields[fieldName] = await translateWithClaude(fields[fieldName], fieldName);
      console.log(' ✓');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }

  return translatedFields;
}

/**
 * Create Portuguese translation record
 */
async function createPortugueseRecord(translatedFields) {
  try {
    await base(TRANSLATIONS_TABLE).create([
      { fields: translatedFields }
    ]);
    console.log(`✅ Created Portuguese translation`);
    return true;
  } catch (error) {
    console.error(`❌ Error creating Portuguese record:`, error.message);
    return false;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n🇵🇹 Auto-Translation: English → Portuguese\n');
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

      // Check if Portuguese translation already exists
      const portugueseExists = await checkPortugueseExists(companionRecordId);

      if (portugueseExists) {
        console.log(`⏭️  Skipping (Portuguese already exists)`);
        skippedCount++;
        continue;
      }

      try {
        // Translate all fields
        const translatedFields = await translateRecord(record);

        // Create Portuguese record in Airtable
        const success = await createPortugueseRecord(translatedFields);

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
    console.log('   1. Check Airtable for all Portuguese translations');
    console.log('   2. Create /pt/companions/ HTML pages');
    console.log('   3. Add pt.json for UI translations');
    console.log('\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
