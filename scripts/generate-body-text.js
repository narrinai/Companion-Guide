const Airtable = require('airtable');
require('dotenv').config();

/**
 * Generate 3-paragraph body_text for companion pages
 *
 * Creates concise, informative body text based on:
 * - my_verdict content
 * - features from the companion
 * - best_for positioning
 *
 * No title needed - "What is...?" already exists on the page
 *
 * Usage: node scripts/generate-body-text.js <slug>
 * Example: node scripts/generate-body-text.js dream-companion
 */

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const COMPANIONS_TABLE = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

async function generateBodyText(slug) {
  console.log(`\n🔍 Generating body_text for: ${slug}\n`);

  try {
    // Get companion data from Companions table
    const companions = await base(COMPANIONS_TABLE)
      .select({
        filterByFormula: `{slug} = "${slug}"`,
        maxRecords: 1
      })
      .all();

    if (companions.length === 0) {
      throw new Error(`Companion with slug "${slug}" not found`);
    }

    const companion = companions[0].fields;
    console.log('✅ Found companion:', companion.name);

    // Get translation data (my_verdict)
    const translations = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: `AND({slug (from companion)} = "${slug}", {language} = "en")`,
        maxRecords: 1
      })
      .all();

    if (translations.length === 0) {
      throw new Error(`Translation for "${slug}" not found`);
    }

    const translation = translations[0].fields;
    const recordId = translations[0].id;

    // Parse features with error handling
    let features = [];
    try {
      if (companion.features) {
        if (typeof companion.features === 'string') {
          features = JSON.parse(companion.features);
        } else if (Array.isArray(companion.features)) {
          features = companion.features;
        }
      }
      // Ensure features is an array
      if (!Array.isArray(features)) {
        features = [];
      }
    } catch (e) {
      console.log(`⚠️  Could not parse features: ${e.message}`);
      features = [];
    }
    console.log('✅ Found', features.length, 'features');

    // Extract key info from my_verdict (first paragraph only, skip title)
    let verdictText = translation.my_verdict || '';
    const verdictLines = verdictText.split('\n').filter(line => line.trim());

    // Skip title lines and get first real paragraph
    let firstParagraph = '';
    for (const line of verdictLines) {
      if (line.trim() && !line.includes('##') && !line.includes('Week') && line.length > 50) {
        firstParagraph = line.trim();
        break;
      }
    }

    // Generate 3-paragraph body text
    const bodyText = generateThreeParagraphs(
      companion.name,
      companion.description,
      companion.best_for,
      features,
      firstParagraph
    );

    console.log('\n📝 Generated body_text:');
    console.log('─────────────────────────────────────────');
    console.log(bodyText);
    console.log('─────────────────────────────────────────\n');

    // Update the record
    console.log('💾 Updating Airtable...');
    await base(TRANSLATIONS_TABLE).update([
      {
        id: recordId,
        fields: {
          body_text: bodyText
        }
      }
    ]);

    console.log('✅ Successfully updated body_text for', companion.name);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function generateThreeParagraphs(name, description, bestFor, features, verdictFirstPara) {
  // Paragraph 1: Introduction - What is it? (personal perspective)
  // Extract key concept from description but make it personal
  let descConcept = description.replace(/\.$/, ''); // Remove trailing period
  const intro = `During my extensive testing of ${name}, I found it to be ${descConcept.charAt(0).toLowerCase() + descConcept.slice(1)} The platform combines advanced AI technology with intuitive features to deliver genuinely engaging and personalized companion experiences that exceeded my expectations.`;

  // Paragraph 2: Key features (personal observations)
  const featuresList = features.slice(0, 4).map(f => f.title.toLowerCase()).join(', ');

  let featurePara = `What impressed me most during my hands-on testing was the platform's ${featuresList.replace(/, ([^,]*)$/, ', and $1')}. `;

  if (features[0] && features[1]) {
    const feat0 = features[0].description.charAt(0).toUpperCase() + features[0].description.slice(1);
    const feat1 = features[1].description.charAt(0).toLowerCase() + features[1].description.slice(1);
    featurePara += `${feat0}, combined with ${feat1}, creates a highly immersive experience that keeps conversations feeling fresh and engaging throughout extended use.`;
  } else if (features[0]) {
    featurePara += `${features[0].description} This attention to detail really enhances the overall experience and sets it apart from competitors.`;
  } else {
    featurePara += `The attention to detail in these features creates an experience that feels polished and well-thought-out.`;
  }

  // Paragraph 3: Who it's for and verdict (personal recommendation)
  let targetAudience = '';
  if (verdictFirstPara && verdictFirstPara.length > 100) {
    // Use verdict but make it more personal
    targetAudience = verdictFirstPara
      .replace(/The platform/g, 'In my experience, the platform')
      .replace(/This platform/g, 'I found this platform')
      .replace(/^Dream Companion delivers/, 'In my testing, Dream Companion delivers')
      .replace(/delivers a/, 'delivers what I consider a');
  } else if (bestFor) {
    targetAudience = `Based on my thorough testing, I found ${name} is ${bestFor.toLowerCase()} I was particularly impressed by the personalized interactions, consistent character personalities, and advanced memory capabilities. If you're seeking meaningful AI companion experiences with genuine depth, I can confidently say this platform delivers.`;
  } else {
    targetAudience = `From my hands-on experience, I found ${name} is ideal for users seeking immersive AI companion experiences with advanced features and real personalization. The combination of natural conversations, multimedia capabilities, and long-term memory makes it excellent for building ongoing relationships with AI companions that feel authentic and engaging.`;
  }

  return `${intro}\n\n${featurePara}\n\n${targetAudience}`;
}

// Run the script
const slug = process.argv[2];

if (!slug) {
  console.error('❌ Please provide a companion slug');
  console.error('Usage: node scripts/generate-body-text.js <slug>');
  console.error('Example: node scripts/generate-body-text.js dream-companion');
  process.exit(1);
}

generateBodyText(slug).then(() => {
  console.log('\n🎉 Done!');
  process.exit(0);
});
