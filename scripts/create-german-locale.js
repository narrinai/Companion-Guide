const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

if (!ANTHROPIC_API_KEY) {
  console.error('❌ Missing ANTHROPIC_API_KEY');
  process.exit(1);
}

const anthropic = new Anthropic({apiKey: ANTHROPIC_API_KEY});

async function translateToGerman(jsonContent) {
  try {
    const prompt = `Vertaal het volgende JSON locale bestand van Engels naar Duits. Behoud de exacte JSON structuur en alle keys. Vertaal ALLEEN de values (de tekstwaarden). Gebruik formeel Duits (Sie-Form) voor gebruikersinteracties. Geef het resultaat terug als valide JSON zonder extra uitleg.

${JSON.stringify(jsonContent, null, 2)}`;

    console.log('🤖 Translating to German...');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 8192,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    const responseText = message.content[0].text;

    // Extract JSON from response (might be wrapped in markdown code blocks)
    let jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (!jsonMatch) {
      jsonMatch = responseText.match(/```\n([\s\S]*?)\n```/);
    }
    if (!jsonMatch) {
      jsonMatch = responseText.match(/\{[\s\S]*\}/);
    }

    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const translatedJson = JSON.parse(jsonMatch[1] || jsonMatch[0]);

    // Update the meta section for German
    translatedJson.meta = {
      language: 'de',
      name: 'Deutsch',
      direction: 'ltr',
      locale: 'de-DE'
    };

    return translatedJson;
  } catch (error) {
    console.error('❌ Error translating:', error.message);
    throw error;
  }
}

async function createGermanLocale() {
  try {
    console.log('🚀 Creating German locale file...\n');

    // Read English locale
    const enPath = path.join(__dirname, '..', 'locales', 'en.json');
    const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));

    console.log('✅ English locale loaded');

    // Translate to German
    const deContent = await translateToGerman(enContent);

    // Write German locale
    const dePath = path.join(__dirname, '..', 'locales', 'de.json');
    fs.writeFileSync(dePath, JSON.stringify(deContent, null, 2), 'utf8');

    console.log('\n✅ German locale file created successfully!');
    console.log(`   Saved to: ${dePath}`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

createGermanLocale();
