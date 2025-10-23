#!/usr/bin/env node

/**
 * Translate my_verdict field from English to Dutch
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
 * Translate text using Claude
 */
async function translateWithClaude(text) {
  if (!text || text.trim() === '') {
    return '';
  }

  const prompt = `Translate this text from English to Dutch. Maintain the same tone. Return ONLY the translation, no explanation.

${text}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    });

    return message.content[0].text.trim();
  } catch (error) {
    console.error(`Error translating:`, error.message);
    return text;
  }
}

/**
 * Main function
 */
async function main() {
  console.log('\n🌐 Translating my_verdict EN → NL\n');

  try {
    // Get all Dutch translation records
    const dutchRecords = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: '{language} = "nl"'
      })
      .all();

    // Get all English translation records
    const englishRecords = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: '{language} = "en"'
      })
      .all();

    console.log(`Found ${dutchRecords.length} Dutch translation records\n`);

    let updateCount = 0;
    let skipCount = 0;

    for (const dutchRecord of dutchRecords) {
      // Check if already has my_verdict
      if (dutchRecord.fields.my_verdict) {
        skipCount++;
        continue;
      }

      const companionRecordId = dutchRecord.fields.companion ? dutchRecord.fields.companion[0] : null;

      if (!companionRecordId) {
        console.log('⏭️  Skipping record without companion link');
        skipCount++;
        continue;
      }

      // Find corresponding English record
      const englishRecord = englishRecords.find(record => {
        const companionIds = record.fields.companion || [];
        return companionIds.includes(companionRecordId);
      });

      if (!englishRecord || !englishRecord.fields.my_verdict) {
        console.log(`⏭️  No English my_verdict found for companion: ${companionRecordId}`);
        skipCount++;
        continue;
      }

      const englishVerdict = englishRecord.fields.my_verdict;
      const companionName = dutchRecord.fields.companion;

      console.log(`\n📝 Translating my_verdict for: ${companionName}`);

      // Translate
      const dutchVerdict = await translateWithClaude(englishVerdict);

      // Update Dutch record
      try {
        await base(TRANSLATIONS_TABLE).update([
          {
            id: dutchRecord.id,
            fields: {
              my_verdict: dutchVerdict
            }
          }
        ]);
        console.log(`   ✅ Updated`);
        updateCount++;
      } catch (error) {
        console.error(`   ❌ Error updating:`, error.message);
      }

      // Rate limiting
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
