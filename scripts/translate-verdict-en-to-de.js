const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG}).base(process.env.AIRTABLE_BASE_ID_CG);

// Record IDs from the Airtable URLs
const ENGLISH_RECORD_ID = 'rec6h1TPs7CD5viDg';  // English (EN) record
const GERMAN_RECORD_ID = 'recJAYKqxFG6z8QBp';   // German (DE) record

async function translateVerdictToGerman() {
    try {
        console.log('📖 Fetching English my_verdict...\n');

        // Get the English record
        const englishRecord = await base('Companion_Translations').find(ENGLISH_RECORD_ID);
        const englishVerdict = englishRecord.get('my_verdict');

        if (!englishVerdict) {
            console.error('❌ No my_verdict found in English record');
            return;
        }

        console.log('✅ Found English my_verdict:');
        console.log('─'.repeat(80));
        console.log(englishVerdict);
        console.log('─'.repeat(80));
        console.log(`\nLength: ${englishVerdict.length} characters\n`);

        // Translate to German
        console.log('🔄 Translating to German...\n');

        const germanVerdict = translateText(englishVerdict);

        console.log('✅ German translation:');
        console.log('─'.repeat(80));
        console.log(germanVerdict);
        console.log('─'.repeat(80));
        console.log(`\nLength: ${germanVerdict.length} characters\n`);

        // Update the German record
        console.log('📝 Updating German record...');
        await base('Companion_Translations').update([
            {
                id: GERMAN_RECORD_ID,
                fields: {
                    my_verdict: germanVerdict
                }
            }
        ]);

        console.log('✅ Successfully updated German my_verdict!');
        console.log(`   Record ID: ${GERMAN_RECORD_ID}`);

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.statusCode) {
            console.error(`   Status: ${error.statusCode}`);
        }
    }
}

function translateText(englishText) {
    // Translation mapping for common phrases
    const translations = {
        'Specialized AI Girlfriend Platform': 'Spezialisierte KI-Girlfriend-Plattform',
        'serves a specific niche': 'bedient eine spezifische Nische',
        'focusing exclusively on': 'konzentriert sich ausschließlich auf',
        'AI girlfriend experiences': 'KI-Girlfriend-Erlebnisse',
        'with deep customization': 'mit umfangreichen Anpassungsoptionen',
        'romantic interaction features': 'romantischen Interaktionsfunktionen',
        'While it excels': 'Während die Plattform hervorragend ist',
        'in its specialized area': 'in ihrem spezialisierten Bereich',
        'the lack of a free tier': 'das Fehlen einer kostenlosen Stufe',
        'high pricing': 'hohe Preise',
        'may limit accessibility': 'können die Zugänglichkeit einschränken',
        'Best suited for users': 'Am besten geeignet für Nutzer',
        'specifically seeking': 'die gezielt suchen',
        'willing to pay premium prices': 'bereit sind, Premium-Preise zu zahlen',
        'specialized romantic AI interactions': 'spezialisierte romantische KI-Interaktionen',
        'The platform offers good value': 'Die Plattform bietet einen guten Mehrwert',
        'for its target audience': 'für ihre Zielgruppe',
        'but may not appeal to users': 'spricht aber möglicherweise keine Nutzer an',
        'seeking more general AI companionship': 'die eine allgemeinere KI-Begleitung suchen',
        'AI companion space': 'KI-Companion-Bereich',
        'and romantic interaction features': 'und romantischen Interaktionsfunktionen'
    };

    let germanText = englishText;

    // Apply translations
    for (const [english, german] of Object.entries(translations)) {
        germanText = germanText.replace(new RegExp(english, 'gi'), german);
    }

    // Manual full translation (in case phrase-by-phrase doesn't work well)
    // This is the same translation we created earlier
    if (englishText.includes('Specialized AI Girlfriend Platform') &&
        englishText.includes('Candy AI serves a specific niche')) {

        germanText = `Spezialisierte KI-Girlfriend-Plattform

Candy AI bedient eine spezifische Nische im KI-Companion-Bereich und konzentriert sich ausschließlich auf KI-Girlfriend-Erlebnisse mit umfangreichen Anpassungsoptionen und romantischen Interaktionsfunktionen. Während die Plattform in ihrem spezialisierten Bereich hervorragend ist, können das Fehlen einer kostenlosen Stufe und die hohen Preise die Zugänglichkeit einschränken.

Am besten geeignet für Nutzer, die gezielt nach KI-Girlfriend-Erlebnissen suchen und bereit sind, Premium-Preise für spezialisierte romantische KI-Interaktionen zu zahlen. Die Plattform bietet einen guten Mehrwert für ihre Zielgruppe, spricht aber möglicherweise keine Nutzer an, die eine allgemeinere KI-Begleitung suchen.`;
    }

    return germanText;
}

translateVerdictToGerman();
