#!/usr/bin/env node

/**
 * Fill missing Portuguese fields by translating from English
 * Updates existing PT records with missing content
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
 * Translate text to Portuguese
 */
async function translateWithClaude(text, fieldName) {
  if (!text || text.trim() === '') {
    return '';
  }

  const isJSON = ['features', 'pros_cons', 'pricing_plans', 'faq', 'hero_specs'].includes(fieldName);

  const prompt = isJSON
    ? `Translate this JSON from English to Portuguese (Brazil). Keep exact JSON structure. Return ONLY the JSON.

${text}`
    : `Translate this text from English to Portuguese (Brazil). Maintain tone. Return ONLY the translation.

${text}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    const translatedText = message.content[0].text.trim();

    if (isJSON) {
      try {
        JSON.parse(translatedText);
        return translatedText;
      } catch (e) {
        console.error(`⚠️  Invalid JSON for ${fieldName}`);
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
 * Main function
 */
async function main() {
  console.log('\n🇵🇹 Filling Missing Portuguese Fields\n');

  try {
    // Get all Portuguese records
    const ptRecords = await base(TRANSLATIONS_TABLE)
      .select({ filterByFormula: '{language} = "pt"' })
      .all();

    // Get all English records
    const enRecords = await base(TRANSLATIONS_TABLE)
      .select({ filterByFormula: '{language} = "en"' })
      .all();

    console.log(`Found ${ptRecords.length} Portuguese records\n`);

    const fieldsToFill = [
      'body_text',
      'features',
      'pros_cons',
      'pricing_plans',
      'my_verdict',
      'faq',
      'hero_specs',
      'ready_try'
    ];

    let updateCount = 0;
    let skipCount = 0;

    for (const ptRecord of ptRecords) {
      const companionId = ptRecord.fields.companion ? ptRecord.fields.companion[0] : null;

      if (!companionId) {
        console.log('⏭️  Skipping record without companion link');
        skipCount++;
        continue;
      }

      // Find corresponding English record
      const enRecord = enRecords.find(record => {
        const companionIds = record.fields.companion || [];
        return companionIds.includes(companionId);
      });

      if (!enRecord) {
        console.log(`⏭️  No English record found`);
        skipCount++;
        continue;
      }

      console.log(`\n📝 Processing companion: ${companionId}`);

      const fieldsToUpdate = {};
      let hasUpdates = false;

      // Check each field
      for (const fieldName of fieldsToFill) {
        // Skip if PT already has this field
        if (ptRecord.fields[fieldName]) {
          continue;
        }

        // Skip if EN doesn't have this field
        if (!enRecord.fields[fieldName]) {
          continue;
        }

        // Translate field
        console.log(`   - Translating ${fieldName}...`);
        fieldsToUpdate[fieldName] = await translateWithClaude(enRecord.fields[fieldName], fieldName);
        hasUpdates = true;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Update record if there are changes
      if (hasUpdates) {
        try {
          await base(TRANSLATIONS_TABLE).update([
            {
              id: ptRecord.id,
              fields: fieldsToUpdate
            }
          ]);
          console.log(`   ✅ Updated ${Object.keys(fieldsToUpdate).length} fields`);
          updateCount++;
        } catch (error) {
          console.error(`   ❌ Error updating:`, error.message);
        }
      } else {
        console.log(`   ⏭️  No missing fields`);
        skipCount++;
      }

      // Rate limiting between records
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Done!`);
    console.log(`   Updated: ${updateCount}`);
    console.log(`   Skipped: ${skipCount}`);
    console.log('\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

main();
