const Airtable = require('airtable');
const fs = require('fs');
const path = require('path');

// Configuration
const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN_CG;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID_CG;
const COMPANIONS_TABLE_ID = process.env.AIRTABLE_TABLE_ID_CG;

if (!AIRTABLE_TOKEN || !AIRTABLE_BASE_ID || !COMPANIONS_TABLE_ID) {
  console.error('❌ Missing required environment variables');
  console.error('Required: AIRTABLE_TOKEN_CG, AIRTABLE_BASE_ID_CG, AIRTABLE_TABLE_ID_CG');
  process.exit(1);
}

const base = new Airtable({apiKey: AIRTABLE_TOKEN}).base(AIRTABLE_BASE_ID);

/**
 * Extract meta title and description from HTML file
 */
function extractMetaFromHTML(slug) {
  const filePath = path.join(__dirname, '..', 'companions', `${slug}.html`);

  if (!fs.existsSync(filePath)) {
    console.log(`   ⚠️  HTML file not found: ${filePath}`);
    return null;
  }

  const html = fs.readFileSync(filePath, 'utf-8');

  // Extract meta title
  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  const metaTitle = titleMatch ? titleMatch[1] : null;

  // Extract meta description
  const descMatch = html.match(/<meta name="description" content="(.*?)"/);
  const metaDescription = descMatch ? descMatch[1] : null;

  return {
    meta_title: metaTitle,
    meta_description: metaDescription
  };
}

/**
 * Update companion record with meta fields
 */
async function updateCompanionMeta(recordId, slug, metaData) {
  try {
    if (!metaData || (!metaData.meta_title && !metaData.meta_description)) {
      console.log(`   ⚠️  No meta data found for ${slug}`);
      return false;
    }

    const updateData = {};
    if (metaData.meta_title) updateData.meta_title = metaData.meta_title;
    if (metaData.meta_description) updateData.meta_description = metaData.meta_description;

    await base(COMPANIONS_TABLE_ID).update(recordId, updateData);

    console.log(`   ✅ Updated meta fields for ${slug}`);
    console.log(`      Title: ${metaData.meta_title?.substring(0, 60)}...`);
    console.log(`      Description: ${metaData.meta_description?.substring(0, 80)}...`);

    return true;
  } catch (error) {
    console.error(`   ❌ Error updating ${slug}:`, error.message);
    return false;
  }
}

/**
 * Main function to add meta fields to all companions
 */
async function addMetaFieldsToCompanions() {
  console.log('🚀 Adding meta_title and meta_description fields to Companions table...');
  console.log(`📦 Using Companions Table: ${COMPANIONS_TABLE_ID}`);
  console.log('');

  let successCount = 0;
  let failCount = 0;
  let skipCount = 0;

  try {
    // Fetch all companion records
    console.log('📥 Fetching all companions from Airtable...');
    const records = await base(COMPANIONS_TABLE_ID).select().all();
    console.log(`   Found ${records.length} companions\n`);

    for (const record of records) {
      const slug = record.fields.slug;
      const recordId = record.id;

      console.log(`\n📝 Processing: ${slug}`);

      // Check if meta fields already exist
      if (record.fields.meta_title && record.fields.meta_description) {
        console.log(`   ⏭️  Meta fields already exist, skipping...`);
        skipCount++;
        continue;
      }

      // Extract meta data from HTML file
      const metaData = extractMetaFromHTML(slug);

      if (!metaData) {
        failCount++;
        continue;
      }

      // Update Airtable record
      const success = await updateCompanionMeta(recordId, slug, metaData);

      if (success) {
        successCount++;
      } else {
        failCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Meta fields population complete!');
  console.log(`   Success: ${successCount}`);
  console.log(`   Skipped: ${skipCount} (already had meta fields)`);
  console.log(`   Failed: ${failCount}`);
  console.log('='.repeat(70));
  console.log('\n📋 Next steps:');
  console.log('   1. Check Airtable to verify meta_title and meta_description fields');
  console.log('   2. You can now add these fields to the Companion_Translations table');
  console.log('   3. This will make it easier to manage meta translations per language');
}

// Run the script
addMetaFieldsToCompanions().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
