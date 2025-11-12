const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG}).base(process.env.AIRTABLE_BASE_ID_CG);

// Full German translation of my_verdict
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

    console.log(`✅ Found companion record: ${records[0].id}\n`);
    return records[0].id;
}

async function updateExistingGermanTranslation() {
    try {
        const companionRecordId = await getCandyAIRecordId();

        console.log('🔍 Finding existing German translation record...');
        const records = await base('Companion_Translations').select({
            filterByFormula: `AND(RECORD_ID({companion}) = "${companionRecordId}", {language} = "de")`,
            maxRecords: 1
        }).firstPage();

        if (records.length === 0) {
            console.error('❌ No German translation record found for candy-ai');
            console.log('   The record might have been deleted. Please check Airtable.');
            return;
        }

        const record = records[0];
        console.log(`✅ Found German translation record: ${record.id}`);

        const currentVerdict = record.get('my_verdict');
        if (currentVerdict) {
            console.log(`\n📋 Current my_verdict (first 100 chars):`);
            console.log(`   "${currentVerdict.substring(0, 100)}..."`);
        } else {
            console.log(`\n📋 Current my_verdict: (empty)`);
        }

        console.log('\n📝 Updating my_verdict with FULL German translation...');

        await base('Companion_Translations').update([
            {
                id: record.id,
                fields: {
                    my_verdict: myVerdictDE
                }
            }
        ]);

        console.log('✅ Successfully updated my_verdict for Candy AI (DE)!');
        console.log('\n📄 Complete German my_verdict:');
        console.log('─'.repeat(80));
        console.log(myVerdictDE);
        console.log('─'.repeat(80));
        console.log(`\n✅ Character count: ${myVerdictDE.length} characters`);
        console.log('✨ The German companion page will now show the full translated verdict!');
        console.log('   Test it at: http://localhost:9000/de/companions/candy-ai.html');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.statusCode) {
            console.error(`   Status: ${error.statusCode}`);
        }
        if (error.error) {
            console.error(`   Details: ${JSON.stringify(error.error, null, 2)}`);
        }
    }
}

updateExistingGermanTranslation();
