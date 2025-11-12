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

// Content fields to translate
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
    console.log('📥 Fetching German records...');
    const records = await base(TRANSLATIONS_TABLE_ID)
      .select({
        filterByFormula: '{language} = "de"'
      })
      .all();

    console.log(`✅ Found ${records.length} German records`);
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
        filterByFormula: `AND({language} = "en", SEARCH("${companionId}", ARRAYJOIN({companion})))`,
        maxRecords: 1
      })
      .all();

    if (records.length === 0) {
      return null;
    }

    const fields = records[0].fields;
    const content = {};

    CONTENT_FIELDS.forEach(field => {
      if (fields[field]) {
        content[field] = fields[field];
      }
    });

    return Object.keys(content).length > 0 ? content : null;
  } catch (error) {
    console.error('❌ Error fetching English content:', error.message);
    return null;
  }
}

async function translateToGerman(enContent, companionName) {
  try {
    const prompt = `Translate the following AI companion content fields from English to German for "${companionName}".

Keep:
- Exact JSON structure
- Markdown formatting
- HTML tags if present
- Bullet points and lists
- Numeric values

Use formal German (Sie-Form) for user interactions.

English content:
${JSON.stringify(enContent, null, 2)}

Return only the translated JSON object without extra text.`;

    console.log('🤖 Translating to German...');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;

    // Extract JSON
    let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      jsonMatch = responseText.match(/```\n([\s\S]*?)\n```/);
    }
    if (!jsonMatch) {
      jsonMatch = responseText.match(/\{[\s\S]*\}/);
    }

    if (!jsonMatch) {
      throw new Error('No JSON in response');
    }

    const translation = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    return translation;
  } catch (error) {
    console.error('❌ Translation error:', error.message);
    throw error;
  }
}

async function updateGermanRecord(recordId, translation) {
  try {
    await base(TRANSLATIONS_TABLE_ID).update(recordId, translation);
    return true;
  } catch (error) {
    console.error('❌ Update error:', error.message);
    return false;
  }
}

async function translateAll() {
  console.log('🚀 Translating English content fields to German...\n');

  const germanRecords = await getAllGermanRecords();

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (const germanRecord of germanRecords) {
    const companionId = germanRecord.fields.companion?.[0];
    const companionName = germanRecord.fields.tagline || 'Unknown';

    if (!companionId) {
      console.log(`⚠️  No companion ID, skipping...`);
      skippedCount++;
      continue;
    }

    console.log(`\n📝 Processing: ${companionName.substring(0, 50)}...`);
    console.log(`   Companion ID: ${companionId}`);

    // Check if already has content
    const hasContent = CONTENT_FIELDS.some(field => germanRecord.fields[field]);
    if (hasContent) {
      console.log(`ℹ️  Already has German content, skipping...`);
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

    console.log(`   Found ${Object.keys(englishContent).length} English fields to translate`);

    try {
      // Translate
      const germanTranslation = await translateToGerman(englishContent, companionName);
      console.log(`   ✅ Translated ${Object.keys(germanTranslation).length} fields`);

      // Update
      const success = await updateGermanRecord(germanRecord.id, germanTranslation);

      if (success) {
        console.log(`   ✅ Updated in Airtable`);
        successCount++;
      } else {
        failCount++;
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Translation complete!');
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log('='.repeat(60));
}

translateAll().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
