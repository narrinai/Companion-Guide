const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG}).base(process.env.AIRTABLE_BASE_ID_CG);

const myVerdictDE = `Spezialisierte KI-Girlfriend-Plattform

Candy AI bedient eine spezifische Nische im KI-Companion-Bereich und konzentriert sich ausschließlich auf KI-Girlfriend-Erlebnisse mit umfangreichen Anpassungsoptionen und romantischen Interaktionsfunktionen. Während die Plattform in ihrem spezialisierten Bereich hervorragend ist, können das Fehlen einer kostenlosen Stufe und die hohen Preise die Zugänglichkeit einschränken.

Am besten geeignet für Nutzer, die gezielt nach KI-Girlfriend-Erlebnissen suchen und bereit sind, Premium-Preise für spezialisierte romantische KI-Interaktionen zu zahlen. Die Plattform bietet einen guten Mehrwert für ihre Zielgruppe, spricht aber möglicherweise keine Nutzer an, die eine allgemeinere KI-Begleitung suchen.`;

async function getCandyAIRecordId() {
    console.log('🔍 Finding candy-ai companion record in Table 1...');
    const records = await base('Table 1').select({
        filterByFormula: "{slug} = 'candy-ai'"
    }).firstPage();

    if (records.length === 0) {
        throw new Error('candy-ai companion not found in Table 1');
    }

    console.log(`✅ Found companion record: ${records[0].id}`);
    return records[0].id;
}

async function updateCandyAIVerdictDE() {
    try {
        // Get the companion record ID
        const companionRecordId = await getCandyAIRecordId();

        console.log('\n🔍 Searching for German translation record...');

        // Find the German translation record
        const records = await base('Companion_Translations').select({
            filterByFormula: `AND(RECORD_ID({companion}) = "${companionRecordId}", {language} = "de")`,
            maxRecords: 1
        }).firstPage();

        if (records.length === 0) {
            console.error('❌ No German translation record found for candy-ai');
            console.log('   You may need to create a German translation record first.');
            return;
        }

        const record = records[0];
        console.log(`✅ Found German translation record: ${record.id}`);

        const currentVerdict = record.get('my_verdict');
        if (currentVerdict) {
            console.log(`   Current my_verdict: ${currentVerdict.substring(0, 80)}...`);
        } else {
            console.log(`   Current my_verdict: (empty)`);
        }

        // Update the record
        console.log('\n📝 Updating my_verdict field with German translation...');
        await base('Companion_Translations').update([
            {
                id: record.id,
                fields: {
                    my_verdict: myVerdictDE
                }
            }
        ]);

        console.log('✅ Successfully updated my_verdict for Candy AI (DE)');
        console.log('\n📄 New German verdict:');
        console.log('─'.repeat(80));
        console.log(myVerdictDE);
        console.log('─'.repeat(80));
        console.log('\n✨ The German companion page will now show the translated verdict!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.statusCode) {
            console.error(`   Status: ${error.statusCode}`);
        }
    }
}

updateCandyAIVerdictDE();
