const Airtable = require('airtable');
require('dotenv').config();

/**
 * Expand feature descriptions in Companion_Translations
 *
 * Takes short descriptions and expands them with more detail
 * based on the feature title and companion context
 *
 * Usage: node scripts/expand-feature-descriptions.js
 */

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const COMPANIONS_TABLE_ID = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE_ID = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

/**
 * Expand a description based on title and language
 */
function expandDescription(title, currentDesc, lang, companionName) {
  const lowerTitle = title.toLowerCase();

  // Common expansions by feature type (keep descriptions concise, max ~80 chars)
  const expansions = {
    nl: {
      'free': 'Volledig gratis zonder verborgen kosten',
      '100% free': 'Onbeperkte toegang tot alle features zonder kosten',
      'privacy': 'Gesprekken blijven volledig privé en veilig',
      'privacy first': 'AI draait lokaal, niemand kan je gesprekken lezen',
      'nsfw': 'Onbeperkte adult content zonder censuur',
      'nsfw content': 'Adult conversaties zonder filters of beperkingen',
      'customization': 'Pas uiterlijk, persoonlijkheid en gedrag volledig aan',
      'voice': 'Realistische stemconversaties met natuurlijke emotie',
      'voice chat': 'Echte voice calls voor diepere connecties',
      'image generation': 'Genereer gepersonaliseerde afbeeldingen op verzoek',
      'memory': 'Onthoudt gesprekken en belangrijke momenten',
      'roleplay': 'Interactieve scenario\'s en fantasieën',
      'multilingual': 'Chat in meerdere talen',
      'mobile': 'Geoptimaliseerde iOS en Android apps',
      'mobile first': 'Native app voor beste mobiele ervaring',
      'avatar': '3D representatie voor persoonlijke band',
      '3d avatar': 'Realistische avatar met animaties',
      'emotional support': 'Emotionele begeleiding wanneer je het nodig hebt',
      'uncensored': 'Geen filters op gesprekken en content',
      'character creation': 'Maak eigen characters met unieke persoonlijkheden',
      'community': 'Deel en ontdek characters met andere gebruikers',
      'api access': 'Integreer via developer API',
      'deep': 'Diepgaande en betekenisvolle gesprekken',
      'advanced': 'Geavanceerde features en mogelijkheden',
      'long-term': 'Bouw een langdurige relatie op',
      'personalized': 'Volledig gepersonaliseerde ervaring',
      'realistic': 'Natuurlijke en realistische interacties'
    },
    pt: {
      'free': 'Totalmente gratuito sem custos ocultos',
      '100% free': 'Acesso ilimitado a todos os recursos sem custos',
      'privacy': 'Conversas permanecem privadas e seguras',
      'privacy first': 'IA local, ninguém pode ler suas conversas',
      'nsfw': 'Conteúdo adulto ilimitado sem censura',
      'nsfw content': 'Conversas adultas sem filtros ou limitações',
      'customization': 'Personalize aparência, personalidade e comportamento',
      'voice': 'Conversas de voz realistas com emoção natural',
      'voice chat': 'Chamadas de voz para conexões profundas',
      'image generation': 'Gere imagens personalizadas sob demanda',
      'memory': 'Lembra conversas e momentos importantes',
      'roleplay': 'Cenários interativos e fantasias',
      'multilingual': 'Chat em vários idiomas',
      'mobile': 'Apps otimizados para iOS e Android',
      'mobile first': 'App nativo para melhor experiência móvel',
      'avatar': 'Representação 3D para conexão pessoal',
      '3d avatar': 'Avatar realista com animações',
      'emotional support': 'Apoio emocional quando você precisar',
      'uncensored': 'Sem filtros em conversas e conteúdo',
      'character creation': 'Crie characters com personalidades únicas',
      'community': 'Compartilhe e descubra characters',
      'api access': 'Integre via API de desenvolvedor',
      'deep': 'Conversas profundas e significativas',
      'advanced': 'Recursos e funcionalidades avançadas',
      'long-term': 'Construa um relacionamento duradouro',
      'personalized': 'Experiência completamente personalizada',
      'realistic': 'Interações naturais e realistas'
    }
  };

  // Try to find exact match first
  const exactMatch = expansions[lang]?.[lowerTitle];
  if (exactMatch) return exactMatch;

  // Try partial matches
  for (const [key, value] of Object.entries(expansions[lang] || {})) {
    if (lowerTitle.includes(key) || key.includes(lowerTitle)) {
      return value;
    }
  }

  // Clean up "with advanced features" in descriptions
  if (currentDesc) {
    let cleanedDesc = currentDesc;

    // Remove English phrases from descriptions
    cleanedDesc = cleanedDesc.replace(/\s*with advanced features\s*/gi, '');
    cleanedDesc = cleanedDesc.replace(/\s*with advanced\s*/gi, '');
    cleanedDesc = cleanedDesc.trim();

    // If description is in English and we have a translation, translate common phrases
    if (lang === 'nl') {
      // Main translations
      cleanedDesc = cleanedDesc.replace(/^Virtual dating$/i, 'Virtuele dates en romantische gesprekken');
      cleanedDesc = cleanedDesc.replace(/^Romantic companion$/i, 'Romantische AI companion ervaring');
      cleanedDesc = cleanedDesc.replace(/^Love-centered$/i, 'Gericht op liefde en romantiek');
      cleanedDesc = cleanedDesc.replace(/^Romantic focus$/i, 'Focus op romantiek en intimiteit');
      cleanedDesc = cleanedDesc.replace(/^Intimate conversations$/i, 'Intieme en persoonlijke gesprekken');
      cleanedDesc = cleanedDesc.replace(/^Virtual romance$/i, 'Virtuele romantiek en relaties');
      cleanedDesc = cleanedDesc.replace(/^Build your ideal AI$/i, 'Creëer je ideale AI companion');
      cleanedDesc = cleanedDesc.replace(/^Custom photos & videos$/i, 'Gepersonaliseerde foto\'s en video\'s');
      cleanedDesc = cleanedDesc.replace(/^Interactive narratives$/i, 'Interactieve verhalen en scenario\'s');

      // Additional common descriptions
      cleanedDesc = cleanedDesc.replace(/^AI-generated videos?$/i, 'AI-gegenereerde video\'s van je companion');
      cleanedDesc = cleanedDesc.replace(/^Anime & realistic$/i, 'Anime en realistische character stijlen');
      cleanedDesc = cleanedDesc.replace(/^High-quality AI$/i, 'Hoogwaardige AI modellen voor beste kwaliteit');
      cleanedDesc = cleanedDesc.replace(/^Premium models?$/i, 'Premium AI modellen voor betere output');
      cleanedDesc = cleanedDesc.replace(/^Character variety$/i, 'Duizenden characters in verschillende stijlen');
      cleanedDesc = cleanedDesc.replace(/^Deep conversations?$/i, 'Diepgaande en betekenisvolle gesprekken');
      cleanedDesc = cleanedDesc.replace(/^Long-term memory$/i, 'Langetermijn geheugen van jullie relatie');
      cleanedDesc = cleanedDesc.replace(/^Thousands of bots?$/i, 'Duizenden characters om uit te kiezen');
      cleanedDesc = cleanedDesc.replace(/^No restrictions?$/i, 'Geen beperkingen op gesprekken');
      cleanedDesc = cleanedDesc.replace(/^Unlimited (.*?)$/i, 'Onbeperkt $1');

      // More English phrases
      cleanedDesc = cleanedDesc.replace(/^Custom photos?$/i, 'Genereer gepersonaliseerde foto\'s');
      cleanedDesc = cleanedDesc.replace(/^Love-focused$/i, 'Gericht op romantiek en liefde');
      cleanedDesc = cleanedDesc.replace(/^Reward progression$/i, 'Verdien beloningen en vooruitgang');
      cleanedDesc = cleanedDesc.replace(/^Adult focused$/i, 'Focus op adult content en NSFW');
      cleanedDesc = cleanedDesc.replace(/^Visual exchange$/i, 'Deel en ontvang foto\'s');
      cleanedDesc = cleanedDesc.replace(/^Private & secure$/i, 'Privé en veilig versleuteld');
      cleanedDesc = cleanedDesc.replace(/^Engaging activities$/i, 'Interactieve activiteiten en spellen');
      cleanedDesc = cleanedDesc.replace(/^Productivity boost$/i, 'Verhoog je productiviteit met AI hulp');

      // Short Dutch phrases to expand
      if (cleanedDesc === 'Chat in meerdere talen') cleanedDesc = 'Ondersteunt chat in meerdere talen';

      // Generic expansion for very short descriptions (< 25 chars) that weren't caught above
      if (cleanedDesc && cleanedDesc.length < 25 && cleanedDesc.length > 0) {
        // Don't expand if it looks like it's already a good short description
        if (!/^(Gratis|Onbeperkt|Premium|Pro|Basis)/i.test(cleanedDesc)) {
          cleanedDesc = cleanedDesc + ' voor betere ervaring';
        }
      }
    } else if (lang === 'pt') {
      // Main translations
      cleanedDesc = cleanedDesc.replace(/^Virtual dating$/i, 'Encontros virtuais e conversas românticas');
      cleanedDesc = cleanedDesc.replace(/^Romantic companion$/i, 'Experiência de companheiro romântico');
      cleanedDesc = cleanedDesc.replace(/^Love-centered$/i, 'Focado em amor e romance');
      cleanedDesc = cleanedDesc.replace(/^Romantic focus$/i, 'Foco em romance e intimidade');
      cleanedDesc = cleanedDesc.replace(/^Intimate conversations$/i, 'Conversas íntimas e pessoais');
      cleanedDesc = cleanedDesc.replace(/^Virtual romance$/i, 'Romance virtual e relacionamentos');
      cleanedDesc = cleanedDesc.replace(/^Build your ideal AI$/i, 'Crie seu AI companion ideal');
      cleanedDesc = cleanedDesc.replace(/^Custom photos & videos$/i, 'Fotos e vídeos personalizados');
      cleanedDesc = cleanedDesc.replace(/^Interactive narratives$/i, 'Narrativas e cenários interativos');

      // Additional common descriptions
      cleanedDesc = cleanedDesc.replace(/^AI-generated videos?$/i, 'Vídeos gerados por IA do seu companion');
      cleanedDesc = cleanedDesc.replace(/^Anime & realistic$/i, 'Estilos de characters anime e realistas');
      cleanedDesc = cleanedDesc.replace(/^High-quality AI$/i, 'Modelos de IA de alta qualidade');
      cleanedDesc = cleanedDesc.replace(/^Premium models?$/i, 'Modelos premium de IA para melhor output');
      cleanedDesc = cleanedDesc.replace(/^Character variety$/i, 'Milhares de characters em vários estilos');
      cleanedDesc = cleanedDesc.replace(/^Deep conversations?$/i, 'Conversas profundas e significativas');
      cleanedDesc = cleanedDesc.replace(/^Long-term memory$/i, 'Memória de longo prazo do relacionamento');
      cleanedDesc = cleanedDesc.replace(/^Thousands of bots?$/i, 'Milhares de characters para escolher');
      cleanedDesc = cleanedDesc.replace(/^No restrictions?$/i, 'Sem restrições nas conversas');
      cleanedDesc = cleanedDesc.replace(/^Unlimited (.*?)$/i, 'Ilimitado $1');

      // Short Portuguese phrases to expand
      if (cleanedDesc === 'Encontros virtuais') cleanedDesc = 'Encontros virtuais e experiências românticas';
      if (cleanedDesc === 'Suporte global') cleanedDesc = 'Suporte para múltiplos idiomas globalmente';
      if (cleanedDesc === 'Toque pessoal') cleanedDesc = 'Personalização completa da experiência';
      if (cleanedDesc === 'Centrado no amor') cleanedDesc = 'Experiência focada em romance e amor';
      if (cleanedDesc === 'Sem restrições') cleanedDesc = 'Sem censura ou restrições nas conversas';
      if (cleanedDesc === 'Personalidades diversas') cleanedDesc = 'Ampla variedade de personalidades únicas';
      if (cleanedDesc === 'Adapta-se ao estilo') cleanedDesc = 'Adapta-se ao seu estilo de conversa';
      if (cleanedDesc === 'Respostas inteligentes') cleanedDesc = 'Respostas inteligentes e contextual';
      if (cleanedDesc === 'Cultura Kawaii') cleanedDesc = 'Personagens estilo anime e cultura kawaii';
      if (cleanedDesc === 'Vozes japonesas') cleanedDesc = 'Vozes autênticas em japonês';
      if (cleanedDesc === 'Respostas animadas') cleanedDesc = 'Respostas com animações expressivas';
      if (cleanedDesc === 'IA expressiva') cleanedDesc = 'IA com animações e expressões faciais';
      if (cleanedDesc === '24 opções de voz') cleanedDesc = 'Escolha entre 24 vozes diferentes';
      if (cleanedDesc === 'Vídeos de beijo') cleanedDesc = 'Gere vídeos íntimos personalizados';
      if (cleanedDesc === 'Encontros virtuais') cleanedDesc = 'Simule encontros românticos virtuais';

      // Expand very short Portuguese descriptions
      if (cleanedDesc === 'Conversas íntimas') cleanedDesc = 'Conversas íntimas e românticas';
      if (cleanedDesc === 'Experiência imersiva') cleanedDesc = 'Experiência imersiva com voz realista';
      if (cleanedDesc === 'Conteúdo adulto') cleanedDesc = 'Geração de imagens adultas personalizadas';
      if (cleanedDesc === 'Foco romântico') cleanedDesc = 'Experiência focada em romance';
      if (cleanedDesc === 'Personalização profunda') cleanedDesc = 'Personalização completa de aparência e personalidade';
      if (cleanedDesc === 'Jogos e atividades') cleanedDesc = 'Jogos interativos e atividades divertidas';
      if (cleanedDesc === 'Múltiplas personalidades') cleanedDesc = 'Acesso a múltiplas personalidades únicas';
      if (cleanedDesc === 'Conversas adultas') cleanedDesc = 'Conversas adultas sem restrições';

      // Generic expansion for very short Portuguese descriptions (< 25 chars)
      if (cleanedDesc && cleanedDesc.length < 25 && cleanedDesc.length > 0) {
        // Don't expand if it looks like it's already a good short description
        if (!/^(Grátis|Ilimitado|Premium|Pro|Básico)/i.test(cleanedDesc)) {
          cleanedDesc = cleanedDesc + ' para melhor experiência';
        }
      }
    } else if (lang === 'nl') {
      // Expand very short Dutch descriptions
      if (cleanedDesc === 'Virtuele romance') cleanedDesc = 'Virtuele romance en intieme connecties';
      if (cleanedDesc === 'Intieme gesprekken') cleanedDesc = 'Intieme en persoonlijke gesprekken';
    }

    return cleanedDesc;
  }

  return currentDesc;
}

/**
 * Process features for a single record
 */
function expandFeatures(featuresJson, lang, companionName) {
  if (!featuresJson) return featuresJson;

  try {
    let features;
    if (typeof featuresJson === 'string') {
      features = JSON.parse(featuresJson);
    } else {
      features = featuresJson;
    }

    if (!Array.isArray(features)) return featuresJson;

    const expandedFeatures = features.map(feature => {
      const expanded = { ...feature };

      if (expanded.description) {
        const newDesc = expandDescription(
          expanded.title || '',
          expanded.description,
          lang,
          companionName
        );

        if (newDesc !== expanded.description) {
          expanded.description = newDesc;
        }
      }

      return expanded;
    });

    return JSON.stringify(expandedFeatures);

  } catch (error) {
    console.error('Error expanding features:', error);
    return featuresJson;
  }
}

/**
 * Main function
 */
async function expandAllFeatures() {
  console.log('🚀 Expanding feature descriptions in Companion_Translations...\n');

  try {
    // Fetch all NL/PT translation records
    console.log('📥 Fetching NL/PT translations...');
    const translationRecords = await base(TRANSLATIONS_TABLE_ID)
      .select({
        filterByFormula: 'OR({language} = "nl", {language} = "pt")',
        maxRecords: 1000
      })
      .all();

    console.log(`Found ${translationRecords.length} NL/PT translation records\n`);

    let updatedCount = 0;
    let unchangedCount = 0;
    let errorCount = 0;

    for (const record of translationRecords) {
      const fields = record.fields;
      const companionName = fields['name (from companion)']?.[0] || 'Unknown';
      const language = fields.language || 'unknown';
      const currentFeatures = fields.features;

      try {
        if (!currentFeatures) {
          console.log(`⏭️  ${companionName} (${language}): No features field`);
          unchangedCount++;
          continue;
        }

        // Expand the features
        const expandedFeatures = expandFeatures(currentFeatures, language, companionName);

        // Check if anything changed
        if (expandedFeatures === currentFeatures) {
          unchangedCount++;
          continue;
        }

        // Update the record
        await base(TRANSLATIONS_TABLE_ID).update(record.id, {
          features: expandedFeatures
        });

        console.log(`✅ ${companionName} (${language}): Expanded feature descriptions`);

        // Show sample
        try {
          const parsed = JSON.parse(expandedFeatures);
          if (parsed[0]) {
            console.log(`   Sample: ${parsed[0].title} → ${parsed[0].description.substring(0, 60)}...`);
          }
        } catch (e) {
          // Silent fail
        }
        console.log('');

        updatedCount++;

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ ${companionName} (${language}): ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n📈 Summary:');
    console.log(`   ✅ Updated: ${updatedCount}`);
    console.log(`   ⏭️  Unchanged: ${unchangedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log(`   📊 Total processed: ${translationRecords.length}`);

    console.log('\n🎉 Done!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
expandAllFeatures()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Unhandled error:', error);
    process.exit(1);
  });
