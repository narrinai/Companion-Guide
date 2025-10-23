#!/usr/bin/env node

/**
 * Extract English content from companion HTML files and upload to Airtable
 * Creates language='en' records in Companion_Translations table
 * This allows easy copy/paste workflow for Dutch translations
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const Airtable = require('airtable');

// Load environment variables
require('dotenv').config();

const COMPANIONS_DIR = path.join(__dirname, '../companions');

// Initialize Airtable
if (!process.env.AIRTABLE_TOKEN_CG) {
  console.error('❌ AIRTABLE_TOKEN_CG environment variable not set');
  process.exit(1);
}

if (!process.env.AIRTABLE_BASE_ID_CG) {
  console.error('❌ AIRTABLE_BASE_ID_CG environment variable not set');
  process.exit(1);
}

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const COMPANIONS_TABLE = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

/**
 * Extract content from HTML file
 */
function extractContentFromHTML(htmlPath, slug) {
  const html = fs.readFileSync(htmlPath, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const content = {
    slug: slug,
    language: 'en'
  };

  // 1. Extract meta description
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    content.meta_description = metaDesc.getAttribute('content') || '';
  }

  // 2. Extract meta title
  const metaTitle = document.querySelector('meta[property="og:title"]');
  if (metaTitle) {
    content.meta_title = metaTitle.getAttribute('content') || '';
  }

  // 3. Extract tagline (from hero section)
  const taglineEl = document.querySelector('.hero-content p');
  if (taglineEl) {
    content.tagline = taglineEl.textContent.trim();
  }

  // 4. Extract description (from overview section)
  const overviewSection = document.querySelector('#overview');
  if (overviewSection) {
    const paragraphs = Array.from(overviewSection.querySelectorAll('p'))
      .map(p => p.textContent.trim())
      .filter(p => p);

    if (paragraphs.length > 0) {
      content.description = paragraphs.join('\n\n');
    }
  }

  // 5. Extract best_for (from benefit cards)
  const bestForCard = Array.from(document.querySelectorAll('.fact')).find(fact => {
    const h3 = fact.querySelector('h3');
    return h3 && h3.textContent.includes('Best For');
  });

  if (bestForCard) {
    const p = bestForCard.querySelector('p');
    if (p) {
      content.best_for = p.textContent.trim();
    }
  }

  // 6. Extract hero_specs (JSON object with pricing, platform, content_policy)
  const heroSpecs = {};

  const pricingCard = Array.from(document.querySelectorAll('.fact')).find(fact => {
    const h3 = fact.querySelector('h3');
    return h3 && h3.textContent.includes('Pricing');
  });
  if (pricingCard) {
    const p = pricingCard.querySelector('p');
    if (p) heroSpecs.pricing = p.textContent.trim();
  }

  const platformCard = Array.from(document.querySelectorAll('.fact')).find(fact => {
    const h3 = fact.querySelector('h3');
    return h3 && h3.textContent === 'Platform';
  });
  if (platformCard) {
    const p = platformCard.querySelector('p');
    if (p) heroSpecs.platform = p.textContent.trim();
  }

  const contentPolicyCard = Array.from(document.querySelectorAll('.fact')).find(fact => {
    const h3 = fact.querySelector('h3');
    return h3 && h3.textContent.includes('Content Policy');
  });
  if (contentPolicyCard) {
    const p = contentPolicyCard.querySelector('p');
    if (p) heroSpecs.content_policy = p.textContent.trim();
  }

  if (Object.keys(heroSpecs).length > 0) {
    content.hero_specs = JSON.stringify(heroSpecs, null, 2);
  }

  // 7. Extract body_text (full content sections)
  const contentSections = [];

  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    const h2 = section.querySelector('h2');
    if (h2) {
      const sectionText = h2.textContent.trim();
      // Skip certain sections
      if (!sectionText.includes('FAQ') &&
          !sectionText.includes('Reviews') &&
          !sectionText.includes('Alternatives')) {

        const paragraphs = Array.from(section.querySelectorAll('p'))
          .map(p => p.textContent.trim())
          .filter(p => p);

        if (paragraphs.length > 0) {
          contentSections.push(`## ${sectionText}\n\n${paragraphs.join('\n\n')}`);
        }
      }
    }
  });

  if (contentSections.length > 0) {
    content.body_text = contentSections.join('\n\n');
  }

  // 8. Extract features (JSON array)
  const featuresSection = document.querySelector('#key-features');
  if (featuresSection) {
    const featureCards = featuresSection.querySelectorAll('.feature-card');
    const features = Array.from(featureCards).map(card => {
      const h3 = card.querySelector('h3');
      const p = card.querySelector('p');
      return {
        title: h3 ? h3.textContent.trim() : '',
        description: p ? p.textContent.trim() : ''
      };
    }).filter(f => f.title);

    if (features.length > 0) {
      content.features = JSON.stringify(features, null, 2);
    }
  }

  // 9. Extract pros_cons (JSON object)
  const prosSection = document.querySelector('.pros');
  const consSection = document.querySelector('.cons');

  const prosConsData = {};

  if (prosSection) {
    const prosItems = Array.from(prosSection.querySelectorAll('li'))
      .map(li => li.textContent.trim());
    if (prosItems.length > 0) {
      prosConsData.pros = prosItems;
    }
  }

  if (consSection) {
    const consItems = Array.from(consSection.querySelectorAll('li'))
      .map(li => li.textContent.trim());
    if (consItems.length > 0) {
      prosConsData.cons = consItems;
    }
  }

  if (Object.keys(prosConsData).length > 0) {
    content.pros_cons = JSON.stringify(prosConsData, null, 2);
  }

  // 10. Extract pricing_plans (JSON array)
  const pricingSection = document.querySelector('#pricing');
  if (pricingSection) {
    const pricingCards = pricingSection.querySelectorAll('.pricing-card');
    const pricingPlans = Array.from(pricingCards).map(card => {
      const h3 = card.querySelector('h3');
      const priceEl = card.querySelector('.price');
      const featuresUl = card.querySelector('ul');

      const plan = {
        name: h3 ? h3.textContent.trim() : '',
        price: priceEl ? priceEl.textContent.trim() : '',
        features: []
      };

      if (featuresUl) {
        plan.features = Array.from(featuresUl.querySelectorAll('li'))
          .map(li => li.textContent.trim());
      }

      return plan;
    }).filter(p => p.name);

    if (pricingPlans.length > 0) {
      content.pricing_plans = JSON.stringify(pricingPlans, null, 2);
    }
  }

  // 11. Extract my_verdict
  const verdictSection = document.querySelector('#verdict');
  if (verdictSection) {
    const paragraphs = Array.from(verdictSection.querySelectorAll('p'))
      .map(p => p.textContent.trim())
      .filter(p => p && !p.includes('Ready to Try'));

    if (paragraphs.length > 0) {
      content.my_verdict = paragraphs.join('\n\n');
    }

    // Extract verdict subtitle (first paragraph or h3 after h2)
    const h3 = verdictSection.querySelector('h3');
    if (h3) {
      content.verdict_subtitle = h3.textContent.trim();
    } else if (paragraphs.length > 0) {
      // First sentence of first paragraph
      const firstSentence = paragraphs[0].split('.')[0] + '.';
      content.verdict_subtitle = firstSentence;
    }
  }

  // 12. Extract FAQ (JSON array)
  const faqSection = document.querySelector('.faq-section');
  if (faqSection) {
    const faqItems = faqSection.querySelectorAll('.faq-item');
    const faqs = Array.from(faqItems).map(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');

      return {
        question: question ? question.textContent.trim() : '',
        answer: answer ? answer.textContent.trim() : ''
      };
    }).filter(f => f.question);

    if (faqs.length > 0) {
      content.faq = JSON.stringify(faqs, null, 2);
    }
  }

  // 13. Extract ready_to_try (CTA heading)
  const ctaSection = document.querySelector('.cta-section');
  if (ctaSection) {
    const h2 = ctaSection.querySelector('h2');
    if (h2) {
      content.ready_to_try = h2.textContent.trim();
    }
  }

  // 14. Extract review_form_text (JSON object)
  const reviewSection = document.querySelector('.user-reviews');
  if (reviewSection) {
    const formText = {
      section_title: '',
      your_name: 'Your Name',
      your_name_placeholder: 'Enter your name',
      rating: 'Rating',
      review_title: 'Review Title',
      review_title_placeholder: 'Sum up your experience in one line',
      your_review: 'Your Review',
      your_review_placeholder: 'Share your detailed experience with this platform...',
      usage_duration: 'How long have you used this platform?',
      submit_button: 'Submit Review',
      duration_options: {
        'select': 'Select duration...',
        'less_than_week': 'Less than a week',
        '1_4_weeks': '1-4 weeks',
        '1_3_months': '1-3 months',
        '3_6_months': '3-6 months',
        '6_months_plus': '6+ months'
      }
    };

    const sectionHeader = reviewSection.querySelector('.section-header p');
    if (sectionHeader) {
      formText.section_title = sectionHeader.textContent.trim();
    }

    content.review_form_text = JSON.stringify(formText, null, 2);
  }

  return content;
}

/**
 * Find companion record ID by slug
 */
async function findCompanionRecordId(slug) {
  try {
    const records = await base(COMPANIONS_TABLE)
      .select({
        filterByFormula: `{slug} = "${slug}"`,
        maxRecords: 1
      })
      .all();

    if (records.length > 0) {
      return records[0].id;
    }

    return null;
  } catch (error) {
    console.error(`Error finding companion ${slug}:`, error.message);
    return null;
  }
}

/**
 * Check if English translation already exists
 */
async function checkEnglishTranslationExists(companionRecordId) {
  try {
    const records = await base(TRANSLATIONS_TABLE)
      .select({
        filterByFormula: `AND({companion} = "${companionRecordId}", {language} = "en")`,
        maxRecords: 1
      })
      .all();

    return records.length > 0 ? records[0] : null;
  } catch (error) {
    console.error('Error checking existing translation:', error.message);
    return null;
  }
}

/**
 * Upload or update English translation to Airtable
 */
async function uploadToAirtable(content) {
  try {
    // Find companion record ID
    const companionRecordId = await findCompanionRecordId(content.slug);

    if (!companionRecordId) {
      console.error(`❌ Companion not found: ${content.slug}`);
      return false;
    }

    // Check if English translation already exists
    const existingRecord = await checkEnglishTranslationExists(companionRecordId);

    // Prepare fields - only include fields that exist in Airtable
    const fields = {
      companion: [companionRecordId], // Linked record
      language: 'en',
      description: content.description || '',
      best_for: content.best_for || '',
      tagline: content.tagline || '',
      meta_title: content.meta_title || '',
      meta_description: content.meta_description || '',
      body_text: content.body_text || '',
      features: content.features || '',
      pros_cons: content.pros_cons || '',
      pricing_plans: content.pricing_plans || '',
      my_verdict: content.my_verdict || '',
      faq: content.faq || ''
    };

    // Optional fields - only add if they have content and exist in Airtable
    // Uncomment these once the fields are created in Airtable:
    // if (content.hero_specs) fields.hero_specs = content.hero_specs;
    // if (content.ready_to_try) fields.ready_try = content.ready_to_try;
    // if (content.review_form_text) fields.review_form_text = content.review_form_text;
    // if (content.verdict_subtitle) fields.verdict_subtitle = content.verdict_subtitle;

    if (existingRecord) {
      // Update existing record
      await base(TRANSLATIONS_TABLE).update([
        {
          id: existingRecord.id,
          fields: fields
        }
      ]);
      console.log(`✅ Updated: ${content.slug} (English)`);
    } else {
      // Create new record
      await base(TRANSLATIONS_TABLE).create([
        { fields: fields }
      ]);
      console.log(`✅ Created: ${content.slug} (English)`);
    }

    return true;
  } catch (error) {
    console.error(`❌ Error uploading ${content.slug}:`, error.message);
    return false;
  }
}

/**
 * Process all companion HTML files
 */
async function main() {
  console.log('\n📚 Extracting English content from companion HTML files...\n');

  // Get all HTML files
  const files = fs.readdirSync(COMPANIONS_DIR);
  const htmlFiles = files.filter(file => file.endsWith('.html'));

  console.log(`Found ${htmlFiles.length} companion HTML files\n`);

  let successCount = 0;
  let errorCount = 0;

  // Process each file
  for (const file of htmlFiles) {
    const slug = file.replace('.html', '');
    const htmlPath = path.join(COMPANIONS_DIR, file);

    console.log(`\n📄 Processing: ${slug}`);

    try {
      // Extract content
      const content = extractContentFromHTML(htmlPath, slug);

      // Upload to Airtable
      const success = await uploadToAirtable(content);

      if (success) {
        successCount++;

        // Rate limiting - wait 200ms between requests
        await new Promise(resolve => setTimeout(resolve, 200));
      } else {
        errorCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${slug}:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n✅ Done! Processed ${htmlFiles.length} companions`);
  console.log(`   Success: ${successCount}`);
  console.log(`   Errors: ${errorCount}`);
  console.log('\n📋 Next steps:');
  console.log('   1. Check Airtable Companion_Translations table for language="en" records');
  console.log('   2. Copy each English record to create Dutch translation');
  console.log('   3. Translate the content fields to Dutch');
  console.log('   4. Set language="nl" on the Dutch records');
  console.log('\n');
}

main();
