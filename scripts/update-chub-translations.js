/**
 * Update Chub AI translations in Companion_Translations table
 */

const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
  .base(process.env.AIRTABLE_BASE_ID_CG);

const translationsTable = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

const translations = {
  en: {
    tagline: 'Uncensored AI character platform with advanced LLMs and complete creative freedom',
    my_verdict: `Chub AI stands out as one of the most powerful uncensored AI character platforms available. With access to models like Soji 671B - multiple times larger than what competitors offer - the quality of outputs is noticeably superior.

The platform's commitment to creative freedom means no artificial content restrictions, making it ideal for serious roleplay enthusiasts who want complete control over their AI interactions.

The tiered pricing structure offers good value, with Mercury at $5/month being an affordable entry point for casual users. The Mars tier at $20/month unlocks the full potential with unlimited access to their most powerful models and voice features.

If you're looking for an uncensored AI platform with advanced features and don't mind the learning curve, Chub AI delivers exceptional value for character-based AI interactions.`
  },
  nl: {
    tagline: 'Ongecensureerd AI-karakterplatform met geavanceerde LLM\'s en volledige creatieve vrijheid',
    my_verdict: `Chub AI onderscheidt zich als een van de krachtigste ongecensureerde AI-karakterplatforms die beschikbaar zijn. Met toegang tot modellen zoals Soji 671B - meerdere malen groter dan wat concurrenten bieden - is de kwaliteit van de output merkbaar superieur.

De toewijding van het platform aan creatieve vrijheid betekent geen kunstmatige inhoudsbeperkingen, waardoor het ideaal is voor serieuze roleplay-enthousiastelingen die volledige controle willen over hun AI-interacties.

De gelaagde prijsstructuur biedt goede waarde, met Mercury voor $5/maand als betaalbaar instapniveau voor casual gebruikers. De Mars-tier voor $20/maand ontgrendelt het volledige potentieel met onbeperkte toegang tot hun krachtigste modellen en spraakfuncties.

Als je op zoek bent naar een ongecensureerd AI-platform met geavanceerde functies en je de leercurve niet erg vindt, levert Chub AI uitzonderlijke waarde voor karakter-gebaseerde AI-interacties.`
  },
  de: {
    tagline: 'Unzensierte KI-Charakter-Plattform mit fortschrittlichen LLMs und vollständiger kreativer Freiheit',
    my_verdict: `Chub AI hebt sich als eine der leistungsstärksten unzensierten KI-Charakter-Plattformen ab. Mit Zugang zu Modellen wie Soji 671B - um ein Vielfaches größer als bei Wettbewerbern - ist die Qualität der Ausgaben merklich überlegen.

Das Engagement der Plattform für kreative Freiheit bedeutet keine künstlichen Inhaltsbeschränkungen, was sie ideal für ernsthafte Roleplay-Enthusiasten macht, die vollständige Kontrolle über ihre KI-Interaktionen wünschen.

Die gestaffelte Preisstruktur bietet guten Wert, wobei Mercury für $5/Monat ein erschwinglicher Einstiegspunkt für Gelegenheitsnutzer ist. Die Mars-Stufe für $20/Monat schaltet das volle Potenzial mit unbegrenztem Zugang zu den leistungsstärksten Modellen und Sprachfunktionen frei.

Wenn Sie eine unzensierte KI-Plattform mit fortschrittlichen Funktionen suchen und die Lernkurve nicht scheuen, bietet Chub AI außergewöhnlichen Wert für charakterbasierte KI-Interaktionen.`
  },
  pt: {
    tagline: 'Plataforma de personagens IA sem censura com LLMs avançados e liberdade criativa completa',
    my_verdict: `Chub AI se destaca como uma das plataformas de personagens IA sem censura mais poderosas disponíveis. Com acesso a modelos como Soji 671B - várias vezes maior do que os concorrentes oferecem - a qualidade das saídas é notavelmente superior.

O compromisso da plataforma com a liberdade criativa significa sem restrições artificiais de conteúdo, tornando-a ideal para entusiastas sérios de roleplay que desejam controle total sobre suas interações com IA.

A estrutura de preços em camadas oferece bom valor, com Mercury a $5/mês sendo um ponto de entrada acessível para usuários casuais. O nível Mars a $20/mês desbloqueia todo o potencial com acesso ilimitado aos seus modelos mais poderosos e recursos de voz.

Se você está procurando uma plataforma de IA sem censura com recursos avançados e não se importa com a curva de aprendizado, Chub AI oferece valor excepcional para interações de IA baseadas em personagens.`
  }
};

async function updateTranslations() {
  console.log('Updating Chub AI translations in Companion_Translations...\n');

  for (const [lang, data] of Object.entries(translations)) {
    try {
      // Find the record for chub-ai in this language
      const records = await base(translationsTable)
        .select({
          filterByFormula: `AND({slug (from companion)} = 'chub-ai', {language} = '${lang}')`,
          maxRecords: 1
        })
        .all();

      if (records.length === 0) {
        console.log(`⚠️ No record found for chub-ai (${lang}), skipping...`);
        continue;
      } else {
        // Update existing record
        const recordId = records[0].id;

        await base(translationsTable).update(recordId, {
          tagline: data.tagline,
          my_verdict: data.my_verdict
        });

        console.log(`✅ Updated ${lang}: ${recordId}`);
      }
    } catch (error) {
      console.error(`❌ Error updating ${lang}:`, error.message);
    }
  }

  console.log('\nDone!');
}

updateTranslations();
