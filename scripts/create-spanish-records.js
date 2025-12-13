/**
 * Script to create empty Spanish translation records for all companions in Airtable
 * Only creates the record with companion link and language='es', no translations
 */

const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN }).base(process.env.AIRTABLE_BASE_ID);

async function getExistingSpanishRecords() {
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

async function getAllCompanions() {
    const companions = [];

    return new Promise((resolve, reject) => {
        base('Table 1').select({
            fields: ['slug', 'name']
        }).eachPage(
            function page(records, fetchNextPage) {
                records.forEach(record => {
                    companions.push({
                        id: record.id,
                        name: record.fields.name || record.fields.slug
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

async function createSpanishRecord(companionId, companionName) {
    return new Promise((resolve, reject) => {
        base('Companion_Translations').create([
            {
                fields: {
                    companion: [companionId],
                    language: 'es'
                }
            }
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
    console.log('🇪🇸 Creating empty Spanish records for all companions\n');

    // Get existing Spanish records
    console.log('Checking existing Spanish records...');
    const existingEs = await getExistingSpanishRecords();
    console.log(`Found ${existingEs.size} existing Spanish records\n`);

    // Get all companions
    console.log('Fetching all companions...');
    const companions = await getAllCompanions();
    console.log(`Found ${companions.length} companions\n`);

    // Filter companions that need Spanish records
    const toCreate = companions.filter(c => !existingEs.has(c.id));
    console.log(`${toCreate.length} companions need Spanish records\n`);

    if (toCreate.length === 0) {
        console.log('✅ All companions already have Spanish records!');
        return;
    }

    let success = 0;
    let failed = 0;

    for (const companion of toCreate) {
        process.stdout.write(`Creating ES record for ${companion.name}... `);

        try {
            await createSpanishRecord(companion.id, companion.name);
            console.log('✓');
            success++;
        } catch (error) {
            console.log('✗', error.message);
            failed++;
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 100));
    }

    console.log(`\n🏁 Done! Created: ${success}, Failed: ${failed}`);
}

main().catch(console.error);
