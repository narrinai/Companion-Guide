const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG}).base(process.env.AIRTABLE_BASE_ID_CG);

const myVerdictDE = `Spezialisierte KI-Girlfriend-Plattform

Candy AI bedient eine spezifische Nische im KI-Companion-Bereich und konzentriert sich ausschließlich auf KI-Girlfriend-Erlebnisse mit umfangreichen Anpassungsoptionen und romantischen Interaktionsfunktionen. Während die Plattform in ihrem spezialisierten Bereich hervorragend ist, können das Fehlen einer kostenlosen Stufe und die hohen Preise die Zugänglichkeit einschränken.

Am besten geeignet für Nutzer, die gezielt nach KI-Girlfriend-Erlebnissen suchen und bereit sind, Premium-Preise für spezialisierte romantische KI-Interaktionen zu zahlen. Die Plattform bietet einen guten Mehrwert für ihre Zielgruppe, spricht aber möglicherweise keine Nutzer an, die eine allgemeinere KI-Begleitung suchen.`;

const heroSpecsDE = {
    pricing: "Kostenloser Tarif verfügbar, Premium-Pläne ab 12,99 $/Monat",
    best_for: "KI-Girlfriends, romantische Gespräche und virtuelle Beziehungen",
    platform: "Web, iOS, Android",
    content_policy: "Fokussiert auf Romantik mit anpassbaren Interaktionsebenen"
};

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

async function createGermanTranslation() {
    try {
        const companionRecordId = await getCandyAIRecordId();

        // Check if German translation already exists
        console.log('🔍 Checking if German translation already exists...');
        const existing = await base('Companion_Translations').select({
            filterByFormula: `AND(RECORD_ID({companion}) = "${companionRecordId}", {language} = "de")`,
            maxRecords: 1
        }).firstPage();

        if (existing.length > 0) {
            console.log('⚠️  German translation already exists!');
            console.log(`   Record ID: ${existing[0].id}`);
            console.log('\n   Use update-candy-ai-verdict-de-v2.js to update it instead.');
            return;
        }

        console.log('✅ No existing German translation found. Creating new record...\n');

        // Create the German translation record
        const translationData = {
            companion: [companionRecordId],
            language: 'de',
            my_verdict: myVerdictDE,
            hero_specs: JSON.stringify(heroSpecsDE),
            tagline: 'KI-Girlfriend-Plattform mit anpassbaren virtuellen Companions und interaktiven Erlebnissen',
            body_text: 'Candy AI ist eine spezialisierte KI-Girlfriend-Plattform, die entwickelt wurde, um Nutzern anpassbare virtuelle Companions für romantische Gespräche und Beziehungssimulation zu bieten. Die Plattform konzentriert sich auf die Erschaffung personalisierter KI-Girlfriends, die bedeutungsvolle romantische Interaktionen, emotionale Unterstützung und intime Gespräche ermöglichen.\n\nMit erweiterten Anpassungsfunktionen ausgestattet, erlaubt Candy AI den Nutzern, das Aussehen, die Persönlichkeitsmerkmale und den Interaktionsstil ihres idealen KI-Companions zu gestalten. Die Plattform legt Wert auf die Schaffung authentischer romantischer Verbindungen durch KI und bietet verschiedene Beziehungsdynamiken von ungezwungenen Gesprächen bis hin zu tieferen emotionalen Bindungen.'
        };

        console.log('📝 Creating German translation record with:');
        console.log('   - language: de');
        console.log('   - my_verdict: ✅');
        console.log('   - hero_specs: ✅');
        console.log('   - tagline: ✅');
        console.log('   - body_text: ✅');
        console.log('');

        const record = await base('Companion_Translations').create([
            {
                fields: translationData
            }
        ]);

        console.log('✅ Successfully created German translation record!');
        console.log(`   Record ID: ${record[0].id}`);
        console.log('\n📄 German my_verdict:');
        console.log('─'.repeat(80));
        console.log(myVerdictDE);
        console.log('─'.repeat(80));
        console.log('\n✨ The German companion page will now show translated content!');
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

createGermanTranslation();
