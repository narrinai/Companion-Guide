const Airtable = require('airtable');
const Anthropic = require('@anthropic-ai/sdk');

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN_CG;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID_CG;
const TRANSLATIONS_TABLE_ID = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !TRANSLATIONS_TABLE_ID || !ANTHROPIC_API_KEY) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const base = new Airtable({apiKey: AIRTABLE_TOKEN}).base(AIRTABLE_BASE_ID);
const anthropic = new Anthropic({apiKey: ANTHROPIC_API_KEY});

const CONTENT_FIELDS = ['meta_title', 'meta_description', 'pros_cons', 'pricing_plans', 'my_verdict', 'faq', 'features', 'body_text', 'ready_try', 'hero_specs'];

async function translateToGerman(enContent) {
  const prompt = `Translate the following AI companion content from English to German. Use formal German (Sie-Form). Keep JSON structure, markdown, and HTML intact.

${JSON.stringify(enContent, null, 2)}

Return only the translated JSON.`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 8192,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = message.content[0].text;
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) throw new Error('No JSON in response');

  return JSON.parse(jsonMatch[1] || jsonMatch[0]);
}

async function main() {
  console.log('🚀 Translating English content to German...\n');

  // Get all records
  const allRecords = await base(TRANSLATIONS_TABLE_ID).select().all();

  const enRecords = allRecords.filter(r => r.fields.language === 'en');
  const deRecords = allRecords.filter(r => r.fields.language === 'de');

  console.log(`📥 Found ${enRecords.length} EN and ${deRecords.length} DE records\n`);

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (const deRecord of deRecords) {
    const compId = deRecord.fields.companion?.[0];
    if (!compId) {
      skippedCount++;
      continue;
    }

    // Check if already has content
    if (CONTENT_FIELDS.some(f => deRecord.fields[f])) {
      console.log(`ℹ️  ${deRecord.fields.tagline?.substring(0, 40)}... - already has content`);
      skippedCount++;
      continue;
    }

    // Find matching EN record
    const enRecord = enRecords.find(r => r.fields.companion?.[0] === compId);
    if (!enRecord) {
      console.log(`⚠️  No EN match for ${compId}`);
      skippedCount++;
      continue;
    }

    // Get EN content
    const enContent = {};
    CONTENT_FIELDS.forEach(f => {
      if (enRecord.fields[f]) enContent[f] = enRecord.fields[f];
    });

    if (Object.keys(enContent).length === 0) {
      console.log(`ℹ️  ${deRecord.fields.tagline?.substring(0, 40)}... - no EN content`);
      skippedCount++;
      continue;
    }

    console.log(`\n📝 ${deRecord.fields.tagline?.substring(0, 50)}...`);
    console.log(`   Translating ${Object.keys(enContent).length} fields...`);

    try {
      const deContent = await translateToGerman(enContent);
      await base(TRANSLATIONS_TABLE_ID).update(deRecord.id, deContent);

      console.log(`   ✅ Updated`);
      successCount++;

      await new Promise(r => setTimeout(r, 2000));
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Complete! Success: ${successCount}, Failed: ${failCount}, Skipped: ${skippedCount}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
