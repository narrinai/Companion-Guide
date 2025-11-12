const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG}).base(process.env.AIRTABLE_BASE_ID_CG);

// Record IDs from the Airtable URLs
const GERMAN_RECORD_ID = 'recJAYKqxFG6z8QBp';   // German (DE) record

// Only the actual verdict section (first 2 paragraphs), not the entire 4-week journey
const germanVerdictOnly = `Spezialisierte KI-Girlfriend-Plattform

Candy AI bedient eine spezifische Nische im KI-Companion-Bereich und konzentriert sich ausschließlich auf KI-Girlfriend-Erlebnisse mit umfangreichen Anpassungsoptionen und romantischen Interaktionsfunktionen. Während die Plattform in ihrem spezialisierten Bereich hervorragend ist, können das Fehlen einer kostenlosen Stufe und die hohen Preise die Zugänglichkeit einschränken.

Am besten geeignet für Nutzer, die gezielt nach KI-Girlfriend-Erlebnissen suchen und bereit sind, Premium-Preise für spezialisierte romantische KI-Interaktionen zu zahlen. Die Plattform bietet einen guten Mehrwert für ihre Zielgruppe, spricht aber möglicherweise keine Nutzer an, die eine allgemeinere KI-Begleitung suchen.`;

async function updateGermanVerdictOnly() {
    try {
        console.log('📝 Updating German my_verdict with SHORT verdict (not full 4-week journey)...\n');

        // Update the German record with ONLY the verdict section
        await base('Companion_Translations').update([
            {
                id: GERMAN_RECORD_ID,
                fields: {
                    my_verdict: germanVerdictOnly
                }
            }
        ]);

        console.log('✅ Successfully updated German my_verdict!');
        console.log(`   Record ID: ${GERMAN_RECORD_ID}`);
        console.log(`\n📄 German verdict (${germanVerdictOnly.length} characters):`);
        console.log('─'.repeat(80));
        console.log(germanVerdictOnly);
        console.log('─'.repeat(80));
        console.log('\n✨ Updated with SHORT verdict only (not the full English review)');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.statusCode) {
            console.error(`   Status: ${error.statusCode}`);
        }
    }
}

updateGermanVerdictOnly();
