const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
  .base(process.env.AIRTABLE_BASE_ID_CG);

const translationsTableId = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

// Features JSON - must be one line, no line breaks
const featuresEN = '[{"icon":"💬","title":"Fully Uncensored Chat","description":"No limits or filters - completely unrestricted NSFW conversations"},{"icon":"🖼️","title":"Explicit NSFW Images","description":"Uncensored adult visuals with no content restrictions"},{"icon":"🎭","title":"Adult AI Companions","description":"NSFW personalities designed for explicit intimate interactions"},{"icon":"🧠","title":"Intimate Memory","description":"Recalls your fantasies, kinks, and explicit preferences"}]';

const featuresNL = '[{"icon":"💬","title":"Volledig Ongecensureerde Chat","description":"Geen limieten of filters - volledig onbeperkte NSFW gesprekken"},{"icon":"🖼️","title":"Expliciete NSFW Afbeeldingen","description":"Ongecensureerde volwassen beelden zonder inhoudsbeperkingen"},{"icon":"🎭","title":"Volwassen AI Companions","description":"NSFW persoonlijkheden ontworpen voor expliciete intieme interacties"},{"icon":"🧠","title":"Intiem Geheugen","description":"Onthoudt je fantasieën, kinks en expliciete voorkeuren"}]';

const featuresPT = '[{"icon":"💬","title":"Chat Totalmente Sem Censura","description":"Sem limites ou filtros - conversas NSFW completamente irrestritas"},{"icon":"🖼️","title":"Imagens NSFW Explícitas","description":"Visuais adultos sem censura e sem restrições de conteúdo"},{"icon":"🎭","title":"Companions de IA Adulto","description":"Personalidades NSFW projetadas para interações íntimas explícitas"},{"icon":"🧠","title":"Memória Íntima","description":"Lembra suas fantasias, fetiches e preferências explícitas"}]';

const featuresDE = '[{"icon":"💬","title":"Vollständig Unzensierter Chat","description":"Keine Grenzen oder Filter - völlig uneingeschränkte NSFW-Gespräche"},{"icon":"🖼️","title":"Explizite NSFW-Bilder","description":"Unzensierte Erwachseneninhalte ohne Inhaltsbeschränkungen"},{"icon":"🎭","title":"Erwachsene KI-Companions","description":"NSFW-Persönlichkeiten für explizite intime Interaktionen entwickelt"},{"icon":"🧠","title":"Intimes Gedächtnis","description":"Erinnert sich an deine Fantasien, Kinks und expliziten Vorlieben"}]';

async function updateSoulkynFeatures() {
  try {
    console.log('Finding Soulkyn records in Companion_Translations...');

    // First, let's see what fields are available
    const allRecords = await base(translationsTableId)
      .select({
        maxRecords: 5
      })
      .all();

    console.log('Sample record fields:', Object.keys(allRecords[0]?.fields || {}));

    // Find all Soulkyn records - try different approaches
    const records = await base(translationsTableId)
      .select({
        maxRecords: 200
      })
      .all();

    console.log(`Total records fetched: ${records.length}`);

    // Filter in JavaScript instead
    const soulkynRecords = records.filter(r => {
      const name = (r.fields['name (from companion)'] && r.fields['name (from companion)'][0]) || '';
      const isMatch = name.toLowerCase().includes('soulkyn');
      if (isMatch) {
        console.log(`Found: ${name} (${r.fields.language})`);
      }
      return isMatch;
    });

    console.log(`Found ${soulkynRecords.length} Soulkyn translation records`);

    for (const record of soulkynRecords) {
      const language = record.fields.language;
      const recordName = (record.fields['name (from companion)'] && record.fields['name (from companion)'][0]) || 'Unknown';

      let features;
      if (language === 'en') features = featuresEN;
      else if (language === 'nl') features = featuresNL;
      else if (language === 'pt') features = featuresPT;
      else if (language === 'de') features = featuresDE;
      else continue;

      console.log(`Updating ${recordName} (${language})...`);

      await base(translationsTableId).update(record.id, {
        features: features
      });

      console.log(`✓ Updated ${recordName}`);
    }

    console.log('\n✅ All Soulkyn features updated successfully!');

  } catch (error) {
    console.error('Error updating features:', error);
  }
}

updateSoulkynFeatures();
