const Airtable = require('airtable');
const fs = require('fs');

// Read companion data
const companions = JSON.parse(fs.readFileSync('./airtable_import.json', 'utf8'));

// Configure Airtable
const base = new Airtable({
  apiKey: process.env.AIRTABLE_TOKEN_CG
}).base(process.env.AIRTABLE_BASE_ID_CG);

const table = base(process.env.AIRTABLE_TABLE_ID_CG);

async function populateAirtable() {
  console.log('🚀 Starting Airtable population...');
  console.log(`📊 Found ${companions.length} companions to import`);

  // Process in batches of 10 (Airtable limit)
  const batchSize = 10;
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < companions.length; i += batchSize) {
    const batch = companions.slice(i, i + batchSize);

    console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(companions.length / batchSize)}`);
    console.log(`   Companions: ${batch.map(c => c.name).join(', ')}`);

    try {
      // Prepare records for Airtable
      const records = batch.map(companion => ({
        fields: {
          name: companion.name,
          slug: companion.slug,
          rating: companion.rating,
          description: companion.description,
          short_description: companion.short_description,
          website_url: companion.website_url,
          affiliate_url: companion.affiliate_url,
          image_url: companion.image_url,
          categories: companion.categories, // Array for multiple select
          badges: companion.badges, // Array for multiple select
          featured: companion.featured,
          pricing_plans: companion.pricing_plans,
          status: 'Active', // Single select value
          is_ai_girlfriend: companion.is_ai_girlfriend,
          is_nsfw: companion.is_nsfw,
          is_free: companion.is_free,
          min_price: companion.min_price,
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString()
        }
      }));

      // Create records in Airtable
      const createdRecords = await table.create(records);
      successCount += createdRecords.length;

      console.log(`   ✅ Successfully created ${createdRecords.length} records`);

      // Wait a bit between batches to avoid rate limiting
      if (i + batchSize < companions.length) {
        console.log('   ⏳ Waiting 1 second before next batch...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

    } catch (error) {
      errorCount += batch.length;
      console.log(`   ❌ Error creating batch: ${error.message}`);
      console.log(`   📋 Failed companions: ${batch.map(c => c.name).join(', ')}`);

      if (error.message.includes('INVALID_MULTIPLE_CHOICE_OPTIONS')) {
        console.log('   💡 Tip: Check that all categories and badges exist in Airtable fields');
      }
    }
  }

  console.log('\n🎉 Population complete!');
  console.log(`✅ Successfully imported: ${successCount} companions`);
  console.log(`❌ Failed to import: ${errorCount} companions`);

  if (successCount > 0) {
    console.log('\n🔗 Test your integration at: companionguide.ai/test-airtable.html');
  }

  if (errorCount > 0) {
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   - Check that all category options exist in Airtable: ai-girlfriend, roleplaying, nsfw, video, wellness, learning, whatsapp, image-gen');
    console.log('   - Check that all badge options exist in Airtable: Leader, Popular, Adult, New, Featured, Top Rated');
    console.log('   - Verify field names match exactly (case-sensitive)');
  }
}

async function checkConnection() {
  console.log('🔍 Testing Airtable connection...');

  try {
    // Try to read existing records to test connection
    const records = await table.select({ maxRecords: 1 }).firstPage();
    console.log('✅ Connection successful!');
    console.log(`📊 Current table has ${records.length > 0 ? 'existing' : 'no'} records`);
    return true;
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('\n🔧 Check your environment variables:');
    console.log('   - AIRTABLE_TOKEN_CG');
    console.log('   - AIRTABLE_BASE_ID_CG');
    console.log('   - AIRTABLE_TABLE_ID_CG');
    return false;
  }
}

// Main execution
async function main() {
  console.log('🤖 Airtable Population Script');
  console.log('=============================\n');

  // Test connection first
  const connected = await checkConnection();
  if (!connected) {
    process.exit(1);
  }

  // Ask for confirmation
  console.log(`\n⚠️  This will add ${companions.length} new records to your Airtable.`);
  console.log('   Make sure your table has the correct field structure.');
  console.log('   Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // Start population
  await populateAirtable();
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the script
main().catch(console.error);