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

async function translateField(fieldName, fieldValue) {
  const prompt = `Translate this ${fieldName} from English to German. Use formal German (Sie-Form). Keep all markdown, HTML tags, and formatting intact.

IMPORTANT: Return ONLY the translated text without any wrapper, explanation, code blocks, or JSON formatting. Do not add "json" or any other prefix.

${fieldValue}`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }]
  });

  let result = message.content[0].text.trim();

  // Remove common unwanted prefixes/wrappers
  result = result.replace(/^```json\n/, '').replace(/\n```$/, '');
  result = result.replace(/^```\n/, '').replace(/\n```$/, '');
  result = result.replace(/^"json\s*/, '');
  result = result.replace(/^json\s*/, '');

  // If it starts with "json and ends with ", remove those
  if (result.startsWith('"json') || result.startsWith('```json')) {
    result = result.replace(/^["']?json["']?\s*/, '');
  }

  return result.trim();
}

async function main() {
  console.log('🚀 Translating English to German (field-by-field)...\n');

  const allRecords = await base(TRANSLATIONS_TABLE_ID).select().all();
  const enRecords = allRecords.filter(r => r.fields.language === 'en');
  const deRecords = allRecords.filter(r => r.fields.language === 'de');

  console.log(`📥 ${enRecords.length} EN, ${deRecords.length} DE records\n`);

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

    // Skip if already has content
    if (CONTENT_FIELDS.some(f => deRecord.fields[f])) {
      console.log(`✓ [${i+1}/${deRecords.length}] ${deRecord.fields.tagline?.substring(0, 45)}... (exists)`);
      skippedCount++;
      continue;
    }

    // Find EN record
    const enRecord = enRecords.find(r => r.fields.companion?.[0] === compId);
    if (!enRecord) {
      skippedCount++;
      continue;
    }

    // Get EN fields
    const enContent = {};
    CONTENT_FIELDS.forEach(f => {
      if (enRecord.fields[f]) enContent[f] = enRecord.fields[f];
    });

    if (Object.keys(enContent).length === 0) {
      skippedCount++;
      continue;
    }

    console.log(`\n📝 [${i+1}/${deRecords.length}] ${deRecord.fields.tagline?.substring(0, 50)}...`);

    try {
      const deContent = {};

      for (const [fieldName, fieldValue] of Object.entries(enContent)) {
        process.stdout.write(`   ${fieldName}...`);
        try {
          deContent[fieldName] = await translateField(fieldName, fieldValue);
          process.stdout.write(` ✓\n`);
          await new Promise(r => setTimeout(r, 500)); // Small delay between fields
        } catch (err) {
          process.stdout.write(` ✗ (${err.message})\n`);
        }
      }

      if (Object.keys(deContent).length > 0) {
        await base(TRANSLATIONS_TABLE_ID).update(deRecord.id, deContent);
        console.log(`   ✅ Updated ${Object.keys(deContent).length}/${Object.keys(enContent).length} fields`);
        successCount++;
      } else {
        console.log(`   ❌ No fields translated`);
        failCount++;
      }

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
