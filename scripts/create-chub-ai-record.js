/**
 * Create Chub AI record in Companions table
 */

const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
  .base(process.env.AIRTABLE_BASE_ID_CG);

const companionsTable = process.env.AIRTABLE_TABLE_ID_CG;

const chubAiData = {
  name: 'Chub AI',
  slug: 'chub-ai',
  status: 'Active',
  rating: 8.2,
  website_url: 'https://chub.ai',
  logo_url: '/images/logos/chub-ai-logo.png',
  tagline: 'Uncensored AI character platform with advanced LLMs and complete creative freedom',
  best_for: 'Character roleplay, uncensored chat & advanced AI models',
  features: JSON.stringify([
    {"icon": "🤖", "title": "Advanced LLMs", "description": "Access to powerful models like Soji 671B - multiple times larger than competitors"},
    {"icon": "🔓", "title": "Fully Uncensored", "description": "Complete creative freedom with no content restrictions"},
    {"icon": "🌳", "title": "Chat Trees", "description": "Branch storylines in different directions with advanced chat tree features"},
    {"icon": "🔌", "title": "OpenAI API Compatible", "description": "Use Chub's models anywhere that supports OpenAI APIs"}
  ]),
  my_verdict: `Chub AI stands out as one of the most powerful uncensored AI character platforms available. With access to models like Soji 671B - multiple times larger than what competitors offer - the quality of outputs is noticeably superior.

The platform's commitment to creative freedom means no artificial content restrictions, making it ideal for serious roleplay enthusiasts who want complete control over their AI interactions.

The tiered pricing structure offers good value, with Mercury at $5/month being an affordable entry point for casual users. The Mars tier at $20/month unlocks the full potential with unlimited access to their most powerful models and voice features.

If you're looking for an uncensored AI platform with advanced features and don't mind the learning curve, Chub AI delivers exceptional value for character-based AI interactions.`,
  gallery_images: JSON.stringify([
    {"url": "/images/screenshots/chub-ai-image-1.png", "caption": "Chub AI chat interface"},
    {"url": "/images/screenshots/chub-ai-image-2.png", "caption": "Character library and selection"},
    {"url": "/images/screenshots/chub-ai-image-3.png", "caption": "Character creation tools"}
  ]),
  pricing_plans: JSON.stringify([
    {
      "name": "Free Trial",
      "price": 0,
      "period": "free",
      "features": ["One-time free trial credits", "A few dozen messages included", "Sent to new users regularly", "Access to basic features", "Explore the platform"]
    },
    {
      "name": "Mercury",
      "price": 5,
      "period": "month",
      "description": "For casual chats",
      "features": ["Unlimited Mistral 7B finetune access", "Unlimited MythoMax 13B access", "8K tokens of memory", "Access to multimedia generation", "Access to any future ≤13B models", "Crypto payment option"]
    },
    {
      "name": "Mars",
      "price": 20,
      "period": "month",
      "badge": "MOST POWERFUL",
      "description": "For smarter bots",
      "features": ["All Mercury features included", "Unlimited Soji 671B 30K access", "Unlimited Asha 70B 8K access", "Unlimited Mixtral 8x7B 8K finetune", "Unlimited voice features", "Unlimited multimedia generation", "Early access to new models"]
    }
  ]),
  hero_specs: JSON.stringify({
    "pricing": "Free trial, Mercury $5/mo, Mars $20/mo",
    "best_for": "Character roleplay, uncensored chat & advanced AI models",
    "platform": "Web Browser, OpenAI API Compatible",
    "content_policy": "Fully uncensored (18+ NSFW content allowed)"
  }),
  is_uncensored: true
};

async function createChubAiRecord() {
  console.log('Creating Chub AI record in Companions table...\n');

  try {
    // First check if it already exists
    const existing = await base(companionsTable)
      .select({
        filterByFormula: `{slug} = 'chub-ai'`,
        maxRecords: 1
      })
      .all();

    if (existing.length > 0) {
      console.log('⚠️ Chub AI record already exists, updating instead...');

      await base(companionsTable).update(existing[0].id, chubAiData);
      console.log(`✅ Updated Chub AI: ${existing[0].id}`);
    } else {
      const newRecord = await base(companionsTable).create(chubAiData);
      console.log(`✅ Created Chub AI: ${newRecord.id}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND')) {
      console.log('\nTip: Make sure the Airtable API token has write access to the Companions table');
    }
  }
}

createChubAiRecord();
