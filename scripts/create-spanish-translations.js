/**
 * Script to create Spanish translations for all companions in Airtable
 * Uses Claude API for high-quality translations
 */

const Airtable = require('airtable');
const Anthropic = require('@anthropic-ai/sdk');

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(process.env.AIRTABLE_BASE_ID);
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Fields to translate
const TRANSLATE_FIELDS = [
    'description',
    'best_for',
    'tagline',
    'meta_title',
    'meta_description',
    'pros_cons',
    'pricing_plans',
    'my_verdict'
];

// Rate limiting
const DELAY_MS = 500;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function translateText(text, fieldName) {
    if (!text || text.trim() === '') return '';

    // Check if it's JSON
    let isJson = false;
    try {
        JSON.parse(text);
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
4. Keep technical terms, brand names, and product names unchanged
5. Keep HTML tags unchanged if present
6. Return ONLY valid JSON, no explanations or markdown

Example:
Input: {"pros": ["Great features", "Easy to use"]}
Output: {"pros": ["Excelentes funciones", "Fácil de usar"]}`
        : `You are a professional translator specializing in Spanish (Spain). Translate the following text from English to Spanish.

CRITICAL RULES:
1. Preserve all formatting, line breaks, emojis, and special characters
2. Keep technical terms, brand names, and product names unchanged
3. Keep HTML tags unchanged if present
4. Return ONLY the translated text, no explanations or markdown wrappers
5. Maintain the same tone and style as the original`;

    try {
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 8192,
            system: systemPrompt,
            messages: [{ role: 'user', content: text }]
        });

        let result = response.content[0].text;

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
                    console.warn(`  ⚠️ Invalid JSON output for ${fieldName}, using original`);
                    return text;
                }
            }
        }

        return result;
    } catch (error) {
        console.error(`  ❌ Error translating ${fieldName}:`, error.message);
        return text; // Return original on error
    }
}

async function getExistingTranslations() {
    const existing = new Set();

    return new Promise((resolve, reject) => {
        base('Companion_Translations').select({
            filterByFormula: "language = 'es'",
            fields: ['companion', 'language']
        }).eachPage(
            function page(records, fetchNextPage) {
                records.forEach(record => {
                    if (record.fields.companion && record.fields.companion[0]) {
                        existing.add(record.fields.companion[0]);
                    }
                });
                fetchNextPage();
            },
            function done(err) {
                if (err) reject(err);
                else resolve(existing);
            }
        );
    });
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

async function getAllCompanions() {
    const companions = [];

    return new Promise((resolve, reject) => {
        base('Table 1').select({
            fields: ['slug', 'name', 'description', 'best_for', 'tagline', 'meta_title', 'meta_description', 'pros_cons', 'pricing_plans', 'my_verdict']
        }).eachPage(
            function page(records, fetchNextPage) {
                records.forEach(record => {
                    companions.push({
                        id: record.id,
                        fields: record.fields
                    });
                });
                fetchNextPage();
            },
            function done(err) {
                if (err) reject(err);
                else resolve(companions);
            }
        );
    });
}

async function createSpanishTranslation(companionId, sourceFields, companionName) {
    console.log(`\n📝 Translating: ${companionName}`);

    const translatedFields = {
        companion: [companionId],
        language: 'es'
    };

    for (const field of TRANSLATE_FIELDS) {
        const value = sourceFields[field];
        if (value && value.trim()) {
            process.stdout.write(`  → ${field}... `);
            const translated = await translateText(value, field);
            translatedFields[field] = translated;
            console.log('✓');
            await sleep(DELAY_MS);
        }
    }

    return new Promise((resolve, reject) => {
        base('Companion_Translations').create([
            { fields: translatedFields }
        ], function(err, records) {
            if (err) {
                reject(err);
            } else {
                console.log(`  ✅ Created Spanish translation`);
                resolve(records[0]);
            }
        });
    });
}

async function main() {
    console.log('🇪🇸 Creating Spanish translations for all companions\n');
    console.log('Using Claude API for high-quality translations\n');

    // Check API key
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('❌ ANTHROPIC_API_KEY environment variable not set');
        process.exit(1);
    }

    // Get existing Spanish translations
    console.log('Checking existing Spanish translations...');
    const existingEs = await getExistingTranslations();
    console.log(`Found ${existingEs.size} existing Spanish translations\n`);

    // Get English translations as source
    console.log('Fetching English translations as source...');
    const enTranslations = await getEnglishTranslations();
    console.log(`Found ${enTranslations.size} English translations\n`);

    // Get all companions
    console.log('Fetching all companions...');
    const companions = await getAllCompanions();
    console.log(`Found ${companions.length} companions\n`);

    // Filter companions that need Spanish translations
    const toTranslate = companions.filter(c => !existingEs.has(c.id));
    console.log(`${toTranslate.length} companions need Spanish translations\n`);

    if (toTranslate.length === 0) {
        console.log('✅ All companions already have Spanish translations!');
        return;
    }

    let success = 0;
    let failed = 0;

    for (let i = 0; i < toTranslate.length; i++) {
        const companion = toTranslate[i];
        const name = companion.fields.name || companion.fields.slug;
        console.log(`\n[${i + 1}/${toTranslate.length}] Processing ${name}`);

        try {
            // Use English translation if available, otherwise use companion fields directly
            const sourceFields = enTranslations.get(companion.id) || companion.fields;
            await createSpanishTranslation(companion.id, sourceFields, name);
            success++;
        } catch (error) {
            console.error(`❌ Failed: ${name}`, error.message);
            failed++;
        }

        // Delay between companions
        if (i < toTranslate.length - 1) {
            await sleep(1000);
        }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`🏁 Done! Success: ${success}, Failed: ${failed}`);
}

main().catch(console.error);
