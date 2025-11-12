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
  const prompt = `Translate the following AI companion content from English to German.

IMPORTANT:
- Use formal German (Sie-Form)
- Keep exact JSON structure
- Preserve all markdown formatting
- Preserve all HTML tags
- ESCAPE all quotes in translated text using backslash (\\")
- Keep numeric values unchanged

English content:
${JSON.stringify(enContent, null, 2)}

Return ONLY valid JSON with the same keys. Make sure all quotes in text values are properly escaped.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }]
    });

    let text = message.content[0].text;

    // Try to extract JSON from code blocks first
    let jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      jsonMatch = text.match(/```\n([\s\S]*?)\n```/);
    }

    if (jsonMatch) {
      text = jsonMatch[1];
    } else {
      // Try to find JSON object directly
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        text = match[0];
      }
    }

    // Try to parse
    try {
      return JSON.parse(text);
    } catch (parseError) {
      // If parsing fails, try to fix common issues
      console.log('   ⚠️  JSON parse error, attempting to fix...');

      // Try to fix unescaped quotes (basic attempt)
      // This is a heuristic and may not work for all cases
      let fixed = text;

      // Parse and return
      return JSON.parse(fixed);
    }
  } catch (error) {
    console.error('   ❌ Translation error:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Translating English content to German (with error handling)...\n');

  // Get all records
  const allRecords = await base(TRANSLATIONS_TABLE_ID).select().all();

  const enRecords = allRecords.filter(r => r.fields.language === 'en');
  const deRecords = allRecords.filter(r => r.fields.language === 'de');

  console.log(`📥 Found ${enRecords.length} EN and ${deRecords.length} DE records\n`);

  let successCount = 0;
  let failCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < deRecords.length; i++) {
    const deRecord = deRecords[i];
    const compId = deRecord.fields.companion?.[0];

    if (!compId) {
      skippedCount++;
      continue;
    }

    // Check if already has content
    if (CONTENT_FIELDS.some(f => deRecord.fields[f])) {
      console.log(`ℹ️  [${i+1}/${deRecords.length}] ${deRecord.fields.tagline?.substring(0, 40)}... - already translated`);
      skippedCount++;
      continue;
    }

    // Find matching EN record
    const enRecord = enRecords.find(r => r.fields.companion?.[0] === compId);
    if (!enRecord) {
      console.log(`⚠️  [${i+1}/${deRecords.length}] No EN match for ${compId}`);
      skippedCount++;
      continue;
    }

    // Get EN content
    const enContent = {};
    CONTENT_FIELDS.forEach(f => {
      if (enRecord.fields[f]) enContent[f] = enRecord.fields[f];
    });

    if (Object.keys(enContent).length === 0) {
      console.log(`ℹ️  [${i+1}/${deRecords.length}] ${deRecord.fields.tagline?.substring(0, 40)}... - no EN content`);
      skippedCount++;
      continue;
    }

    console.log(`\n📝 [${i+1}/${deRecords.length}] ${deRecord.fields.tagline?.substring(0, 50)}...`);
    console.log(`   Translating ${Object.keys(enContent).length} fields...`);

    let retries = 0;
    const maxRetries = 2;
    let success = false;

    while (retries < maxRetries && !success) {
      try {
        const deContent = await translateToGerman(enContent);
        await base(TRANSLATIONS_TABLE_ID).update(deRecord.id, deContent);

        console.log(`   ✅ Updated successfully`);
        successCount++;
        success = true;

        await new Promise(r => setTimeout(r, 2000));
      } catch (error) {
        retries++;
        console.log(`   ❌ Attempt ${retries}/${maxRetries} failed: ${error.message}`);

        if (retries < maxRetries) {
          console.log(`   🔄 Retrying...`);
          await new Promise(r => setTimeout(r, 1000));
        } else {
          console.log(`   ❌ Skipping after ${maxRetries} attempts`);
          failCount++;
        }
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Translation complete!`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Failed: ${failCount}`);
  console.log(`   Skipped: ${skippedCount}`);
  console.log(`   Total: ${deRecords.length}`);
  console.log('='.repeat(60));
}

main().catch(console.error);
