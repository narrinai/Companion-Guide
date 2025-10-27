const Airtable = require('airtable');
require('dotenv').config();

/**
 * Regenerate body_text with varied structures and tones
 *
 * This script creates 5 different writing patterns that rotate through companions:
 * - Pattern 1: Testing-focused (starts with testing experience)
 * - Pattern 2: Feature-led (starts with standout features)
 * - Pattern 3: Problem-solution (starts with what problem it solves)
 * - Pattern 4: Comparison (starts with how it differs from others)
 * - Pattern 5: Direct verdict (starts with bottom line)
 *
 * Usage: node scripts/regenerate-varied-body-texts.js
 */

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const COMPANIONS_TABLE = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

// 5 different writing patterns
const patterns = [
  {
    name: 'Testing-focused',
    generate: (name, desc, bestFor, features, verdict) => {
      const intro = `I spent considerable time testing ${name}, and my experience revealed ${desc.charAt(0).toLowerCase() + desc.slice(1, -1)}. What sets this platform apart is how it balances ${features[0]?.title.toLowerCase() || 'core functionality'} with ${features[1]?.title.toLowerCase() || 'user experience'}.`;

      const middle = features.length >= 2
        ? `The standout elements I discovered were the ${features[0]?.title.toLowerCase() || 'main features'} and ${features[1]?.title.toLowerCase() || 'additional capabilities'}. ${features[0]?.description || 'The primary functionality'} delivers exactly what users need, while ${features[1]?.description.toLowerCase() || 'the supporting features'} adds depth to the experience.`
        : `During testing, I found the core functionality delivers what users actually need without unnecessary complexity.`;

      const conclusion = verdict && verdict.length > 100
        ? verdict.split('.')[0] + '. ' + (verdict.split('.')[1] || 'The platform executes its vision well.')
        : `${name} is ${(bestFor || 'ideal for users seeking quality AI companion experiences').toLowerCase()} My testing confirmed it delivers on its promises with consistent performance.`;

      return `${intro}\n\n${middle}\n\n${conclusion}`;
    }
  },

  {
    name: 'Feature-led',
    generate: (name, desc, bestFor, features, verdict) => {
      const intro = `${name} caught my attention with its ${features[0]?.title.toLowerCase() || 'core features'}${features[1] ? ' and ' + features[1].title.toLowerCase() : ''}. ${desc.replace(/\.$/, '')}, making it ${bestFor ? bestFor.toLowerCase().replace('best for', 'particularly effective for') : 'a solid choice for many users'}.`;

      const middle = features.length >= 3
        ? `What I appreciated most was how ${features[0]?.description.toLowerCase() || 'the main functionality works'}. The integration of ${features[1]?.title.toLowerCase() || 'supporting features'} with ${features[2]?.title.toLowerCase() || 'additional capabilities'} creates a cohesive experience. ${features[2]?.description || 'These elements work together smoothly.'}`
        : `The platform's approach to ${features[0]?.title.toLowerCase() || 'core functionality'} shows thoughtful design that prioritizes user experience.`;

      const conclusion = verdict && verdict.length > 100
        ? 'After extensive use, ' + verdict.charAt(0).toLowerCase() + verdict.slice(1).split('.').slice(0, 2).join('.') + '.'
        : `For users seeking ${bestFor?.toLowerCase().replace('best for', '') || 'quality AI interactions'}, ${name} delivers a well-rounded experience worth exploring.`;

      return `${intro}\n\n${middle}\n\n${conclusion}`;
    }
  },

  {
    name: 'Problem-solution',
    generate: (name, desc, bestFor, features, verdict) => {
      const intro = `Many AI companion platforms struggle with ${features[0]?.title.toLowerCase() || 'core functionality'}, but ${name} takes a different approach. ${desc.replace(/\.$/, '')}, addressing what users actually need rather than adding unnecessary features.`;

      const middle = features.length >= 2
        ? `I found the combination of ${features[0]?.title.toLowerCase() || 'primary features'} and ${features[1]?.title.toLowerCase() || 'supporting capabilities'} solves real problems. ${features[0]?.description || 'The main functionality'} works reliably, and ${features[1]?.description.toLowerCase() || 'the additional features'} enhance rather than complicate the experience.`
        : `The platform focuses on solving actual user needs with ${features[0]?.description.toLowerCase() || 'well-implemented features'} that work as expected.`;

      const conclusion = verdict && verdict.length > 100
        ? verdict.split('.').slice(0, 2).join('.') + '.'
        : `${name} is ${(bestFor || 'best suited for users who value substance over gimmicks').toLowerCase()} Based on my testing, it delivers practical value for its target audience.`;

      return `${intro}\n\n${middle}\n\n${conclusion}`;
    }
  },

  {
    name: 'Comparison',
    generate: (name, desc, bestFor, features, verdict) => {
      const intro = `Compared to other platforms I've tested, ${name} distinguishes itself through ${features[0]?.title.toLowerCase() || 'its core approach'}. ${desc.replace(/\.$/, '')}, which sets it apart in a crowded market.`;

      const middle = features.length >= 3
        ? `Where many competitors focus on quantity, ${name} prioritizes ${features[0]?.title.toLowerCase() || 'quality features'}. The ${features[1]?.title.toLowerCase() || 'implementation'} stands out – ${features[1]?.description.toLowerCase() || 'it works well'}. Combined with ${features[2]?.title.toLowerCase() || 'additional capabilities'}, the platform offers something genuinely different.`
        : `Unlike basic alternatives, this platform delivers ${features[0]?.description.toLowerCase() || 'solid functionality'} that goes beyond surface-level features.`;

      const conclusion = verdict && verdict.length > 100
        ? 'In my assessment, ' + verdict.charAt(0).toLowerCase() + verdict.slice(1).split('.')[0] + '.'
        : `${name} is ${(bestFor || 'best for users seeking something beyond generic AI chat').toLowerCase()} If you've been disappointed by other platforms, this one's worth considering.`;

      return `${intro}\n\n${middle}\n\n${conclusion}`;
    }
  },

  {
    name: 'Direct verdict',
    generate: (name, desc, bestFor, features, verdict) => {
      const intro = verdict && verdict.length > 100
        ? verdict.split('.')[0] + '. ' + desc.replace(/\.$/, '') + ', delivering what it promises.'
        : `${name} delivers ${desc.charAt(0).toLowerCase() + desc.slice(1, -1)} with a focus on ${features[0]?.title.toLowerCase() || 'quality over quantity'}.`;

      const middle = features.length >= 2
        ? `The platform's strength lies in its ${features[0]?.title.toLowerCase() || 'core features'}. ${features[0]?.description || 'The implementation is solid'}, and the ${features[1]?.title.toLowerCase() || 'supporting features'} add genuine value. ${features[1]?.description || 'Everything works cohesively'} without feeling bloated or over-engineered.`
        : `I found the ${features[0]?.title.toLowerCase() || 'core implementation'} to be thoughtfully designed – ${features[0]?.description.toLowerCase() || 'it works reliably and meets user needs'}.`;

      const conclusion = bestFor
        ? `${name} is ${bestFor.toLowerCase()} After thorough testing, I can say it's a solid choice for users who value ${features[0]?.title.toLowerCase() || 'quality'} and ${features[1]?.title.toLowerCase() || 'reliability'}.`
        : `For users seeking dependable ${features[0]?.title.toLowerCase() || 'AI companion experiences'}, ${name} is worth serious consideration. It does what it sets out to do effectively.`;

      return `${intro}\n\n${middle}\n\n${conclusion}`;
    }
  }
];

async function regenerateVariedBodyTexts() {
  console.log('\n🎨 Regenerating body_text with varied structures...\n');

  try {
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
      const translationId = translation.id;
      const slug = translation.fields['slug (from companion)']?.[0];
      const companionName = translation.fields['name (from companion)']?.[0] || 'Unknown';

      if (!slug) {
        console.log(`⚠️  Skipping ${companionName} - no slug`);
        continue;
      }

      try {
        // Rotate through patterns
        const patternIndex = i % patterns.length;
        const pattern = patterns[patternIndex];

        console.log(`\n📝 Processing: ${companionName} (Pattern: ${pattern.name})`);

        // Get companion data
        const companions = await base(COMPANIONS_TABLE)
          .select({
            filterByFormula: `{slug} = "${slug}"`,
            maxRecords: 1
          })
          .all();

        if (companions.length === 0) {
          console.log(`   ⚠️  Not found in main table - skipping`);
          continue;
        }

        const companion = companions[0].fields;

        // Parse features
        let features = [];
        try {
          if (companion.features) {
            if (typeof companion.features === 'string') {
              features = JSON.parse(companion.features);
            } else if (Array.isArray(companion.features)) {
              features = companion.features;
            }
          }
          if (!Array.isArray(features)) {
            features = [];
          }
        } catch (e) {
          features = [];
        }

        // Get verdict
        let verdictText = translation.fields.my_verdict || '';
        const verdictLines = verdictText.split('\n').filter(line => line.trim());
        let firstParagraph = '';
        for (const line of verdictLines) {
          if (line.trim() && !line.includes('##') && !line.includes('Week') && line.length > 50) {
            firstParagraph = line.trim();
            break;
          }
        }

        // Generate body text with selected pattern
        const bodyText = pattern.generate(
          companion.name,
          companion.description || 'An AI companion platform',
          companion.best_for,
          features,
          firstParagraph
        );

        // Update record
        await base(TRANSLATIONS_TABLE).update([
          {
            id: translationId,
            fields: { body_text: bodyText }
          }
        ]);

        console.log(`   ✅ Updated (${bodyText.split(' ').length} words)`);
        updated++;

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

regenerateVariedBodyTexts().then(() => {
  console.log('🎉 Regeneration complete!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
