const Airtable = require('airtable');
require('dotenv').config();

/**
 * Translate body_text from English to NL and PT
 * PRESERVES common AI terms in English (AI companion, AI chat, AI girlfriend, etc.)
 *
 * Usage: node scripts/translate-body-texts-preserve-terms.js
 */

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

// Terms to KEEP in English (case insensitive)
const preserveTerms = [
  'AI companion',
  'AI companions',
  'AI chat',
  'AI girlfriend',
  'AI boyfriend',
  'AI character',
  'AI characters',
  'AI roleplay',
  'NSFW',
  'AI technology',
  'AI platform'
];

// Translation mappings (will not translate preserved terms)
const translations = {
  nl: {
    // Opening variations
    "I've spent considerable time exploring": "Ik heb behoorlijk wat tijd besteed aan het verkennen van",
    "caught my attention immediately": "trok meteen mijn aandacht",
    "with its approach to": "met zijn benadering van",
    "After thoroughly testing every feature": "Na grondig testen van elke functie",
    "I can provide genuine insights": "kan ik echte inzichten geven",
    "into what makes this platform unique": "in wat dit platform uniek maakt",
    "Testing": "Het testen van",
    "revealed": "onthulde",
    "From my first interaction to weeks of regular use": "Van mijn eerste interactie tot weken regelmatig gebruik",
    "this platform consistently demonstrated": "heeft dit platform consequent aangetoond",
    "both innovation and reliability": "zowel innovatie als betrouwbaarheid",
    "When I first encountered": "Toen ik voor het eerst in aanraking kwam met",
    "I wondered if it would live up to its promises": "vroeg ik me af of het zijn beloften zou waarmaken",
    "My testing proved that": "Mijn testen bewezen dat",
    "this platform delivers on its core value proposition": "dit platform zijn kernwaardepropositie waarma akt",
    "represents": "vertegenwoordigt",
    "Throughout my evaluation": "Tijdens mijn evaluatie",
    "I focused on real-world usage scenarios": "richtte ik me op real-world gebruiksscenario's",
    "to understand its practical value": "om de praktische waarde te begrijpen",
    "My experience with": "Mijn ervaring met",
    "began with curiosity and evolved into genuine appreciation": "begon met nieuwsgierigheid en evolueerde naar oprechte waardering",
    "This platform offers something distinct": "Dit platform biedt iets unieks",
    "in the": "in de",
    "space": "ruimte",
    "After extensive hands-on testing": "Na uitgebreid hands-on testen",
    "proved to be": "bleek te zijn",
    "The platform's approach to user experience stood out": "De aanpak van het platform voor gebruikerservaring viel op",
    "during my evaluation": "tijdens mijn evaluatie",
    "I approached": "Ik benaderde",
    "with both skepticism and interest": "met zowel scepsis als interesse",
    "My thorough testing revealed capabilities": "Mijn grondige testen onthulden mogelijkheden",
    "that exceeded initial expectations": "die de initiële verwachtingen overtroffen",
    "in several key areas": "op verschillende belangrijke gebieden",

    // Middle paragraph variations
    "The standout features I discovered were": "De opvallende functies die ik ontdekte waren",
    "works seamlessly with": "werkt naadloos samen met",
    "creating an experience that feels cohesive": "waardoor een ervaring ontstaat die samenhangend aanvoelt",
    "This integration sets": "Deze integratie stelt",
    "apart from more basic alternatives": "los van meer basale alternatieven",
    "What impressed me most was how": "Wat mij het meest imponeerde was hoe",
    "handles": "omgaat met",
    "combines with": "combineert met",
    "to deliver genuine value": "om echte waarde te leveren",
    "Each element enhances rather than complicates": "Elk element verbetert in plaats van compliceert",
    "the user experience": "de gebruikerservaring",
    "During my testing": "Tijdens mijn testen",
    "and": "en",
    "proved particularly effective": "bleken bijzonder effectief",
    "works reliably": "werkt betrouwbaar",
    "while": "terwijl",
    "add meaningful depth": "betekenisvolle diepte toevoegt",
    "implementation of": "implementatie van",
    "deserves special mention": "verdient speciale vermelding",
    "exceeded my expectations": "overtrof mijn verwachtingen",
    "Combined with": "Gecombineerd met",

    // Conclusion variations
    "Based on my thorough evaluation": "Op basis van mijn grondige evaluatie",
    "is best for": "is het beste voor",
    "I found it particularly well-suited for users seeking": "Ik vond het bijzonder geschikt voor gebruikers die zoeken naar",
    "quality over quantity": "kwaliteit boven kwantiteit",
    "in their": "in hun",
    "experience": "ervaring",
    "My testing confirmed that": "Mijn testen bevestigden dat",
    "delivers on its core promises": "zijn kernbeloften waarmaakt",
    "offers solid value": "biedt solide waarde",
    "For users seeking this specific type of": "Voor gebruikers die op zoek zijn naar dit specifieke type",
    "it's worth serious consideration": "is het serieuze overweging waard",
    "stands out in the crowded": "valt op in de drukke",
    "market": "markt",
    "My hands-on experience revealed a platform": "Mijn hands-on ervaring onthulde een platform",
    "that prioritizes both functionality and user satisfaction": "dat zowel functionaliteit als gebruikerstevredenheid prioriteit geeft",
    "I'd recommend it to anyone seeking": "Ik zou het aanbevelen aan iedereen die zoekt naar",
    "After weeks of testing": "Na weken van testen",
    "I can confidently say": "kan ik met vertrouwen zeggen",
    "delivers": "levert",
    "experiences": "ervaringen",
    "through thoughtful implementation and reliable performance": "door doordachte implementatie en betrouwbare prestaties",
    "For users prioritizing": "Voor gebruikers die prioriteit geven aan",
    "this platform merits serious evaluation": "verdient dit platform serieuze evaluatie",

    // Common words
    "platform": "platform",
    "with": "met",
    "features": "functies",
    "customization": "aanpassing",
    "customizable": "aanpasbaar",
    "conversations": "gesprekken",
    "interactions": "interacties",
    "images": "afbeeldingen",
    "video": "video",
    "generation": "generatie",
    "creation": "creatie",
    "voice": "stem",
    "calls": "gesprekken",
    "realistic": "realistisch",
    "uncensored": "ongecensureerd",
    "immersive": "meeslepend",
    "advanced": "geavanceerd",
    "premium": "premium",
    "free": "gratis",
    "unlimited": "onbeperkt",
    "romantic": "romantisch",
    "emotional": "emotioneel",
    "support": "ondersteuning",
    "memory": "geheugen",
    "mobile": "mobiel",
    "app": "app",
    "available": "beschikbaar"
  },

  pt: {
    // Opening variations
    "I've spent considerable time exploring": "Passei um tempo considerável explorando",
    "caught my attention immediately": "chamou minha atenção imediatamente",
    "with its approach to": "com sua abordagem para",
    "After thoroughly testing every feature": "Depois de testar minuciosamente cada recurso",
    "I can provide genuine insights": "Posso fornecer insights genuínos",
    "into what makes this platform unique": "sobre o que torna esta plataforma única",
    "Testing": "Testar",
    "revealed": "revelou",
    "From my first interaction to weeks of regular use": "Desde minha primeira interação até semanas de uso regular",
    "this platform consistently demonstrated": "esta plataforma demonstrou consistentemente",
    "both innovation and reliability": "tanto inovação quanto confiabilidade",
    "When I first encountered": "Quando encontrei pela primeira vez",
    "I wondered if it would live up to its promises": "me perguntei se cumpriria suas promessas",
    "My testing proved that": "Meus testes provaram que",
    "this platform delivers on its core value proposition": "esta plataforma cumpre sua proposta de valor central",
    "represents": "representa",
    "Throughout my evaluation": "Durante minha avaliação",
    "I focused on real-world usage scenarios": "concentrei-me em cenários de uso do mundo real",
    "to understand its practical value": "para entender seu valor prático",
    "My experience with": "Minha experiência com",
    "began with curiosity and evolved into genuine appreciation": "começou com curiosidade e evoluiu para apreciação genuína",
    "This platform offers something distinct": "Esta plataforma oferece algo distinto",
    "in the": "no",
    "space": "espaço",
    "After extensive hands-on testing": "Após testes práticos extensivos",
    "proved to be": "provou ser",
    "The platform's approach to user experience stood out": "A abordagem da plataforma para experiência do usuário se destacou",
    "during my evaluation": "durante minha avaliação",
    "I approached": "Abordei",
    "with both skepticism and interest": "com ceticismo e interesse",
    "My thorough testing revealed capabilities": "Meus testes completos revelaram capacidades",
    "that exceeded initial expectations": "que excederam as expectativas iniciais",
    "in several key areas": "em várias áreas-chave",

    // Middle paragraph variations
    "The standout features I discovered were": "Os recursos de destaque que descobri foram",
    "works seamlessly with": "funciona perfeitamente com",
    "creating an experience that feels cohesive": "criando uma experiência coesa",
    "This integration sets": "Esta integração define",
    "apart from more basic alternatives": "além de alternativas mais básicas",
    "What impressed me most was how": "O que mais me impressionou foi como",
    "handles": "lida com",
    "combines with": "combina com",
    "to deliver genuine value": "para entregar valor genuíno",
    "Each element enhances rather than complicates": "Cada elemento melhora em vez de complicar",
    "the user experience": "a experiência do usuário",
    "During my testing": "Durante meus testes",
    "and": "e",
    "proved particularly effective": "provaram ser particularmente eficazes",
    "works reliably": "funciona de forma confiável",
    "while": "enquanto",
    "add meaningful depth": "adiciona profundidade significativa",
    "implementation of": "implementação de",
    "deserves special mention": "merece menção especial",
    "exceeded my expectations": "excedeu minhas expectativas",
    "Combined with": "Combinado com",

    // Conclusion variations
    "Based on my thorough evaluation": "Com base na minha avaliação completa",
    "is best for": "é melhor para",
    "I found it particularly well-suited for users seeking": "Achei particularmente adequado para usuários que buscam",
    "quality over quantity": "qualidade sobre quantidade",
    "in their": "em sua",
    "experience": "experiência",
    "My testing confirmed that": "Meus testes confirmaram que",
    "delivers on its core promises": "cumpre suas promessas principais",
    "offers solid value": "oferece valor sólido",
    "For users seeking this specific type of": "Para usuários que buscam este tipo específico de",
    "it's worth serious consideration": "vale a pena considerar seriamente",
    "stands out in the crowded": "se destaca no lotado",
    "market": "mercado",
    "My hands-on experience revealed a platform": "Minha experiência prática revelou uma plataforma",
    "that prioritizes both functionality and user satisfaction": "que prioriza funcionalidade e satisfação do usuário",
    "I'd recommend it to anyone seeking": "Eu recomendaria para qualquer pessoa que busca",
    "After weeks of testing": "Após semanas de testes",
    "I can confidently say": "Posso dizer com confiança",
    "delivers": "entrega",
    "experiences": "experiências",
    "through thoughtful implementation and reliable performance": "através de implementação cuidadosa e desempenho confiável",
    "For users prioritizing": "Para usuários que priorizam",
    "this platform merits serious evaluation": "esta plataforma merece avaliação séria",

    // Common words
    "platform": "plataforma",
    "with": "com",
    "features": "recursos",
    "customization": "personalização",
    "customizable": "personalizável",
    "conversations": "conversas",
    "interactions": "interações",
    "images": "imagens",
    "video": "vídeo",
    "generation": "geração",
    "creation": "criação",
    "voice": "voz",
    "calls": "chamadas",
    "realistic": "realista",
    "uncensored": "sem censura",
    "immersive": "imersivo",
    "advanced": "avançado",
    "premium": "premium",
    "free": "grátis",
    "unlimited": "ilimitado",
    "romantic": "romântico",
    "emotional": "emocional",
    "support": "suporte",
    "memory": "memória",
    "mobile": "móvel",
    "app": "app",
    "available": "disponível"
  }
};

function translateText(text, targetLang) {
  if (!text || text.trim().length === 0) return text;

  // Create placeholders for terms we want to preserve
  const placeholders = new Map();
  let placeholderIndex = 0;
  let textWithPlaceholders = text;

  // Replace preserved terms with placeholders (case insensitive)
  preserveTerms.forEach(term => {
    const regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    textWithPlaceholders = textWithPlaceholders.replace(regex, (match) => {
      const placeholder = `__PRESERVE_${placeholderIndex}__`;
      placeholders.set(placeholder, match); // Store original case
      placeholderIndex++;
      return placeholder;
    });
  });

  // Now translate
  let translated = textWithPlaceholders;
  const translationMap = translations[targetLang];

  // Sort by length (longest first) to avoid partial replacements
  const sortedKeys = Object.keys(translationMap).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    translated = translated.replace(regex, translationMap[key]);
  }

  // Restore preserved terms
  placeholders.forEach((original, placeholder) => {
    translated = translated.replace(placeholder, original);
  });

  return translated;
}

async function translateAllBodyTexts() {
  console.log('\n🌍 Translating body_text to NL and PT (preserving AI terms)...\n');

  try {
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

      if (!slug || !englishBodyText || englishBodyText.trim().length === 0) {
        skipped++;
        continue;
      }

      console.log(`\n📝 Translating: ${companionName} (${slug})`);

      try {
        // Translate to NL
        const nlBodyText = translateText(englishBodyText, 'nl');

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
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        // Translate to PT
        const ptBodyText = translateText(englishBodyText, 'pt');

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
        }

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

translateAllBodyTexts().then(() => {
  console.log('🎉 All translations complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
