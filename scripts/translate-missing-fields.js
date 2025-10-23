#!/usr/bin/env node

/**
 * Translate missing fields and copy pricing_plans/features from main Companions table
 */

const Airtable = require('airtable');
const Anthropic = require('@anthropic-ai/sdk');

require('dotenv').config();

// Initialize Airtable
const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const COMPANIONS_TABLE = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

// Initialize Anthropic
const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY_CG;
const anthropic = new Anthropic({ apiKey: anthropicKey });

/**
 * Translate text using Claude
 */
async function translateWithClaude(text, fieldName) {
  if (!text || text.trim() === '') {
    return '';
  }

  const isJSON = fieldName === 'hero_specs';

  const prompt = isJSON
    ? `Translate this JSON from English to Dutch. Keep the exact same JSON structure. Return ONLY the JSON, no explanation.

${text}`
    : `Translate this text from English to Dutch. Maintain the same tone. Return ONLY the translation, no explanation.

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
 * Get companion data from main table
 */
async function getCompanionData(companionRecordId) {
  try {
    const record = await base(COMPANIONS_TABLE).find(companionRecordId);
    return {
      name: record.fields.name,
      description: record.fields.description || '',
      features: record.fields.features || '',
      pricing_plans: record.fields.pricing_plans || '',
      my_verdict: record.fields.my_verdict || ''
    };
  } catch (error) {
    console.error('Error fetching companion data:', error.message);
    return null;
  }
}

/**
 * Get English translation record
 */
async function getEnglishTranslation(companionRecordId) {
  try {
    const records = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: `AND(RECORD_ID({companion}) = "${companionRecordId}", {language} = "en")`,
        maxRecords: 1
      })
      .all();

    return records.length > 0 ? records[0] : null;
  } catch (error) {
    console.error('Error fetching English translation:', error.message);
    return null;
  }
}

/**
 * Get Dutch translation record
 */
async function getDutchTranslation(companionRecordId) {
  try {
    const records = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: `AND(RECORD_ID({companion}) = "${companionRecordId}", {language} = "nl")`,
        maxRecords: 1
      })
      .all();

    return records.length > 0 ? records[0] : null;
  } catch (error) {
    console.error('Error fetching Dutch translation:', error.message);
    return null;
  }
}

/**
 * Generate hero_specs from companion data
 */
function generateHeroSpecs(companionData) {
  // Extract from description or use defaults
  const heroSpecs = {
    pricing: "Free with Premium Options",
    platform: "Web & Mobile Apps",
    content_policy: "Family-friendly (filtered)"
  };

  // Try to extract pricing info from pricing_plans if available
  if (companionData.pricing_plans) {
    try {
      const plans = JSON.parse(companionData.pricing_plans);
      if (plans.length > 0) {
        const freePlan = plans.find(p => p.name.toLowerCase().includes('free'));
        const paidPlan = plans.find(p => p.price && p.price !== '$0');

        if (freePlan && paidPlan) {
          heroSpecs.pricing = `Free with Premium (${paidPlan.price})`;
        } else if (paidPlan) {
          heroSpecs.pricing = paidPlan.price;
        }
      }
    } catch (e) {
      // Use default
    }
  }

  return JSON.stringify(heroSpecs, null, 2);
}

/**
 * Generate ready_try text
 */
function generateReadyTry(companionName) {
  return `Ready to Try ${companionName}?`;
}

/**
 * Process all Dutch translation records
 */
async function main() {
  console.log('\n🔧 Translating Missing Fields\n');

  try {
    // Get all English translation records (these need to be completed)
    const englishRecords = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: '{language} = "en"'
      })
      .all();

    console.log(`Found ${englishRecords.length} English translation records\n`);

    let updateCount = 0;
    let skipCount = 0;

    for (const englishRecord of englishRecords) {
      const companionRecordId = englishRecord.fields.companion ? englishRecord.fields.companion[0] : null;

      if (!companionRecordId) {
        console.log('⏭️  Skipping record without companion link');
        skipCount++;
        continue;
      }

      // Get companion data from main table
      const companionData = await getCompanionData(companionRecordId);
      if (!companionData) {
        console.log(`⏭️  Skipping - companion not found: ${companionRecordId}`);
        skipCount++;
        continue;
      }

      console.log(`\n📝 Processing: ${companionData.name}`);

      const fieldsToUpdate = {};

      // 1. Copy description from main table (no translation needed)
      if (!englishRecord.fields.description && companionData.description) {
        console.log('   - Copying description from main table...');
        fieldsToUpdate.description = companionData.description;
      }

      // 2. Copy features from main table (no translation needed)
      if (!englishRecord.fields.features && companionData.features) {
        console.log('   - Copying features from main table...');
        fieldsToUpdate.features = companionData.features;
      }

      // 3. Copy pricing_plans from main table (no translation needed)
      if (!englishRecord.fields.pricing_plans && companionData.pricing_plans) {
        console.log('   - Copying pricing_plans from main table...');
        fieldsToUpdate.pricing_plans = companionData.pricing_plans;
      }

      // 4. Copy my_verdict from main table (no translation needed - already in English)
      if (!englishRecord.fields.my_verdict && companionData.my_verdict) {
        console.log('   - Copying my_verdict from main table...');
        fieldsToUpdate.my_verdict = companionData.my_verdict;
      }

      // 5. Generate hero_specs (no translation needed - already in English)
      if (!englishRecord.fields.hero_specs) {
        console.log('   - Generating hero_specs...');
        fieldsToUpdate.hero_specs = generateHeroSpecs(companionData);
      }

      // 6. Generate ready_try (no translation needed - already in English)
      if (!englishRecord.fields.ready_try) {
        console.log('   - Generating ready_try...');
        fieldsToUpdate.ready_try = generateReadyTry(companionData.name);
      }

      // Update record if there are fields to update
      if (Object.keys(fieldsToUpdate).length > 0) {
        try {
          await base(TRANSLATIONS_TABLE).update([
            {
              id: englishRecord.id,
              fields: fieldsToUpdate
            }
          ]);
          console.log(`   ✅ Updated ${Object.keys(fieldsToUpdate).length} fields`);
          updateCount++;
        } catch (error) {
          console.error(`   ❌ Error updating:`, error.message);
        }
      } else {
        console.log('   ⏭️  No missing fields - skipping');
        skipCount++;
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
