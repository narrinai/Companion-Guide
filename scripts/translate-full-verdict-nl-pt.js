#!/usr/bin/env node

/**
 * Translate FULL my_verdict field from English to Dutch and Portuguese
 * Handles large texts by splitting into chunks
 */

const Airtable = require('airtable');
const Anthropic = require('@anthropic-ai/sdk');

require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

const anthropicKey = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_KEY_CG;
const anthropic = new Anthropic({ apiKey: anthropicKey });

// Parse command line arguments
const args = process.argv.slice(2);
const targetLanguage = args[0] || 'both'; // 'nl', 'pt', or 'both'
const forceUpdate = args.includes('--force'); // Force update even if translation exists

/**
 * Split text into manageable chunks (by paragraphs)
 */
function splitIntoChunks(text, maxChunkSize = 8000) {
  const paragraphs = text.split(/\n\n+/);
  const chunks = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if ((currentChunk + paragraph).length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

/**
 * Translate text using Claude with chunking for large texts
 */
async function translateWithClaude(text, targetLang) {
  if (!text || text.trim() === '') {
    return '';
  }

  const langName = targetLang === 'nl' ? 'Dutch' : 'Portuguese';
  const chunks = splitIntoChunks(text);

  console.log(`   📦 Split into ${chunks.length} chunks for translation`);

  const translatedChunks = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    console.log(`   🔄 Translating chunk ${i + 1}/${chunks.length} (${chunk.length} chars)...`);

    const prompt = `Translate this text from English to ${langName}.

IMPORTANT INSTRUCTIONS:
- Maintain the same tone, style, and formatting
- Keep all line breaks and paragraph structure exactly as in the original
- If there are headings, keep them as headings
- If there are bullet points (starting with -), keep them as bullet points
- Translate naturally and fluently, not word-for-word
- Return ONLY the translation, no explanation or meta-commentary

Text to translate:

${chunk}`;

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }]
      });

      const translated = message.content[0].text.trim();
      translatedChunks.push(translated);

      // Rate limiting between chunks
      if (i < chunks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`   ❌ Error translating chunk ${i + 1}:`, error.message);
      // On error, keep the original text for this chunk
      translatedChunks.push(chunk);
    }
  }

  return translatedChunks.join('\n\n');
}

/**
 * Get all translation records for a language
 */
async function getTranslationRecords(language) {
  try {
    const records = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: `{language} = "${language}"`
      })
      .all();

    return records;
  } catch (error) {
    console.error(`Error fetching ${language} translations:`, error.message);
    return [];
  }
}

/**
 * Update translation record
 */
async function updateTranslation(recordId, myVerdict) {
  try {
    await base(TRANSLATIONS_TABLE).update([
      {
        id: recordId,
        fields: {
          my_verdict: myVerdict
        }
      }
    ]);
    return true;
  } catch (error) {
    console.error('Error updating translation:', error.message);
    return false;
  }
}

/**
 * Process translations for a specific language
 */
async function processLanguage(targetLang) {
  const langName = targetLang === 'nl' ? 'Dutch' : 'Portuguese';
  console.log(`\n${'='.repeat(60)}`);
  console.log(`\n🌐 Translating my_verdict EN → ${targetLang.toUpperCase()} (${langName})\n`);

  // Get all English records
  console.log('📥 Fetching English translation records...');
  const englishRecords = await getTranslationRecords('en');
  console.log(`   Found ${englishRecords.length} English records`);

  // Get all target language records
  console.log(`📥 Fetching ${langName} translation records...`);
  const targetRecords = await getTranslationRecords(targetLang);
  console.log(`   Found ${targetRecords.length} ${langName} records\n`);

  let updateCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const targetRecord of targetRecords) {
    const companionRecordId = targetRecord.fields.companion ? targetRecord.fields.companion[0] : null;

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
      console.log(`⏭️  No English my_verdict found for companion ID: ${companionRecordId}`);
      skipCount++;
      continue;
    }

    const englishVerdict = englishRecord.fields.my_verdict;
    const currentVerdict = targetRecord.fields.my_verdict || '';

    // Get companion name from the linked record
    const companionName = targetRecord.fields.companion_name || companionRecordId;

    console.log(`\n📝 Processing: ${companionName}`);
    console.log(`   📊 English version: ${englishVerdict.length} characters`);
    console.log(`   📊 Current ${langName} version: ${currentVerdict.length} characters`);

    // Check if already has translation and not forcing update
    if (currentVerdict.length > 1000 && !forceUpdate) {
      console.log(`   ⏭️  Already has ${langName} translation (use --force to override)`);
      skipCount++;
      continue;
    }

    // Translate
    console.log(`   🔄 Translating to ${langName}...`);
    try {
      const translatedVerdict = await translateWithClaude(englishVerdict, targetLang);

      console.log(`   ✅ Translation complete: ${translatedVerdict.length} characters`);

      // Update record
      const success = await updateTranslation(targetRecord.id, translatedVerdict);

      if (success) {
        console.log(`   💾 Saved to Airtable`);
        updateCount++;
      } else {
        console.log(`   ❌ Failed to save to Airtable`);
        errorCount++;
      }
    } catch (error) {
      console.error(`   ❌ Translation error:`, error.message);
      errorCount++;
    }

    // Rate limiting between records
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ ${langName} Translation Complete!`);
  console.log(`   Processed: ${targetRecords.length} records`);
  console.log(`   Updated: ${updateCount}`);
  console.log(`   Skipped: ${skipCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log('\n');

  return { updateCount, skipCount, errorCount };
}

/**
 * Main function
 */
async function main() {
  console.log('\n🌍 Full my_verdict Translation Script\n');
  console.log(`Target Language: ${targetLanguage}`);
  console.log(`Force Update: ${forceUpdate ? 'Yes' : 'No'}`);

  try {
    const results = { nl: null, pt: null };

    if (targetLanguage === 'nl' || targetLanguage === 'both') {
      results.nl = await processLanguage('nl');
    }

    if (targetLanguage === 'pt' || targetLanguage === 'both') {
      results.pt = await processLanguage('pt');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('\n🎉 All Translations Complete!\n');

    if (results.nl) {
      console.log(`Dutch (NL): ${results.nl.updateCount} updated, ${results.nl.skipCount} skipped, ${results.nl.errorCount} errors`);
    }

    if (results.pt) {
      console.log(`Portuguese (PT): ${results.pt.updateCount} updated, ${results.pt.skipCount} skipped, ${results.pt.errorCount} errors`);
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Show usage if --help
if (args.includes('--help')) {
  console.log(`
Usage: node translate-full-verdict-nl-pt.js [language] [options]

Arguments:
  language    Target language: 'nl' (Dutch), 'pt' (Portuguese), or 'both' (default: both)

Options:
  --force     Force update even if translation already exists
  --help      Show this help message

Examples:
  node translate-full-verdict-nl-pt.js           # Translate to both NL and PT
  node translate-full-verdict-nl-pt.js nl        # Translate to Dutch only
  node translate-full-verdict-nl-pt.js pt        # Translate to Portuguese only
  node translate-full-verdict-nl-pt.js both --force    # Force update all translations
  `);
  process.exit(0);
}

main();
