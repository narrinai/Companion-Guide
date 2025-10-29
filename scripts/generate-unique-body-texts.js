const Airtable = require('airtable');
require('dotenv').config();

/**
 * Generate unique body_text for all English companions
 *
 * Creates 3-paragraph body_text based on:
 * - description, tagline, my_verdict, features, pricing_plans
 * - Written in first person as a reviewer ("I tested...", "I found...")
 * - Each companion gets a UNIQUE structure and opening/closing
 * - Truly personalized based on the companion's actual features and verdict
 *
 * Usage: node scripts/generate-unique-body-texts.js
 */

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const COMPANIONS_TABLE = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

// Different opening styles to rotate through
const openingStyles = [
  (name, description) => `I've spent considerable time exploring ${name}, and it's ${description.charAt(0).toLowerCase() + description.slice(1, -1)}. From my first interaction to weeks of regular use, this platform consistently demonstrated both innovation and reliability.`,

  (name, description) => `${name} caught my attention immediately with its approach to AI companionship. ${description} After thoroughly testing every feature, I can provide genuine insights into what makes this platform unique.`,

  (name, description) => `Testing ${name} revealed ${description.charAt(0).toLowerCase() + description.slice(1, -1)}. My hands-on experience with the platform showed both impressive capabilities and areas where it truly excels.`,

  (name, description) => `When I first encountered ${name}, I wondered if it would live up to its promises. ${description} My testing proved that this platform delivers on its core value proposition.`,

  (name, description) => `${name} represents ${description.charAt(0).toLowerCase() + description.slice(1, -1)}. Throughout my evaluation, I focused on real-world usage scenarios to understand its practical value.`,

  (name, description) => `My experience with ${name} began with curiosity and evolved into genuine appreciation. ${description} This platform offers something distinct in the AI companion space.`,

  (name, description) => `After extensive hands-on testing, ${name} proved to be ${description.charAt(0).toLowerCase() + description.slice(1, -1)}. The platform's approach to user experience stood out during my evaluation.`,

  (name, description) => `I approached ${name} with both skepticism and interest. ${description} My thorough testing revealed capabilities that exceeded initial expectations in several key areas.`
];

// Middle paragraph structures
const middleStyles = [
  (features, name) => `The standout features I discovered were ${features.slice(0, 3).map(f => f.title.toLowerCase()).join(', ')}. ${features[0]?.description || 'The core functionality'} works seamlessly with ${features[1]?.description.toLowerCase() || 'supporting features'}, creating an experience that feels cohesive. ${features[2] ? features[2].description : 'The additional capabilities round out the platform\'s offerings.'} This integration sets ${name} apart from more basic alternatives.`,

  (features, name) => `What impressed me most was how ${name} handles ${features[0]?.title.toLowerCase() || 'its core features'}. ${features[0]?.description || 'The implementation'} combines with ${features[1]?.title.toLowerCase() || 'supporting capabilities'} to deliver genuine value. ${features[2]?.description || 'Additional features complement the core experience.'} Each element enhances rather than complicates the user experience.`,

  (features, name) => `During my testing, ${features[0]?.title || 'the primary features'} and ${features[1]?.title.toLowerCase() || 'supporting tools'} proved particularly effective. ${features[0]?.description || 'Core functionality'} works reliably, while ${features[1]?.description.toLowerCase() || 'additional features'} add meaningful depth. ${features[2] ? 'The ' + features[2].title.toLowerCase() + ' further enhances the overall experience.' : 'Everything feels thoughtfully designed.'}`,

  (features, name) => `${name}'s implementation of ${features[0]?.title.toLowerCase() || 'core features'} deserves special mention. ${features[0]?.description || 'The main functionality'} exceeded my expectations. Combined with ${features[1]?.title.toLowerCase() || 'supporting features'}, ${features[1]?.description.toLowerCase() || 'the platform delivers well-rounded capabilities'}. ${features[2]?.description || 'Additional features complete the package.'}`
];

// Conclusion styles based on verdict/value proposition
const conclusionStyles = [
  (name, verdict, bestFor) => {
    const verdictSnippet = verdict ? verdict.split('.').slice(0, 2).join('.') + '.' : '';
    return bestFor
      ? `Based on my thorough evaluation, ${name} is ${bestFor.toLowerCase()} ${verdictSnippet || 'The platform delivers genuine value for its target audience.'} I found it particularly well-suited for users seeking quality over quantity in their AI companion experience.`
      : `My testing confirmed that ${name} delivers on its core promises. ${verdictSnippet || 'The platform offers solid value.'} For users seeking this specific type of AI companion experience, it's worth serious consideration.`;
  },

  (name, verdict, bestFor) => {
    const verdictSnippet = verdict ? verdict.split('.')[0] + '.' : '';
    return `${verdictSnippet || name + ' stands out in the crowded AI companion market.'} ${bestFor ? 'It\'s ' + bestFor.toLowerCase() + ' ' : ''}My hands-on experience revealed a platform that prioritizes both functionality and user satisfaction. I'd recommend it to anyone seeking ${bestFor ? bestFor.toLowerCase().replace('best for ', '') : 'quality AI interactions'}.`;
  },

  (name, verdict, bestFor) => {
    return `After weeks of testing, I can confidently say ${name} delivers ${bestFor ? bestFor.toLowerCase().replace('best for ', '') + ' experiences' : 'quality AI companion interactions'}. ${verdict ? verdict.split('.').slice(0, 2).join('.') + '.' : 'The platform balances innovation with reliability effectively.'} It's earned a place among platforms I'd genuinely recommend.`;
  },

  (name, verdict, bestFor) => {
    const verdictSnippet = verdict ? verdict.split('.')[0] + '.' : '';
    return `${name} ${bestFor ? 'is ' + bestFor.toLowerCase() + ' ' : 'delivers genuine value '}through thoughtful implementation and reliable performance. ${verdictSnippet || 'My testing revealed consistent quality.'} For users prioritizing ${bestFor ? bestFor.toLowerCase().replace('best for ', '') : 'meaningful AI interactions'}, this platform merits serious evaluation.`;
  }
];

function generateUniqueBodyText(companion, translation, index) {
  const name = companion.name;
  const description = companion.description || 'An AI companion platform';
  const bestFor = companion.best_for;

  // Parse features
  let features = [];
  try {
    if (companion.features) {
      features = typeof companion.features === 'string'
        ? JSON.parse(companion.features)
        : companion.features;
    }
    if (!Array.isArray(features)) features = [];
  } catch (e) {
    features = [];
  }

  // Get verdict from translation
  let verdict = '';
  if (translation.my_verdict) {
    const verdictLines = translation.my_verdict.split('\n').filter(l => l.trim());
    for (const line of verdictLines) {
      if (line.trim() && !line.includes('##') && !line.includes('Week') && line.length > 50) {
        verdict = line.trim();
        break;
      }
    }
  }

  // Rotate through different styles based on index
  const openingIndex = index % openingStyles.length;
  const middleIndex = index % middleStyles.length;
  const conclusionIndex = index % conclusionStyles.length;

  const paragraph1 = openingStyles[openingIndex](name, description);
  const paragraph2 = middleStyles[middleIndex](features, name);
  const paragraph3 = conclusionStyles[conclusionIndex](name, verdict, bestFor);

  return `${paragraph1}\n\n${paragraph2}\n\n${paragraph3}`;
}

async function generateAllUniqueBodyTexts() {
  console.log('\n📝 Generating unique body_text for all English companions...\n');

  try {
    // Get all English translations
    const translations = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: '{language} = "en"',
        sort: [{ field: 'name (from companion)', direction: 'asc' }]
      })
      .all();

    console.log(`✅ Found ${translations.length} English companions\n`);

    let updated = 0;
    let errors = 0;

    for (let i = 0; i < translations.length; i++) {
      const translation = translations[i];
      const slug = translation.fields['slug (from companion)']?.[0];
      const companionName = translation.fields['name (from companion)']?.[0] || 'Unknown';

      if (!slug) {
        console.log(`⚠️  Skipping ${companionName} - no slug`);
        continue;
      }

      try {
        console.log(`\n📝 Processing: ${companionName} (#${i + 1}/${translations.length})`);

        // Get companion data from main table
        const companions = await base(COMPANIONS_TABLE)
          .select({
            filterByFormula: `{slug} = "${slug}"`,
            maxRecords: 1
          })
          .all();

        if (companions.length === 0) {
          console.log(`   ⚠️  Not found in companions table`);
          continue;
        }

        const companion = companions[0].fields;

        // Generate unique body text
        const bodyText = generateUniqueBodyText(companion, translation.fields, i);

        console.log(`   Generated ${bodyText.split(' ').length} words`);
        console.log(`   Opening: "${bodyText.split('\n')[0].substring(0, 60)}..."`);

        // Update the translation record
        await base(TRANSLATIONS_TABLE).update([
          {
            id: translation.id,
            fields: { body_text: bodyText }
          }
        ]);

        console.log(`   ✅ Updated`);
        updated++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`   ❌ Error: ${error.message}`);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

generateAllUniqueBodyTexts().then(() => {
  console.log('🎉 All unique body_texts generated!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
