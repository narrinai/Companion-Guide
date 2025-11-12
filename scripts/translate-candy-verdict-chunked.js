const Airtable = require('airtable');
const { Anthropic } = require('@anthropic-ai/sdk');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG}).base(process.env.AIRTABLE_BASE_ID_CG);
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const ENGLISH_RECORD_ID = 'rec6h1TPs7CD5viDg';
const GERMAN_RECORD_ID = 'recJAYKqxFG6z8QBp';

// Split text into chunks by paragraphs, keeping chunks under ~3000 chars
function splitIntoChunks(text, maxChunkSize = 3000) {
    const paragraphs = text.split('\n\n');
    const chunks = [];
    let currentChunk = '';

    for (const para of paragraphs) {
        if (currentChunk.length + para.length + 2 > maxChunkSize && currentChunk.length > 0) {
            chunks.push(currentChunk.trim());
            currentChunk = para;
        } else {
            currentChunk += (currentChunk ? '\n\n' : '') + para;
        }
    }

    if (currentChunk) {
        chunks.push(currentChunk.trim());
    }

    return chunks;
}

async function translateChunk(chunk, chunkNum, totalChunks) {
    console.log(`🔄 Translating chunk ${chunkNum}/${totalChunks} (${chunk.length} chars)...`);

    try {
        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 4000,
            temperature: 0.3,
            messages: [{
                role: 'user',
                content: `You are a professional German translator. Translate this English text about an AI companion review to German.

Keep:
- Brand names in English (Candy AI, Character.AI, Replika, etc.)
- Technical terms commonly used in German tech discussions
- Original structure and formatting
- Casual, conversational tone
- All paragraph breaks

English text:

${chunk}

Provide ONLY the German translation, no explanations.`
            }]
        });

        const translation = message.content[0].text;
        console.log(`✅ Chunk ${chunkNum} translated (${translation.length} chars)\n`);
        return translation;
    } catch (error) {
        console.error(`❌ Error translating chunk ${chunkNum}:`, error.message);
        throw error;
    }
}

async function translateFullVerdict() {
    try {
        console.log('📖 Fetching English my_verdict...\n');

        const englishRecord = await base('Companion_Translations').find(ENGLISH_RECORD_ID);
        const englishText = englishRecord.get('my_verdict');

        if (!englishText) {
            console.error('❌ No my_verdict found in English record');
            return;
        }

        console.log(`✅ Found English my_verdict: ${englishText.length} characters`);

        // Split into chunks
        const chunks = splitIntoChunks(englishText);
        console.log(`📦 Split into ${chunks.length} chunks\n`);

        // Translate each chunk sequentially
        const translatedChunks = [];
        for (let i = 0; i < chunks.length; i++) {
            const translated = await translateChunk(chunks[i], i + 1, chunks.length);
            translatedChunks.push(translated);

            // Small delay between chunks to avoid rate limits
            if (i < chunks.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Combine all translated chunks
        const germanText = translatedChunks.join('\n\n');

        console.log(`\n✅ Full translation complete: ${germanText.length} characters`);
        console.log(`📝 Updating German record in Airtable...`);

        await base('Companion_Translations').update([
            {
                id: GERMAN_RECORD_ID,
                fields: {
                    my_verdict: germanText
                }
            }
        ]);

        console.log('✅ Successfully updated German my_verdict!');
        console.log(`   Record ID: ${GERMAN_RECORD_ID}`);
        console.log(`   Length: ${germanText.length} characters`);
        console.log('\n📄 First 500 characters of German translation:');
        console.log('─'.repeat(80));
        console.log(germanText.substring(0, 500) + '...');
        console.log('─'.repeat(80));
        console.log('\n✨ Full German translation uploaded to Airtable!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.statusCode) {
            console.error(`   Status: ${error.statusCode}`);
        }
    }
}

translateFullVerdict();
