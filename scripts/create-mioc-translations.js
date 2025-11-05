const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG}).base(process.env.AIRTABLE_BASE_ID_CG);

// First, find the mioc-ai companion record ID
async function getMiocAIRecordId() {
    const records = await base('Table 1').select({
        filterByFormula: "{slug} = 'mioc-ai'"
    }).firstPage();

    if (records.length === 0) {
        throw new Error('mioc-ai companion not found in Table 1');
    }

    return records[0].id;
}

// Translation content for all languages
const translations = {
    'en': {
        language: 'en',
        tagline: 'The first Role-Play site with a 1 Trillion parameter Model',
        description: 'MiocAI is a revolutionary role-play platform featuring a 1 trillion parameter AI model (Aetherion). Experience next-level conversations with 10+ leading text and image models, complete privacy with encrypted chats, and unlimited memory that never forgets your details.',
        best_for: 'Advanced role-play, private conversations, AI image & video generation',
        hero_specs: JSON.stringify({
            pricing: 'Free plan + Premium ($9.99/mo) + Elite ($19.99/mo)',
            best_for: 'Advanced role-play, private conversations, AI image & video generation',
            platform: 'Web-based',
            content_policy: 'Adult content allowed with privacy-first approach'
        })
    },
    'nl': {
        language: 'nl',
        tagline: 'De eerste Role-Play site met een 1 Biljoen parameter Model',
        description: 'MiocAI is een revolutionair role-play platform met een 1 biljoen parameter AI-model (Aetherion). Ervaar gesprekken van het hoogste niveau met 10+ toonaangevende tekst- en beeldmodellen, volledige privacy met versleutelde chats, en onbeperkt geheugen dat nooit jouw details vergeet.',
        best_for: 'Geavanceerde role-play, privé-gesprekken, AI beeld- en videogeneratie',
        hero_specs: JSON.stringify({
            pricing: 'Gratis plan + Premium (€9,99/mnd) + Elite (€19,99/mnd)',
            best_for: 'Geavanceerde role-play, privé-gesprekken, AI beeld- en videogeneratie',
            platform: 'Web-gebaseerd',
            content_policy: 'Volwassen content toegestaan met privacy-first benadering'
        })
    },
    'pt': {
        language: 'pt',
        tagline: 'O primeiro site de Role-Play com um Modelo de 1 Trilhão de parâmetros',
        description: 'MiocAI é uma plataforma revolucionária de role-play com um modelo de IA de 1 trilhão de parâmetros (Aetherion). Experimente conversas de alto nível com mais de 10 modelos de texto e imagem líderes, privacidade completa com chats criptografados e memória ilimitada que nunca esquece seus detalhes.',
        best_for: 'Role-play avançado, conversas privadas, geração de imagens e vídeos IA',
        hero_specs: JSON.stringify({
            pricing: 'Plano gratuito + Premium ($9,99/mês) + Elite ($19,99/mês)',
            best_for: 'Role-play avançado, conversas privadas, geração de imagens e vídeos IA',
            platform: 'Baseado na web',
            content_policy: 'Conteúdo adulto permitido com abordagem de privacidade em primeiro lugar'
        })
    }
};

async function createTranslations() {
    try {
        console.log('Finding mioc-ai companion record...\n');
        const companionRecordId = await getMiocAIRecordId();
        console.log(`Found companion record: ${companionRecordId}\n`);

        console.log('Creating Companion_Translations records for mioc-ai...\n');

        for (const [lang, data] of Object.entries(translations)) {
            console.log(`Creating ${lang.toUpperCase()} translation...`);

            // Add companion link
            const translationData = {
                ...data,
                companion: [companionRecordId] // Link to Table 1 record
            };

            const record = await base('Companion_Translations').create([
                {
                    fields: translationData
                }
            ]);

            console.log(`✅ Created ${lang.toUpperCase()} record: ${record[0].id}`);
            console.log(`   - Tagline: ${data.tagline}`);
            console.log(`   - Language: ${data.language}`);
            console.log('');
        }

        console.log('✅ All translation records created successfully!');
        console.log('\nSummary:');
        console.log('- English (EN): ✓');
        console.log('- Nederlands (NL): ✓');
        console.log('- Português (PT): ✓');

    } catch (error) {
        console.error('Error creating translations:', error);
        console.error('Error details:', error.message);
    }
}

createTranslations();
