const Airtable = require('airtable');
require('dotenv').config();

// Configure Airtable
const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG}).base(process.env.AIRTABLE_BASE_ID_CG);

const myVerdictDE = `Spezialisierte KI-Girlfriend-Plattform

Candy AI bedient eine spezifische Nische im KI-Companion-Bereich und konzentriert sich ausschließlich auf KI-Girlfriend-Erlebnisse mit umfangreichen Anpassungsoptionen und romantischen Interaktionsfunktionen. Während die Plattform in ihrem spezialisierten Bereich hervorragend ist, können das Fehlen einer kostenlosen Stufe und die hohen Preise die Zugänglichkeit einschränken.

Am besten geeignet für Nutzer, die gezielt nach KI-Girlfriend-Erlebnissen suchen und bereit sind, Premium-Preise für spezialisierte romantische KI-Interaktionen zu zahlen. Die Plattform bietet einen guten Mehrwert für ihre Zielgruppe, spricht aber möglicherweise keine Nutzer an, die eine allgemeinere KI-Begleitung suchen.`;

async function updateCandyAIVerdictDE() {
    try {
        console.log('🔍 Searching for Candy AI German translation record...');

        // Find the German translation record for candy-ai
        const records = await base('Companion_Translations').select({
            filterByFormula: "AND({slug} = 'candy-ai', {lang} = 'de')",
            maxRecords: 1
        }).firstPage();

        if (records.length === 0) {
            console.error('❌ No German translation record found for candy-ai');
            return;
        }

        const record = records[0];
        console.log(`✅ Found record: ${record.id}`);
        console.log(`   Current my_verdict: ${record.get('my_verdict')?.substring(0, 50)}...`);

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
        console.log('\n📄 New verdict:');
        console.log(myVerdictDE);

    } catch (error) {
        console.error('❌ Error updating Airtable:', error.message);
        if (error.statusCode) {
            console.error(`   Status: ${error.statusCode}`);
        }
    }
}

updateCandyAIVerdictDE();
