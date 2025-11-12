const Airtable = require('airtable');
const Anthropic = require('@anthropic-ai/sdk');

// Configuration
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN_CG;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID_CG;
const COMPANIONS_TABLE_ID = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE_ID = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !COMPANIONS_TABLE_ID || !TRANSLATIONS_TABLE_ID) {
  console.error('❌ Missing required environment variables');
  console.error('Required: AIRTABLE_TOKEN_CG, AIRTABLE_BASE_ID_CG, AIRTABLE_TABLE_ID_CG, AIRTABLE_TRANSLATIONS_TABLE_ID_CG');
  process.exit(1);
}

if (!ANTHROPIC_API_KEY) {
  console.error('❌ Missing ANTHROPIC_API_KEY');
  process.exit(1);
}

const base = new Airtable({apiKey: AIRTABLE_TOKEN}).base(AIRTABLE_BASE_ID);
const anthropic = new Anthropic({apiKey: ANTHROPIC_API_KEY});

async function getAllEnglishTranslations() {
  try {
    console.log('📥 Fetching all English translations...');
    const records = await base(TRANSLATIONS_TABLE_ID)
      .select({
        filterByFormula: '{language} = "en"',
        fields: ['companion', 'language', 'tagline', 'best_for', 'description']
      })
      .all();

    console.log(`✅ Found ${records.length} English translations`);
    return records;
  } catch (error) {
    console.error('❌ Error fetching English translations:', error.message);
    throw error;
  }
}

async function checkExistingGermanTranslation(companionId) {
  try {
    const records = await base(TRANSLATIONS_TABLE_ID)
      .select({
        filterByFormula: `AND({language} = "de", {companion} = "${companionId}")`,
        maxRecords: 1
      })
      .all();

    return records.length > 0 ? records[0] : null;
  } catch (error) {
    console.error('❌ Error checking existing German translation:', error.message);
    return null;
  }
}

async function translateToGerman(tagline, bestFor, description) {
  try {
    const prompt = `Vertaal de volgende AI companion teksten van Engels naar Duits. Behoud de tone en stijl. Geef alleen de vertalingen terug in JSON formaat zonder extra uitleg.

English texts:
- Tagline: ${tagline}
- Best For: ${bestFor}
- Description: ${description}

Geef het resultaat terug als een JSON object met deze structuur:
{
  "tagline": "Duitse vertaling van tagline",
  "best_for": "Duitse vertaling van best for",
  "description": "Duitse vertaling van description"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const translation = JSON.parse(jsonMatch[0]);
    return translation;
  } catch (error) {
    console.error('❌ Error translating:', error.message);
    throw error;
  }
}

async function createGermanTranslation(companionId, translation) {
  try {
    const existing = await checkExistingGermanTranslation(companionId);

    const translationData = {
      companion: [companionId],
      language: 'de',
      tagline: translation.tagline || '',
      best_for: translation.best_for || '',
      description: translation.description || ''
    };

    if (existing) {
      console.log(`🔄 Updating existing German translation...`);
      await base(TRANSLATIONS_TABLE_ID).update(existing.id, translationData);
      console.log(`✅ Updated German translation`);
    } else {
      console.log(`➕ Creating new German translation...`);
      await base(TRANSLATIONS_TABLE_ID).create(translationData);
      console.log(`✅ Created German translation`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error creating/updating German translation:`, error.message);
    return false;
  }
}

async function translateAllToGerman() {
  console.log('🚀 Starting German translation process...');
  console.log(`📦 Using Translations Table: ${TRANSLATIONS_TABLE_ID}`);
  console.log('');

  const englishRecords = await getAllEnglishTranslations();

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (const record of englishRecords) {
    const companionId = record.fields.companion?.[0];
    const tagline = record.fields.tagline || '';
    const bestFor = record.fields.best_for || '';
    const description = record.fields.description || '';

    if (!companionId) {
      console.log(`⚠️  No companion ID found, skipping...`);
      skippedCount++;
      continue;
    }

    console.log(`\n📝 Processing companion ${companionId}...`);
    console.log(`   EN Tagline: ${tagline.substring(0, 50)}...`);

    try {
      // Check if German translation already exists
      const existing = await checkExistingGermanTranslation(companionId);
      if (existing) {
        console.log(`ℹ️  German translation already exists, skipping...`);
        skippedCount++;
        continue;
      }

      // Translate
      console.log(`🤖 Translating to German...`);
      const germanTranslation = await translateToGerman(tagline, bestFor, description);

      console.log(`   DE Tagline: ${germanTranslation.tagline.substring(0, 50)}...`);

      // Create translation in Airtable
      const success = await createGermanTranslation(companionId, germanTranslation);

      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Error processing companion ${companionId}:`, error.message);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ German translation process complete!');
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log('='.repeat(50));
}

// Run the script
translateAllToGerman().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
