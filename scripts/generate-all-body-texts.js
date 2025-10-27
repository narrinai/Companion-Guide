const Airtable = require('airtable');
require('dotenv').config();

/**
 * Generate body_text for ALL English companion pages
 *
 * This script will:
 * 1. Fetch all English companions from Companion_Translations
 * 2. Generate unique 3-paragraph body_text for each
 * 3. Update Airtable with the new body_text
 *
 * Usage: node scripts/generate-all-body-texts.js
 */

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const COMPANIONS_TABLE = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

async function generateAllBodyTexts() {
  console.log('\n🚀 Starting body_text generation for all English companions...\n');

  try {
    // Get all English translations
    const translations = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: '{language} = "en"',
        sort: [{ field: 'name (from companion)', direction: 'asc' }]
      })
      .all();

    console.log(`✅ Found ${translations.length} English companions to process\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const translation of translations) {
      const translationId = translation.id;
      const slug = translation.fields['slug (from companion)']?.[0];
      const companionName = translation.fields['name (from companion)']?.[0] || 'Unknown';

      if (!slug) {
        console.log(`⚠️  Skipping ${companionName} - no slug found`);
        skipped++;
        continue;
      }

      try {
        console.log(`\n📝 Processing: ${companionName} (${slug})`);

        // Get companion data from Companions table
        const companions = await base(COMPANIONS_TABLE)
          .select({
            filterByFormula: `{slug} = "${slug}"`,
            maxRecords: 1
          })
          .all();

        if (companions.length === 0) {
          console.log(`   ⚠️  Companion not found in main table - skipping`);
          skipped++;
          continue;
        }

        const companion = companions[0].fields;

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
          console.log(`   ⚠️  Could not parse features: ${e.message}`);
          features = [];
        }

        // Extract key info from my_verdict
        let verdictText = translation.fields.my_verdict || '';
        const verdictLines = verdictText.split('\n').filter(line => line.trim());

        let firstParagraph = '';
        for (const line of verdictLines) {
          if (line.trim() && !line.includes('##') && !line.includes('Week') && line.length > 50) {
            firstParagraph = line.trim();
            break;
          }
        }

        // Generate body text
        const bodyText = generateThreeParagraphs(
          companion.name,
          companion.description,
          companion.best_for,
          features,
          firstParagraph
        );

        // Update the record
        await base(TRANSLATIONS_TABLE).update([
          {
            id: translationId,
            fields: {
              body_text: bodyText
            }
          }
        ]);

        console.log(`   ✅ Updated body_text (${bodyText.split(' ').length} words)`);
        updated++;

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`   ❌ Error processing ${companionName}:`, error.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⚠️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

function generateThreeParagraphs(name, description, bestFor, features, verdictFirstPara) {
  // Paragraph 1: Introduction - What is it? (personal perspective)
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
      .replace(new RegExp(`^${name} delivers`, 'g'), `In my testing, ${name} delivers what I consider`)
      .replace(/delivers a/, 'delivers what I consider a')
      .replace(/is a /, 'is what I consider a ');
  } else if (bestFor) {
    targetAudience = `Based on my thorough testing, I found ${name} is ${bestFor.toLowerCase()} I was particularly impressed by the personalized interactions, consistent character personalities, and advanced memory capabilities. If you're seeking meaningful AI companion experiences with genuine depth, I can confidently say this platform delivers.`;
  } else {
    targetAudience = `From my hands-on experience, I found ${name} is ideal for users seeking immersive AI companion experiences with advanced features and real personalization. The combination of natural conversations, multimedia capabilities, and long-term memory makes it excellent for building ongoing relationships with AI companions that feel authentic and engaging.`;
  }

  return `${intro}\n\n${featurePara}\n\n${targetAudience}`;
}

// Run the script
generateAllBodyTexts().then(() => {
  console.log('🎉 All body_text generation complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
