const Airtable = require('airtable');

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
  .base(process.env.AIRTABLE_BASE_ID_CG);

async function checkSoulkynFeatures() {
  try {
    console.log('🔍 Checking Soulkyn AI features in Companion_Translations...\n');

    // Check all language versions
    const languages = ['en', 'nl', 'pt'];

    for (const lang of languages) {
      console.log(`\n=== ${lang.toUpperCase()} ===`);

      const records = await base(process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG)
        .select({
          filterByFormula: `AND({language} = "${lang}", FIND("soulkyn-ai", ARRAYJOIN({slug (from companion)})))`,
          maxRecords: 1
        })
        .all();

      if (records.length === 0) {
        console.log(`❌ No ${lang.toUpperCase()} record found`);
        continue;
      }

      const record = records[0];
      const fields = record.fields;

      console.log(`✅ Record found (${record.id})`);
      console.log(`   Language: ${fields.language}`);
      console.log(`   Features field exists: ${fields.features ? 'YES' : 'NO'}`);

      if (fields.features) {
        let features = fields.features;
        if (typeof features === 'string') {
          try {
            features = JSON.parse(features);
          } catch (e) {
            console.log(`   ⚠️ Features is string but not valid JSON`);
            console.log(`   Raw value: ${features.substring(0, 100)}...`);
            continue;
          }
        }

        if (Array.isArray(features)) {
          console.log(`   Features count: ${features.length}`);
          features.forEach((f, i) => {
            console.log(`   ${i + 1}. ${f.icon || ''} ${f.title || f.name || ''}`);
          });
        } else {
          console.log(`   ⚠️ Features is not an array:`, typeof features);
        }
      } else {
        console.log(`   ⚠️ Features field is empty or undefined`);
      }
    }

    // Also check Table 1
    console.log(`\n\n=== TABLE 1 (Base Companions) ===`);
    const companionRecords = await base(process.env.AIRTABLE_TABLE_ID_CG)
      .select({
        filterByFormula: `{slug} = 'soulkyn-ai'`,
        maxRecords: 1
      })
      .all();

    if (companionRecords.length > 0) {
      const fields = companionRecords[0].fields;
      console.log(`✅ Found Soulkyn in Table 1`);
      console.log(`   Features field exists: ${fields.features ? 'YES' : 'NO'}`);

      if (fields.features) {
        let features = fields.features;
        if (typeof features === 'string') {
          try {
            features = JSON.parse(features);
          } catch (e) {
            console.log(`   ⚠️ Features is string but not valid JSON`);
            return;
          }
        }

        if (Array.isArray(features)) {
          console.log(`   Features count: ${features.length}`);
          features.forEach((f, i) => {
            console.log(`   ${i + 1}. ${f.icon || ''} ${f.title || f.name || ''}`);
          });
        }
      }
    } else {
      console.log(`❌ Soulkyn not found in Table 1`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkSoulkynFeatures();
