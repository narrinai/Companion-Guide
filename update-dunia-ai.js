const Airtable = require('airtable');

// Configure Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN_CG
}).base(process.env.AIRTABLE_BASE_ID_CG);

const table = base(process.env.AIRTABLE_TABLE_ID_CG);

// Dunia AI companion data
const duniaAIData = {
  name: 'Dunia AI',
  slug: 'dunia-ai',
  rating: 4.5,
  description: 'Interactive storytelling platform with living stories and unique AI characters for immersive narrative experiences',
  short_description: 'Step into living stories and converse with unique AI characters',
  website_url: 'https://dunia.gg/',
  affiliate_url: 'https://dunia.gg/',
  image_url: '../images/logos/dunia-ai-review-companionguide.png',
  categories: ['Roleplay & Character Chat'], // Adjust based on your Airtable options
  badges: ['New'], // Adjust based on your Airtable options
  featured: false,
  pricing_plans: 'Free with optional premium features (pricing TBA)',
  status: 'Active',
  is_ai_girlfriend: false,
  is_nsfw: false,
  is_free: true,
  min_price: 0,
  platform: 'Web App/Browser',
  key_features: 'Interactive storytelling, Custom character creation, AI-powered conversations, Collaborative narratives, Text adventure gameplay',
  pros: 'Free to use, Interactive storytelling, Custom character creation, Natural AI conversations, Collaborative narratives, Web-based platform, Active Discord community, Theme customization, Narrative-focused',
  cons: 'Limited premium info, Web-only platform, Newer platform, Premium pricing TBA',
  best_for: 'Interactive storytelling & text adventure experiences',
  content_policy: 'Narrative-focused with custom character creation',
  updated_date: new Date().toISOString()
};

async function updateDuniaAI() {
  console.log('🔍 Searching for Dunia AI record in Airtable...');

  try {
    // Search for the Dunia AI record
    const records = await table.select({
      filterByFormula: `{name} = 'Dunia AI'`,
      maxRecords: 1
    }).firstPage();

    if (records.length === 0) {
      console.log('❌ Dunia AI record not found in Airtable.');
      console.log('💡 Please create the record in Airtable first, or use the populate-airtable script.');
      process.exit(1);
    }

    const record = records[0];
    console.log(`✅ Found Dunia AI record with ID: ${record.id}`);

    // Update the record
    console.log('📝 Updating Dunia AI record...');
    await table.update(record.id, duniaAIData);

    console.log('✅ Successfully updated Dunia AI record!');
    console.log('\n📊 Updated fields:');
    console.log(`   - Name: ${duniaAIData.name}`);
    console.log(`   - Slug: ${duniaAIData.slug}`);
    console.log(`   - Rating: ${duniaAIData.rating}/5`);
    console.log(`   - Description: ${duniaAIData.description}`);
    console.log(`   - Website: ${duniaAIData.website_url}`);
    console.log(`   - Platform: ${duniaAIData.platform}`);
    console.log(`   - Pricing: ${duniaAIData.pricing_plans}`);
    console.log(`   - Free: ${duniaAIData.is_free ? 'Yes' : 'No'}`);
    console.log('\n🎉 Dunia AI companion page is ready!');
    console.log('🔗 View at: companionguide.ai/companions/dunia-ai');

  } catch (error) {
    console.error('❌ Error updating Dunia AI record:', error.message);

    if (error.message.includes('INVALID_MULTIPLE_CHOICE_OPTIONS')) {
      console.log('\n💡 Tips:');
      console.log('   - Check that categories exist in Airtable: Roleplay & Character Chat');
      console.log('   - Check that badges exist in Airtable: New');
      console.log('   - Verify all field names match exactly (case-sensitive)');
    }

    process.exit(1);
  }
}

async function checkConnection() {
  console.log('🔍 Testing Airtable connection...');

  try {
    await table.select({ maxRecords: 1 }).firstPage();
    console.log('✅ Connection successful!\n');
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('\n🔧 Check your environment variables:');
    console.log('   - AIRTABLE_TOKEN_CG');
    console.log('   - AIRTABLE_BASE_ID_CG');
    console.log('   - AIRTABLE_TABLE_ID_CG');
    console.log('\n💡 Make sure you have a .env file with these variables set.');
    return false;
  }
}

async function main() {
  console.log('🤖 Update Dunia AI in Airtable');
  console.log('================================\n');

  // Test connection first
  const connected = await checkConnection();
  if (!connected) {
    process.exit(1);
  }

  // Update the record
  await updateDuniaAI();
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the script
main().catch(console.error);
