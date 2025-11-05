const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG}).base(process.env.AIRTABLE_BASE_ID_CG);

// Get companion record ID
async function getMiocAIRecordId() {
    const records = await base('Table 1').select({
        filterByFormula: "{slug} = 'mioc-ai'"
    }).firstPage();

    if (records.length === 0) {
        throw new Error('mioc-ai companion not found in Table 1');
    }

    return records[0].id;
}

// Find existing translation records
async function findTranslations(companionId) {
    const records = await base('Companion_Translations').select({
        filterByFormula: `{companion} = '${companionId}'`
    }).all();

    const translations = {};
    records.forEach(record => {
        const lang = record.fields.language;
        translations[lang] = {
            id: record.id,
            ...record.fields
        };
    });

    return translations;
}

// Complete translation data
const translationData = {
    'en': {
        language: 'en',
        tagline: 'The first Role-Play site with a 1 Trillion parameter Model',
        meta_title: 'Mioc AI Review 2025 - 1 Trillion Parameter AI Role-Play Platform',
        meta_description: 'In-depth Mioc AI review covering the revolutionary 1 trillion parameter Aetherion model, encrypted chats, unlimited memory, and AI image/video generation features.',
        description: 'MiocAI is a revolutionary role-play platform featuring a 1 trillion parameter AI model (Aetherion). Experience next-level conversations with 10+ leading text and image models, complete privacy with encrypted chats, and unlimited memory that never forgets your details.',
        best_for: 'Advanced role-play, private conversations, AI image & video generation',
        hero_specs: JSON.stringify({
            pricing: 'Free plan + Premium ($9.99/mo) + Elite ($19.99/mo)',
            best_for: 'Advanced role-play, private conversations, AI image & video generation',
            platform: 'Web-based',
            content_policy: 'Adult content allowed with privacy-first approach'
        }),
        pros_cons: JSON.stringify({
            pros: [
                '1 Trillion parameter Aetherion AI model',
                'End-to-end encrypted conversations',
                'Unlimited memory that never forgets',
                '10+ leading text and image models',
                'AI video generation capabilities',
                'Image upscaling (4x resolution)',
                'Credit-based flexible pricing',
                'Privacy-first approach'
            ],
            cons: [
                'Credit system requires management',
                'Video generation costs 30 credits',
                'No mobile app yet',
                'Purchased credits expire after 1 year'
            ]
        }),
        my_verdict: 'MiocAI stands out with its 1 trillion parameter Aetherion model, offering unprecedented conversational depth and context understanding. The platform\'s focus on privacy with end-to-end encryption and unlimited memory makes it ideal for users seeking advanced role-play experiences without compromising security. The credit-based system provides flexibility, though power users may find themselves purchasing additional credits for video generation. Overall, MiocAI delivers on its promise of next-level AI interactions with genuine technological innovation.',
        ready_try: 'Ready to experience the power of a 1 trillion parameter AI model? Try MiocAI today with the free plan and discover truly private, unlimited conversations.',
        body_text: 'Experience role-play conversations powered by the Aetherion 1 trillion parameter model. With 10+ leading AI models, encrypted chats, and unlimited memory, MiocAI delivers unmatched depth in AI interactions. Generate images and videos while maintaining complete privacy - your conversations stay encrypted and off the record.'
    },
    'nl': {
        language: 'nl',
        tagline: 'De eerste Role-Play site met een 1 Biljoen parameter Model',
        meta_title: 'Mioc AI Review 2025 - 1 Biljoen Parameter AI Role-Play Platform',
        meta_description: 'Uitgebreide Mioc AI review over het revolutionaire 1 biljoen parameter Aetherion model, versleutelde chats, onbeperkt geheugen en AI beeld/video generatie functies.',
        description: 'MiocAI is een revolutionair role-play platform met een 1 biljoen parameter AI-model (Aetherion). Ervaar gesprekken van het hoogste niveau met 10+ toonaangevende tekst- en beeldmodellen, volledige privacy met versleutelde chats, en onbeperkt geheugen dat nooit jouw details vergeet.',
        best_for: 'Geavanceerde role-play, privé-gesprekken, AI beeld- en videogeneratie',
        hero_specs: JSON.stringify({
            pricing: 'Gratis plan + Premium (€9,99/mnd) + Elite (€19,99/mnd)',
            best_for: 'Geavanceerde role-play, privé-gesprekken, AI beeld- en videogeneratie',
            platform: 'Web-gebaseerd',
            content_policy: 'Volwassen content toegestaan met privacy-first benadering'
        }),
        pros_cons: JSON.stringify({
            pros: [
                '1 Biljoen parameter Aetherion AI model',
                'End-to-end versleutelde gesprekken',
                'Onbeperkt geheugen dat nooit vergeet',
                '10+ toonaangevende tekst- en beeldmodellen',
                'AI videogeneratie mogelijkheden',
                'Beeld upscaling (4x resolutie)',
                'Flexibele credit-gebaseerde prijzen',
                'Privacy-first benadering'
            ],
            cons: [
                'Credit systeem vereist management',
                'Video generatie kost 30 credits',
                'Nog geen mobiele app',
                'Gekochte credits verlopen na 1 jaar'
            ]
        }),
        my_verdict: 'MiocAI valt op met zijn 1 biljoen parameter Aetherion model en biedt ongekende gespreksdiepte en contextbegrip. De focus van het platform op privacy met end-to-end encryptie en onbeperkt geheugen maakt het ideaal voor gebruikers die geavanceerde role-play ervaringen zoeken zonder de veiligheid in gevaar te brengen. Het credit-systeem biedt flexibiliteit, hoewel intensieve gebruikers zich misschien extra credits moeten kopen voor videogeneratie. Over het algemeen levert MiocAI zijn belofte van AI-interacties van het hoogste niveau met echte technologische innovatie.',
        ready_try: 'Klaar om de kracht van een 1 biljoen parameter AI model te ervaren? Probeer MiocAI vandaag met het gratis plan en ontdek echt privé, onbeperkte gesprekken.',
        body_text: 'Ervaar role-play gesprekken aangedreven door het Aetherion 1 biljoen parameter model. Met 10+ toonaangevende AI modellen, versleutelde chats en onbeperkt geheugen, levert MiocAI ongeëvenaarde diepte in AI interacties. Genereer afbeeldingen en video\'s terwijl je volledige privacy behoudt - jouw gesprekken blijven versleuteld en off the record.'
    },
    'pt': {
        language: 'pt',
        tagline: 'O primeiro site de Role-Play com um Modelo de 1 Trilhão de parâmetros',
        meta_title: 'Mioc AI Review 2025 - Plataforma de Role-Play IA com 1 Trilhão de Parâmetros',
        meta_description: 'Revisão detalhada do Mioc AI cobrindo o revolucionário modelo Aetherion de 1 trilhão de parâmetros, chats criptografados, memória ilimitada e recursos de geração de imagens/vídeos IA.',
        description: 'MiocAI é uma plataforma revolucionária de role-play com um modelo de IA de 1 trilhão de parâmetros (Aetherion). Experimente conversas de alto nível com mais de 10 modelos de texto e imagem líderes, privacidade completa com chats criptografados e memória ilimitada que nunca esquece seus detalhes.',
        best_for: 'Role-play avançado, conversas privadas, geração de imagens e vídeos IA',
        hero_specs: JSON.stringify({
            pricing: 'Plano gratuito + Premium ($9,99/mês) + Elite ($19,99/mês)',
            best_for: 'Role-play avançado, conversas privadas, geração de imagens e vídeos IA',
            platform: 'Baseado na web',
            content_policy: 'Conteúdo adulto permitido com abordagem de privacidade em primeiro lugar'
        }),
        pros_cons: JSON.stringify({
            pros: [
                'Modelo IA Aetherion de 1 Trilhão de parâmetros',
                'Conversas criptografadas ponta a ponta',
                'Memória ilimitada que nunca esquece',
                'Mais de 10 modelos líderes de texto e imagem',
                'Capacidades de geração de vídeo IA',
                'Ampliação de imagem (resolução 4x)',
                'Preços flexíveis baseados em créditos',
                'Abordagem de privacidade em primeiro lugar'
            ],
            cons: [
                'Sistema de créditos requer gerenciamento',
                'Geração de vídeo custa 30 créditos',
                'Ainda sem aplicativo móvel',
                'Créditos comprados expiram após 1 ano'
            ]
        }),
        my_verdict: 'MiocAI se destaca com seu modelo Aetherion de 1 trilhão de parâmetros, oferecendo profundidade conversacional e compreensão de contexto sem precedentes. O foco da plataforma na privacidade com criptografia ponta a ponta e memória ilimitada a torna ideal para usuários que buscam experiências avançadas de role-play sem comprometer a segurança. O sistema baseado em créditos oferece flexibilidade, embora usuários avançados possam precisar comprar créditos adicionais para geração de vídeo. No geral, MiocAI cumpre sua promessa de interações IA de próximo nível com genuína inovação tecnológica.',
        ready_try: 'Pronto para experimentar o poder de um modelo de IA de 1 trilhão de parâmetros? Experimente o MiocAI hoje com o plano gratuito e descubra conversas verdadeiramente privadas e ilimitadas.',
        body_text: 'Experimente conversas de role-play alimentadas pelo modelo Aetherion de 1 trilhão de parâmetros. Com mais de 10 modelos de IA líderes, chats criptografados e memória ilimitada, o MiocAI oferece profundidade incomparável em interações de IA. Gere imagens e vídeos mantendo privacidade completa - suas conversas permanecem criptografadas e fora do registro.'
    }
};

async function updateTranslations() {
    try {
        console.log('Finding mioc-ai companion record...\n');
        const companionRecordId = await getMiocAIRecordId();
        console.log(`Found companion record: ${companionRecordId}\n`);

        console.log('Finding existing translation records...\n');
        const existingTranslations = await findTranslations(companionRecordId);
        console.log(`Found ${Object.keys(existingTranslations).length} existing translations\n`);

        console.log('Updating translation records...\n');

        for (const [lang, data] of Object.entries(translationData)) {
            if (existingTranslations[lang]) {
                // Update existing record
                console.log(`Updating ${lang.toUpperCase()} translation (${existingTranslations[lang].id})...`);

                await base('Companion_Translations').update(existingTranslations[lang].id, data);

                console.log(`✅ Updated ${lang.toUpperCase()}`);
                console.log(`   - Meta title: ${data.meta_title}`);
                console.log(`   - Pros: ${JSON.parse(data.pros_cons).pros.length} items`);
                console.log(`   - Cons: ${JSON.parse(data.pros_cons).cons.length} items`);
                console.log('');
            } else {
                // Create new record if doesn't exist
                console.log(`Creating ${lang.toUpperCase()} translation...`);

                const translationWithCompanion = {
                    ...data,
                    companion: [companionRecordId]
                };

                const record = await base('Companion_Translations').create([{
                    fields: translationWithCompanion
                }]);

                console.log(`✅ Created ${lang.toUpperCase()} record: ${record[0].id}`);
                console.log('');
            }
        }

        console.log('✅ All translations updated successfully!');
        console.log('\nSummary:');
        console.log('- English (EN): Complete with meta, pros/cons, verdict');
        console.log('- Nederlands (NL): Volledig met meta, pros/cons, verdict');
        console.log('- Português (PT): Completo com meta, prós/contras, veredicto');

    } catch (error) {
        console.error('Error updating translations:', error);
        console.error('Error details:', error.message);
    }
}

updateTranslations();
