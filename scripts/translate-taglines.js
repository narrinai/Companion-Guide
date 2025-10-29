const Airtable = require('airtable');
require('dotenv').config();

/**
 * Translate taglines for NL and PT companions
 *
 * Uses the same translation logic as description/features translations
 *
 * Usage: node scripts/translate-taglines.js
 */

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

// Translation mappings for taglines
const translations = {
  nl: {
    'AI companion playground': 'AI companion playground',
    'with unlimited chat': 'met onbeperkte chat',
    'image and video generation': 'beeld- en videogeneratie',
    'character creation tools': 'karaktercreatie tools',
    'for comprehensive multimedia experiences': 'voor uitgebreide multimedia-ervaringen',
    'Uncensored AI sex chat playground': 'Ongecensureerde AI seks chat playground',
    'with NSFW content creation': 'met NSFW contentcreatie',
    'and adult videos': 'en volwassen video\'s',
    'AI girlfriend': 'AI vriendin',
    'platform': 'platform',
    'experience': 'ervaring',
    'companion': 'companion',
    'chat': 'chat',
    'generation': 'generatie',
    'character': 'karakter',
    'creation': 'creatie',
    'customization': 'aanpassing',
    'roleplay': 'roleplay',
    'adult': 'volwassen',
    'content': 'inhoud',
    'features': 'functies'
  },
  pt: {
    'AI companion playground': 'Playground de companion de IA',
    'with unlimited chat': 'com chat ilimitado',
    'image and video generation': 'geração de imagem e vídeo',
    'character creation tools': 'ferramentas de criação de personagens',
    'for comprehensive multimedia experiences': 'para experiências multimídia abrangentes',
    'Uncensored AI sex chat playground': 'Playground de chat sexual de IA sem censura',
    'with NSFW content creation': 'com criação de conteúdo NSFW',
    'and adult videos': 'e vídeos adultos',
    'AI girlfriend': 'namorada de IA',
    'platform': 'plataforma',
    'experience': 'experiência',
    'companion': 'companion',
    'chat': 'chat',
    'generation': 'geração',
    'character': 'personagem',
    'creation': 'criação',
    'customization': 'personalização',
    'roleplay': 'roleplay',
    'adult': 'adulto',
    'content': 'conteúdo',
    'features': 'recursos'
  }
};

function translateText(text, targetLang) {
  if (!text || text.trim().length === 0) return text;

  let translated = text;
  const translationMap = translations[targetLang];

  // Sort by length (longest first) to avoid partial replacements
  const sortedKeys = Object.keys(translationMap).sort((a, b) => b.length - a.length);

  for (const key of sortedKeys) {
    const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    translated = translated.replace(regex, translationMap[key]);
  }

  return translated;
}

async function translateAllTaglines() {
  console.log('\n🌍 Translating taglines to NL and PT...\n');

  try {
    // Get all EN taglines first
    const enTranslations = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: '{language} = "en"',
        fields: ['slug (from companion)', 'tagline', 'name (from companion)']
      })
      .all();

    console.log(`✅ Found ${enTranslations.length} English taglines\n`);

    let nlUpdated = 0;
    let ptUpdated = 0;
    let errors = 0;

    for (const enTranslation of enTranslations) {
      const slug = enTranslation.fields['slug (from companion)']?.[0];
      const companionName = enTranslation.fields['name (from companion)']?.[0] || 'Unknown';
      const englishTagline = enTranslation.fields.tagline;

      if (!slug || !englishTagline) {
        continue;
      }

      console.log(`\n📝 Translating: ${companionName} (${slug})`);
      console.log(`   EN: ${englishTagline}`);

      try {
        // Translate to NL
        const nlTagline = translateText(englishTagline, 'nl');
        console.log(`   NL: ${nlTagline}`);

        // Find NL record
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
              fields: { tagline: nlTagline }
            }
          ]);
          nlUpdated++;
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        // Translate to PT
        const ptTagline = translateText(englishTagline, 'pt');
        console.log(`   PT: ${ptTagline}`);

        // Find PT record
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
              fields: { tagline: ptTagline }
            }
          ]);
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
    console.log(`   ❌ Errors: ${errors}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

translateAllTaglines().then(() => {
  console.log('🎉 Tagline translation complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
