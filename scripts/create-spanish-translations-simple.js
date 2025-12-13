/**
 * Script to create Spanish translations for all companions in Airtable
 * Creates basic Spanish translations based on existing translations as template
 */

const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(process.env.AIRTABLE_BASE_ID);

// Common translation mappings
const translations = {
    // Common phrases
    'Unlimited': 'Ilimitado',
    'Free': 'Gratis',
    'Monthly': 'Mensual',
    'Yearly': 'Anual',
    'Premium': 'Premium',
    'Basic': 'Básico',
    'Advanced': 'Avanzado',
    'Pro': 'Pro',
    'Starter': 'Inicial',
    'Ultimate': 'Definitivo',
    'messages': 'mensajes',
    'images': 'imágenes',
    'characters': 'personajes',
    'conversations': 'conversaciones',
    'per month': 'por mes',
    'per day': 'por día',
    'per hour': 'por hora',

    // Features
    'AI girlfriend': 'Novia IA',
    'AI boyfriend': 'Novio IA',
    'AI companion': 'Compañero IA',
    'roleplay': 'juego de roles',
    'chat': 'chat',
    'voice': 'voz',
    'image generation': 'generación de imágenes',
    'uncensored': 'sin censura',
    'NSFW': 'NSFW',
    'SFW': 'SFW',

    // Pros/Cons
    'pros': 'pros',
    'cons': 'contras',

    // Common descriptors
    'platform': 'plataforma',
    'experience': 'experiencia',
    'features': 'funciones',
    'pricing': 'precios',
    'review': 'reseña',
    'guide': 'guía',
    'complete': 'completo',
    'best': 'mejor',
    'top': 'mejores',
};

// Simple translation function (replaces common terms)
function simpleTranslate(text) {
    if (!text) return '';

    let result = text;

    // Replace common terms (case insensitive)
    for (const [en, es] of Object.entries(translations)) {
        const regex = new RegExp(en, 'gi');
        result = result.replace(regex, (match) => {
            // Preserve case
            if (match[0] === match[0].toUpperCase()) {
                return es.charAt(0).toUpperCase() + es.slice(1);
            }
            return es;
        });
    }

    return result;
}

// Translate JSON while preserving structure
function translateJson(jsonStr) {
    try {
        const obj = JSON.parse(jsonStr);
        return JSON.stringify(translateObject(obj), null, 2);
    } catch (e) {
        return simpleTranslate(jsonStr);
    }
}

function translateObject(obj) {
    if (typeof obj === 'string') {
        return simpleTranslate(obj);
    }
    if (Array.isArray(obj)) {
        return obj.map(item => translateObject(item));
    }
    if (typeof obj === 'object' && obj !== null) {
        const result = {};
        for (const [key, value] of Object.entries(obj)) {
            // Keep keys in English, translate values
            result[key] = translateObject(value);
        }
        return result;
    }
    return obj;
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

async function createSpanishTranslation(companionId, enFields, companionName) {
    // Fields to translate
    const fieldsToTranslate = ['description', 'best_for', 'tagline', 'meta_title', 'meta_description', 'pros_cons', 'pricing_plans', 'my_verdict'];

    const translatedFields = {
        companion: [companionId],
        language: 'es'
    };

    for (const field of fieldsToTranslate) {
        const value = enFields[field];
        if (value && value.trim()) {
            // Check if it's JSON
            if (field === 'pros_cons' || field === 'pricing_plans') {
                translatedFields[field] = translateJson(value);
            } else {
                translatedFields[field] = simpleTranslate(value);
            }
        }
    }

    return new Promise((resolve, reject) => {
        base('Companion_Translations').create([
            { fields: translatedFields }
        ], function(err, records) {
            if (err) {
                reject(err);
            } else {
                resolve(records[0]);
            }
        });
    });
}

async function main() {
    console.log('🇪🇸 Creating Spanish translations for all companions\n');

    // Get existing Spanish translations
    console.log('Checking existing Spanish translations...');
    const existingEs = await getExistingTranslations();
    console.log(`Found ${existingEs.size} existing Spanish translations\n`);

    // Get English translations as source
    console.log('Fetching English translations...');
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

    for (const companion of toTranslate) {
        const name = companion.fields.name || companion.fields.slug;
        process.stdout.write(`Creating ES for ${name}... `);

        try {
            // Use English translation if available, otherwise use companion fields directly
            const sourceFields = enTranslations.get(companion.id) || companion.fields;
            await createSpanishTranslation(companion.id, sourceFields, name);
            console.log('✓');
            success++;
        } catch (error) {
            console.log('✗', error.message);
            failed++;
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
    }

    console.log(`\n🏁 Done! Success: ${success}, Failed: ${failed}`);
}

main().catch(console.error);
