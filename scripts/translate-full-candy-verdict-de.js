const Airtable = require('airtable');
const { Anthropic } = require('@anthropic-ai/sdk');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG}).base(process.env.AIRTABLE_BASE_ID_CG);
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const ENGLISH_RECORD_ID = 'rec6h1TPs7CD5viDg';
const GERMAN_RECORD_ID = 'recJAYKqxFG6z8QBp';

async function translateFullVerdict() {
    try {
        console.log('📖 Fetching full English my_verdict...\n');

        const englishRecord = await base('Companion_Translations').find(ENGLISH_RECORD_ID);
        const englishText = englishRecord.get('my_verdict');

        if (!englishText) {
            console.error('❌ No my_verdict found in English record');
            return;
        }

        console.log(`✅ Found English my_verdict: ${englishText.length} characters`);
        console.log(`   Approximately ${Math.ceil(englishText.length / 4)} tokens\n`);

        console.log('🔄 Translating full text to German using Claude...');
        console.log('   This may take a minute due to the length...\n');

        const message = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 16000,
            temperature: 0.3,
            messages: [{
                role: 'user',
                content: `You are a professional German translator. Translate the following English text about an AI companion platform review to German. Maintain the original structure, headings, tone, and formatting. Keep technical terms like "AI girlfriend", "Character.AI", "Replika" etc. as they are commonly used in German tech discussions.

Important:
- Translate naturally and fluently in German
- Keep brand names in English
- Maintain all paragraph breaks and structure
- Keep the casual, conversational tone
- Translate headings appropriately

English text to translate:

${englishText}

Provide ONLY the German translation, no explanations.`
            }]
        });

        const germanText = message.content[0].text;

        console.log(`✅ Translation complete: ${germanText.length} characters\n`);

        console.log('📝 Updating German record in Airtable...');
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
        console.log('   Test it at: http://localhost:9000/de/companions/candy-ai.html');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.statusCode) {
            console.error(`   Status: ${error.statusCode}`);
        }
    }
}

translateFullVerdict();
