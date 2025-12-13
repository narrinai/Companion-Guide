/**
 * Script to fill Spanish translations based on English translations
 * Uses Claude API for high-quality translations
 */

const Airtable = require('airtable');
const Anthropic = require('@anthropic-ai/sdk');

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(process.env.AIRTABLE_BASE_ID);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Fields to translate (text fields that exist in EN)
const TRANSLATE_FIELDS = [
    'description',
    'best_for',
    'tagline',
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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateText(text, fieldName) {
    if (!text || (typeof text === 'string' && text.trim() === '')) return null;

    // Convert to string if needed
    const textStr = typeof text === 'string' ? text : JSON.stringify(text);

    // Check if it's JSON
    let isJson = false;
    try {
        JSON.parse(textStr);
        isJson = true;
    } catch (e) {
        isJson = false;
    }

    const systemPrompt = isJson
        ? `You are a professional translator specializing in Spanish (Spain). Translate the JSON content from English to Spanish.

CRITICAL RULES:
1. Keep the EXACT same JSON structure - all keys must remain in English
2. Only translate the string VALUES, not the keys
3. Preserve all formatting, emojis, special characters, checkmarks (✅, ⚠️, etc.)
4. Keep technical terms, brand names, and product names unchanged (e.g., "Fantasy AI", "Replika", "NSFW", "AI", "LLM")
5. Keep HTML tags unchanged if present
6. Return ONLY valid JSON, no explanations or markdown code blocks`
        : `You are a professional translator specializing in Spanish (Spain). Translate the following text from English to Spanish.

CRITICAL RULES:
1. Preserve all formatting, line breaks, emojis, and special characters
2. Keep technical terms, brand names, and product names unchanged (e.g., "Fantasy AI", "Replika", "NSFW", "AI", "LLM")
3. Keep HTML tags unchanged if present
4. Return ONLY the translated text, no explanations or markdown wrappers
5. Maintain the same tone and style as the original`;

    try {
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8192,
            system: systemPrompt,
            messages: [{ role: 'user', content: textStr }]
        });

        let result = response.content[0].text.trim();

        // Remove markdown code blocks if present
        if (result.startsWith('```json')) {
            result = result.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (result.startsWith('```')) {
            result = result.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        // For JSON, validate the output
        if (isJson) {
            try {
                JSON.parse(result);
            } catch (e) {
                // Try to extract JSON from the response
                const jsonMatch = result.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                if (jsonMatch) {
                    result = jsonMatch[0];
                    JSON.parse(result); // Validate
                } else {
                    console.warn(`  ⚠️ Invalid JSON output for ${fieldName}, skipping`);
                    return null;
                }
            }
        }

        return result;
    } catch (error) {
        console.error(`  ❌ Error translating ${fieldName}:`, error.message);
        return null;
    }
}

async function getEnglishTranslations() {
    const enTranslations = new Map();

    return new Promise((resolve, reject) => {
        base('Companion_Translations').select({
            filterByFormula: "language = 'en'"
        }).eachPage(
            function page(records, fetchNextPage) {
                records.forEach(record => {
                    if (record.fields.companion && record.fields.companion[0]) {
                        enTranslations.set(record.fields.companion[0], record.fields);
                    }
                });
                fetchNextPage();
            },
            function done(err) {
                if (err) reject(err);
                else resolve(enTranslations);
            }
        );
    });
}

async function getSpanishRecords() {
    const esRecords = [];

    return new Promise((resolve, reject) => {
        base('Companion_Translations').select({
            filterByFormula: "language = 'es'"
        }).eachPage(
            function page(records, fetchNextPage) {
                records.forEach(record => {
                    esRecords.push({
                        id: record.id,
                        companionId: record.fields.companion ? record.fields.companion[0] : null,
                        fields: record.fields
                    });
                });
                fetchNextPage();
            },
            function done(err) {
                if (err) reject(err);
                else resolve(esRecords);
            }
        );
    });
}

async function updateSpanishRecord(recordId, fieldsToUpdate) {
    return new Promise((resolve, reject) => {
        base('Companion_Translations').update([
            {
                id: recordId,
                fields: fieldsToUpdate
            }
        ], function(err, records) {
            if (err) reject(err);
            else resolve(records[0]);
        });
    });
}

async function main() {
    console.log('🇪🇸 Filling Spanish translations from English source\n');
    console.log('Using Claude API for high-quality translations\n');

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('❌ ANTHROPIC_API_KEY environment variable not set');
        process.exit(1);
    }

    // Get English translations
    console.log('Fetching English translations...');
    const enTranslations = await getEnglishTranslations();
    console.log(`Found ${enTranslations.size} English translations\n`);

    // Get Spanish records
    console.log('Fetching Spanish records...');
    const esRecords = await getSpanishRecords();
    console.log(`Found ${esRecords.length} Spanish records\n`);

    let success = 0;
    let failed = 0;
    let skipped = 0;

    for (let i = 0; i < esRecords.length; i++) {
        const esRecord = esRecords[i];
        const enFields = enTranslations.get(esRecord.companionId);

        if (!enFields) {
            console.log(`[${i + 1}/${esRecords.length}] No English source for companion ${esRecord.companionId}, skipping`);
            skipped++;
            continue;
        }

        const companionName = enFields['name (from companion)'] ? enFields['name (from companion)'][0] : 'Unknown';
        console.log(`\n[${i + 1}/${esRecords.length}] 📝 Translating: ${companionName}`);

        const fieldsToUpdate = {};
        let hasUpdates = false;

        for (const field of TRANSLATE_FIELDS) {
            const enValue = enFields[field];

            // Skip if EN doesn't have this field or ES already has it
            if (!enValue || (typeof enValue === 'string' && !enValue.trim())) {
                continue;
            }

            // Skip if ES already has this field filled
            if (esRecord.fields[field] && (typeof esRecord.fields[field] !== 'string' || esRecord.fields[field].trim())) {
                continue;
            }

            process.stdout.write(`  → ${field}... `);
            const translated = await translateText(enValue, field);

            if (translated) {
                fieldsToUpdate[field] = translated;
                hasUpdates = true;
                console.log('✓');
            } else {
                console.log('skipped');
            }

            await sleep(300); // Rate limiting
        }

        if (hasUpdates) {
            try {
                await updateSpanishRecord(esRecord.id, fieldsToUpdate);
                console.log(`  ✅ Updated ${Object.keys(fieldsToUpdate).length} fields`);
                success++;
            } catch (error) {
                console.error(`  ❌ Failed to update:`, error.message);
                failed++;
            }
        } else {
            console.log(`  ℹ️ No fields to update`);
            skipped++;
        }

        // Delay between companions
        await sleep(500);
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`🏁 Done! Success: ${success}, Failed: ${failed}, Skipped: ${skipped}`);
}

main().catch(console.error);
