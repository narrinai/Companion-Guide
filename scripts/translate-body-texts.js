const Airtable = require('airtable');
require('dotenv').config();

/**
 * Translate body_text from English to NL and PT
 *
 * This script will:
 * 1. Fetch all English companions with body_text
 * 2. For each companion, fetch NL and PT translations
 * 3. Translate the English body_text to NL and PT
 * 4. Update Airtable with translated body_text
 *
 * Usage: node scripts/translate-body-texts.js
 */

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

// Translation mappings for common phrases
const translations = {
  nl: {
    'During my extensive testing of': 'Tijdens mijn uitgebreide testen van',
    'I found it to be': 'ontdekte ik dat het',
    'The platform combines': 'Het platform combineert',
    'advanced AI technology': 'geavanceerde AI-technologie',
    'with intuitive features': 'met intuïtieve functies',
    'to deliver': 'om',
    'genuinely engaging': 'echt boeiende',
    'and personalized': 'en gepersonaliseerde',
    'companion experiences': 'companion-ervaringen',
    'that exceeded my expectations': 'te leveren die mijn verwachtingen overtroffen',

    'What impressed me most': 'Wat mij het meest imponeerde',
    'during my hands-on testing': 'tijdens mijn hands-on testen',
    'was the platform\'s': 'waren de',
    'imaginative ai chat': 'imaginatieve AI-chat',
    'realistic images': 'realistische afbeeldingen',
    'consistent characters': 'consistente personages',
    'long-term memory': 'langetermijngeheugen',
    'combined with': 'gecombineerd met',
    'creates a highly immersive experience': 'creëert een zeer meeslepende ervaring',
    'that keeps conversations feeling fresh and engaging': 'die gesprekken fris en boeiend houdt',
    'throughout extended use': 'tijdens langdurig gebruik',
    'This attention to detail': 'Deze aandacht voor detail',
    'really enhances': 'verbetert echt',
    'the overall experience': 'de algehele ervaring',
    'and sets it apart from competitors': 'en onderscheidt het van concurrenten',
    'The attention to detail in these features': 'De aandacht voor detail in deze functies',
    'creates an experience that feels': 'creëert een ervaring die',
    'polished and well-thought-out': 'gepolijst en goed doordacht aanvoelt',

    'In my testing': 'Tijdens mijn testen',
    'In my experience': 'Naar mijn ervaring',
    'delivers what I consider': 'levert wat ik beschouw als',
    'the platform excels in providing': 'excelleert het platform in het bieden van',
    'Based on my thorough testing': 'Op basis van mijn grondige testen',
    'I found': 'ontdekte ik dat',
    'I was particularly impressed by': 'Ik was vooral onder de indruk van',
    'personalized interactions': 'gepersonaliseerde interacties',
    'consistent character personalities': 'consistente karakterpersonaliteiten',
    'advanced memory capabilities': 'geavanceerde geheugenmogelijkheden',
    'If you\'re seeking': 'Als je op zoek bent naar',
    'meaningful AI companion experiences': 'betekenisvolle AI companion-ervaringen',
    'with genuine depth': 'met echte diepgang',
    'I can confidently say': 'kan ik met vertrouwen zeggen',
    'this platform delivers': 'dat dit platform levert',
    'From my hands-on experience': 'Uit mijn hands-on ervaring',
    'is ideal for users seeking': 'is ideaal voor gebruikers die op zoek zijn naar',
    'immersive AI companion experiences': 'meeslepende AI companion-ervaringen',
    'with advanced features': 'met geavanceerde functies',
    'and real personalization': 'en echte personalisatie',
    'The combination of': 'De combinatie van',
    'natural conversations': 'natuurlijke gesprekken',
    'multimedia capabilities': 'multimediamogelijkheden',
    'makes it excellent for': 'maakt het uitstekend voor',
    'building ongoing relationships': 'het opbouwen van voortdurende relaties',
    'with AI companions': 'met AI companions',
    'that feel authentic and engaging': 'die authentiek en boeiend aanvoelen',

    // NSFW related terms
    'unfiltered NSFW AI chat': 'ongefilterde NSFW AI-chat',
    'with personalized AI companions': 'met gepersonaliseerde AI companions',
    'Engage in unique': 'Ga unieke',
    'uncensored conversations': 'ongecensureerde gesprekken aan',
    'tailored just for you': 'speciaal voor jou op maat gemaakt',
    'uncensored interactions': 'ongecensureerde interacties',
    'truly immersive companion experiences': 'echt meeslepende companion-ervaringen',
    'through video, image, and audio content': 'via video, afbeelding en audio-inhoud',
    'NSFW AI roleplay experience': 'NSFW AI-roleplay ervaring',
    'strong customization options': 'sterke aanpassingsmogelijkheden',
    'multimedia generation capabilities': 'multimedia generatiemogelijkheden',
    'advanced memory system': 'geavanceerd geheugensysteem',

    // Common feature terms
    'voice chat': 'spraakchat',
    'image generation': 'afbeeldingsgeneratie',
    'character creation': 'karaktercreatie',
    'roleplay scenarios': 'roleplay-scenario\'s',
    'emotional intelligence': 'emotionele intelligentie',
    'adaptive responses': 'adaptieve reacties',
    'custom personalities': 'aangepaste persoonlijkheden'
  },

  pt: {
    'During my extensive testing of': 'Durante meus testes extensivos do',
    'I found it to be': 'descobri que é',
    'The platform combines': 'A plataforma combina',
    'advanced AI technology': 'tecnologia de IA avançada',
    'with intuitive features': 'com recursos intuitivos',
    'to deliver': 'para oferecer',
    'genuinely engaging': 'genuinamente envolventes',
    'and personalized': 'e personalizadas',
    'companion experiences': 'experiências de companion',
    'that exceeded my expectations': 'que superaram minhas expectativas',

    'What impressed me most': 'O que mais me impressionou',
    'during my hands-on testing': 'durante meus testes práticos',
    'was the platform\'s': 'foram os',
    'imaginative ai chat': 'chat de IA imaginativo',
    'realistic images': 'imagens realistas',
    'consistent characters': 'personagens consistentes',
    'long-term memory': 'memória de longo prazo',
    'combined with': 'combinados com',
    'creates a highly immersive experience': 'cria uma experiência altamente imersiva',
    'that keeps conversations feeling fresh and engaging': 'que mantém as conversas frescas e envolventes',
    'throughout extended use': 'durante uso prolongado',
    'This attention to detail': 'Esta atenção aos detalhes',
    'really enhances': 'realmente melhora',
    'the overall experience': 'a experiência geral',
    'and sets it apart from competitors': 'e a diferencia dos concorrentes',
    'The attention to detail in these features': 'A atenção aos detalhes nestes recursos',
    'creates an experience that feels': 'cria uma experiência que parece',
    'polished and well-thought-out': 'polida e bem pensada',

    'In my testing': 'Em meus testes',
    'In my experience': 'Na minha experiência',
    'delivers what I consider': 'oferece o que considero',
    'the platform excels in providing': 'a plataforma se destaca em fornecer',
    'Based on my thorough testing': 'Com base em meus testes completos',
    'I found': 'descobri que',
    'I was particularly impressed by': 'Fiquei particularmente impressionado com',
    'personalized interactions': 'interações personalizadas',
    'consistent character personalities': 'personalidades de personagens consistentes',
    'advanced memory capabilities': 'recursos avançados de memória',
    'If you\'re seeking': 'Se você está procurando',
    'meaningful AI companion experiences': 'experiências significativas de companion de IA',
    'with genuine depth': 'com profundidade genuína',
    'I can confidently say': 'posso dizer com confiança',
    'this platform delivers': 'que esta plataforma oferece',
    'From my hands-on experience': 'Da minha experiência prática',
    'is ideal for users seeking': 'é ideal para usuários que buscam',
    'immersive AI companion experiences': 'experiências imersivas de companion de IA',
    'with advanced features': 'com recursos avançados',
    'and real personalization': 'e personalização real',
    'The combination of': 'A combinação de',
    'natural conversations': 'conversas naturais',
    'multimedia capabilities': 'recursos multimídia',
    'makes it excellent for': 'torna excelente para',
    'building ongoing relationships': 'construir relacionamentos contínuos',
    'with AI companions': 'com companions de IA',
    'that feel authentic and engaging': 'que parecem autênticos e envolventes',

    // NSFW related terms
    'unfiltered NSFW AI chat': 'chat de IA NSFW sem filtros',
    'with personalized AI companions': 'com companions de IA personalizados',
    'Engage in unique': 'Participe de',
    'uncensored conversations': 'conversas sem censura únicas',
    'tailored just for you': 'personalizadas especialmente para você',
    'uncensored interactions': 'interações sem censura',
    'truly immersive companion experiences': 'experiências de companion verdadeiramente imersivas',
    'through video, image, and audio content': 'através de conteúdo de vídeo, imagem e áudio',
    'NSFW AI roleplay experience': 'experiência de roleplay de IA NSFW',
    'strong customization options': 'fortes opções de personalização',
    'multimedia generation capabilities': 'recursos de geração multimídia',
    'advanced memory system': 'sistema de memória avançado',

    // Common feature terms
    'voice chat': 'chat de voz',
    'image generation': 'geração de imagens',
    'character creation': 'criação de personagens',
    'roleplay scenarios': 'cenários de roleplay',
    'emotional intelligence': 'inteligência emocional',
    'adaptive responses': 'respostas adaptativas',
    'custom personalities': 'personalidades personalizadas'
  }
};

function translateText(text, targetLang) {
  let translated = text;
  const translationMap = translations[targetLang];

  // Sort by length (longest first) to avoid partial replacements
  const sortedKeys = Object.keys(translationMap).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    // Case-insensitive replacement
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    translated = translated.replace(regex, translationMap[key]);
  }

  return translated;
}

async function translateAllBodyTexts() {
  console.log('\n🌍 Starting body_text translation to NL and PT...\n');

  try {
    // Get all English translations with body_text
    const englishTranslations = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: '{language} = "en"',
        sort: [{ field: 'name (from companion)', direction: 'asc' }]
      })
      .all();

    console.log(`✅ Found ${englishTranslations.length} English companions\n`);

    let nlUpdated = 0;
    let ptUpdated = 0;
    let skipped = 0;
    let errors = 0;

    for (const enTranslation of englishTranslations) {
      const slug = enTranslation.fields['slug (from companion)']?.[0];
      const companionName = enTranslation.fields['name (from companion)']?.[0] || 'Unknown';
      const englishBodyText = enTranslation.fields.body_text;

      if (!slug) {
        console.log(`⚠️  Skipping ${companionName} - no slug`);
        skipped++;
        continue;
      }

      if (!englishBodyText || englishBodyText.trim().length === 0) {
        console.log(`⚠️  Skipping ${companionName} - no English body_text`);
        skipped++;
        continue;
      }

      console.log(`\n📝 Translating: ${companionName} (${slug})`);

      try {
        // Translate to NL
        const nlBodyText = translateText(englishBodyText, 'nl');

        // Find NL translation record
        const nlRecords = await base(TRANSLATIONS_TABLE)
          .select({
            filterByFormula: `AND({slug (from companion)} = "${slug}", {language} = "nl")`,
            maxRecords: 1
          })
          .all();

        if (nlRecords.length > 0) {
          await base(TRANSLATIONS_TABLE).update([
            {
              id: nlRecords[0].id,
              fields: { body_text: nlBodyText }
            }
          ]);
          console.log(`   ✅ NL updated (${nlBodyText.split(' ').length} words)`);
          nlUpdated++;
        } else {
          console.log(`   ⚠️  NL record not found`);
        }

        // Small delay
        await new Promise(resolve => setTimeout(resolve, 100));

        // Translate to PT
        const ptBodyText = translateText(englishBodyText, 'pt');

        // Find PT translation record
        const ptRecords = await base(TRANSLATIONS_TABLE)
          .select({
            filterByFormula: `AND({slug (from companion)} = "${slug}", {language} = "pt")`,
            maxRecords: 1
          })
          .all();

        if (ptRecords.length > 0) {
          await base(TRANSLATIONS_TABLE).update([
            {
              id: ptRecords[0].id,
              fields: { body_text: ptBodyText }
            }
          ]);
          console.log(`   ✅ PT updated (${ptBodyText.split(' ').length} words)`);
          ptUpdated++;
        } else {
          console.log(`   ⚠️  PT record not found`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   🇳🇱 NL Updated: ${nlUpdated}`);
    console.log(`   🇵🇹 PT Updated: ${ptUpdated}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the script
translateAllBodyTexts().then(() => {
  console.log('🎉 All translations complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
