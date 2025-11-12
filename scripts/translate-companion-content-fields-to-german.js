const Airtable = require('airtable');
const Anthropic = require('@anthropic-ai/sdk');

// Configuration
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN_CG;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID_CG;
const TRANSLATIONS_TABLE_ID = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !TRANSLATIONS_TABLE_ID || !ANTHROPIC_API_KEY) {
  console.error('❌ Missing required environment variables');
  process.exit(1);
}

const base = new Airtable({apiKey: AIRTABLE_TOKEN}).base(AIRTABLE_BASE_ID);
const anthropic = new Anthropic({apiKey: ANTHROPIC_API_KEY});

// Fields to translate
const CONTENT_FIELDS = [
  'meta_title',
  'meta_description',
  'pros_cons',
  'pricing_plans',
  'my_verdict',
  'faq',
  'features',
  'body_text',
  'ready_try',
  'hero_specs'
];

async function getAllGermanRecords() {
  try {
    console.log('📥 Fetching all German translation records...');
    const records = await base(TRANSLATIONS_TABLE_ID)
      .select({
        filterByFormula: '{language} = "de"',
        fields: ['companion', 'language', ...CONTENT_FIELDS]
      })
      .all();

    console.log(`✅ Found ${records.length} German translation records`);
    return records;
  } catch (error) {
    console.error('❌ Error fetching German records:', error.message);
    throw error;
  }
}

async function getEnglishContent(companionId) {
  try {
    const records = await base(TRANSLATIONS_TABLE_ID)
      .select({
        filterByFormula: `AND({language} = "en", {companion} = "${companionId}")`,
        maxRecords: 1,
        fields: CONTENT_FIELDS
      })
      .all();

    if (records.length === 0) {
      return null;
    }

    return records[0].fields;
  } catch (error) {
    console.error('❌ Error fetching English content:', error.message);
    return null;
  }
}

async function translateContentToGerman(content) {
  try {
    // Prepare content for translation
    const contentToTranslate = {};
    CONTENT_FIELDS.forEach(field => {
      if (content[field]) {
        contentToTranslate[field] = content[field];
      }
    });

    if (Object.keys(contentToTranslate).length === 0) {
      return null;
    }

    const prompt = `Vertaal de volgende AI companion content velden van Engels naar Duits. Behoud de exacte JSON structuur en formatting (inclusief markdown, bullets, etc.). Gebruik formeel Duits (Sie-Form). Geef alleen het JSON object terug zonder extra uitleg.

English content:
${JSON.stringify(contentToTranslate, null, 2)}

Geef het resultaat terug als een JSON object met dezelfde keys.`;

    console.log('🤖 Translating content fields to German...');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;

    // Extract JSON from response
    let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      jsonMatch = responseText.match(/```\n([\s\S]*?)\n```/);
    }
    if (!jsonMatch) {
      jsonMatch = responseText.match(/\{[\s\S]*\}/);
    }

    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const translation = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return translation;
  } catch (error) {
    console.error('❌ Error translating:', error.message);
    throw error;
  }
}

async function updateGermanRecord(recordId, translation) {
  try {
    await base(TRANSLATIONS_TABLE_ID).update(recordId, translation);
    return true;
  } catch (error) {
    console.error('❌ Error updating record:', error.message);
    return false;
  }
}

async function translateAllContentFields() {
  console.log('🚀 Starting German content field translation...\n');

  const germanRecords = await getAllGermanRecords();

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (const germanRecord of germanRecords) {
    const companionId = germanRecord.fields.companion?.[0];

    if (!companionId) {
      console.log(`⚠️  No companion ID, skipping...`);
      skippedCount++;
      continue;
    }

    console.log(`\n📝 Processing companion ${companionId}...`);

    // Check if content fields are already filled
    const hasContent = CONTENT_FIELDS.some(field => germanRecord.fields[field]);
    if (hasContent) {
      console.log(`ℹ️  German content already exists, skipping...`);
      skippedCount++;
      continue;
    }

    // Get English content
    const englishContent = await getEnglishContent(companionId);
    if (!englishContent) {
      console.log(`⚠️  No English content found, skipping...`);
      skippedCount++;
      continue;
    }

    // Check if English has any content
    const hasEnglishContent = CONTENT_FIELDS.some(field => englishContent[field]);
    if (!hasEnglishContent) {
      console.log(`ℹ️  No English content to translate, skipping...`);
      skippedCount++;
      continue;
    }

    try {
      // Translate
      const germanTranslation = await translateContentToGerman(englishContent);

      if (!germanTranslation) {
        console.log(`⚠️  Translation failed, skipping...`);
        failCount++;
        continue;
      }

      console.log(`✅ Translated ${Object.keys(germanTranslation).length} fields`);

      // Update Airtable
      const success = await updateGermanRecord(germanRecord.id, germanTranslation);

      if (success) {
        console.log(`✅ Updated German record`);
        successCount++;
      } else {
        failCount++;
      }

      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error(`❌ Error processing companion ${companionId}:`, error.message);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ German content field translation complete!');
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log('='.repeat(60));
}

// Run the script
translateAllContentFields().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
