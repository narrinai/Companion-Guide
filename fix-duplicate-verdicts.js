const fetch = require('node-fetch');
require('dotenv').config();

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN_CG;
const BASE_ID = 'appUwBhZ6sR4Grnbg';
const TABLE_ID = 'tblTYIfn48xFMPTcl'; // Companion_Translations table

async function fixDuplicateVerdicts() {
  console.log('🔍 Fetching all companion translations...');

  const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  const data = await response.json();
  const records = data.records;

  console.log(`📊 Found ${records.length} translation records`);

  let fixedCount = 0;
  const toUpdate = [];

  for (const record of records) {
    const verdict = record.fields.my_verdict;
    const companionName = record.fields['name (from companion)']?.[0] || 'Unknown';
    const language = record.fields.language || 'unknown';

    if (!verdict) continue;

    // Split into paragraphs
    const paragraphs = verdict.split('\n\n').filter(p => p.trim());

    // Check if second half equals first half
    if (paragraphs.length > 1 && paragraphs.length % 2 === 0) {
      const midpoint = paragraphs.length / 2;
      const firstHalf = paragraphs.slice(0, midpoint).join('\n\n').trim();
      const secondHalf = paragraphs.slice(midpoint).join('\n\n').trim();

      if (firstHalf.toLowerCase() === secondHalf.toLowerCase()) {
        console.log(`⚠️  Found duplicate in ${companionName} (${language})`);
        console.log(`   Original paragraphs: ${paragraphs.length}, Fixed: ${midpoint}`);

        toUpdate.push({
          id: record.id,
          fields: {
            my_verdict: firstHalf
          }
        });

        fixedCount++;
      }
    }
  }

  console.log(`\n📝 Found ${fixedCount} records with duplicate content`);

  if (toUpdate.length > 0) {
    console.log('💾 Updating records in Airtable...');

    // Update in batches of 10 (Airtable limit)
    for (let i = 0; i < toUpdate.length; i += 10) {
      const batch = toUpdate.slice(i, i + 10);
      const batchNum = Math.floor(i / 10) + 1;

      const updateUrl = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;
      const updateResponse = await fetch(updateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ records: batch })
      });

      if (updateResponse.ok) {
        console.log(`✅ Updated batch ${batchNum}`);
      } else {
        const error = await updateResponse.text();
        console.error(`❌ Error updating batch: ${error}`);
      }

      // Wait a bit between batches to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n✅ Successfully fixed ${fixedCount} records!`);
  } else {
    console.log('✅ No duplicates found!');
  }
}

fixDuplicateVerdicts().catch(console.error);
