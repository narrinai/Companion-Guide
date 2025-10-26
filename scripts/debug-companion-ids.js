#!/usr/bin/env node

/**
 * Debug companion ID mismatch between tables
 */

const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

const COMPANIONS_TABLE = process.env.AIRTABLE_TABLE_ID_CG;
const TRANSLATIONS_TABLE = process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG;

async function debug() {
  console.log('\n🔍 Debugging Companion ID Mismatch\n');

  // Step 1: Get secrets-ai companion
  console.log('1️⃣ Finding secrets-ai companion...');
  const companionRecords = await base(COMPANIONS_TABLE)
    .select({
      filterByFormula: `{slug} = "secrets-ai"`,
      maxRecords: 1
    })
    .all();

  if (companionRecords.length === 0) {
    console.log('❌ Companion not found!');
    return;
  }

  const secretsAI = companionRecords[0];
  console.log('✅ Found secrets-ai:');
  console.log('   ID:', secretsAI.id);
  console.log('   Name:', secretsAI.fields.name);
  console.log('   Slug:', secretsAI.fields.slug);

  // Step 2: Search for ANY PT translation that contains "secrets" in name/slug
  console.log('\n2️⃣ Searching PT translations for secrets-ai...');
  const allPT = await base(TRANSLATIONS_TABLE)
    .select({
      filterByFormula: '{language} = "pt"'
    })
    .all();

  console.log(`Found ${allPT.length} total PT translations`);

  // Step 3: For each PT translation, get the companion details
  console.log('\n3️⃣ Checking companion IDs in translations...');
  for (const translation of allPT.slice(0, 10)) {
    const companionIds = translation.fields.companion || [];
    if (companionIds.length === 0) continue;

    // Get companion details
    const companionId = companionIds[0];
    try {
      const companion = await base(COMPANIONS_TABLE).find(companionId);
      const slug = companion.fields.slug;

      if (slug === 'secrets-ai' || slug?.includes('secret')) {
        console.log('\n✨ FOUND MATCH!');
        console.log('   Translation ID:', translation.id);
        console.log('   Companion ID in translation:', companionId);
        console.log('   Companion slug:', slug);
        console.log('   my_verdict length:', translation.fields.my_verdict?.length || 0);
        console.log('   Expected companion ID:', secretsAI.id);
        console.log('   IDs match:', companionId === secretsAI.id);
      }
    } catch (error) {
      console.log(`   ⚠️ Companion ${companionId} not found or error:`, error.message);
    }

    // Rate limit
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Step 4: Try alternative search methods
  console.log('\n4️⃣ Trying alternative search by companion name...');
  const byName = await base(TRANSLATIONS_TABLE)
    .select({
      filterByFormula: `AND({language} = "pt", SEARCH("secrets", LOWER({companion_name})))`,
      maxRecords: 5
    })
    .all();

  console.log(`Found ${byName.length} translations with "secrets" in companion_name`);
  byName.forEach(record => {
    console.log('   -', record.fields.companion_name, '- my_verdict:', record.fields.my_verdict?.length || 0);
  });
}

debug().catch(console.error);
