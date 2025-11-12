const Airtable = require('airtable');

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
  .base(process.env.AIRTABLE_BASE_ID_CG);

async function checkHiddenCompanions() {
  try {
    console.log('🔍 Checking for hidden companions...\n');

    // Check Table 1 for status field
    const records = await base(process.env.AIRTABLE_TABLE_ID_CG)
      .select({
        fields: ['name', 'slug', 'status']
      })
      .all();

    console.log(`Total companions in Table 1: ${records.length}\n`);

    const hiddenCompanions = records.filter(r => {
      const status = r.fields.status;
      return status && status.toLowerCase() === 'hidden';
    });

    console.log(`=== HIDDEN COMPANIONS (${hiddenCompanions.length}) ===`);
    hiddenCompanions.forEach(r => {
      console.log(`  - ${r.fields.name} (${r.fields.slug}) - Status: ${r.fields.status}`);
    });

    // Check specifically for nectar and swipey
    console.log('\n=== NECTAR & SWIPEY STATUS ===');
    const nectar = records.find(r => r.fields.slug === 'nectar-ai' || r.fields.name === 'Nectar AI');
    const swipey = records.find(r => r.fields.slug === 'swipey' || r.fields.name === 'Swipey');

    if (nectar) {
      console.log(`Nectar AI: ${nectar.fields.status || 'NO STATUS FIELD'}`);
    } else {
      console.log('Nectar AI: NOT FOUND');
    }

    if (swipey) {
      console.log(`Swipey: ${swipey.fields.status || 'NO STATUS FIELD'}`);
    } else {
      console.log('Swipey: NOT FOUND');
    }

    // Show all unique status values
    console.log('\n=== ALL STATUS VALUES ===');
    const statusValues = new Set();
    records.forEach(r => {
      if (r.fields.status) {
        statusValues.add(r.fields.status);
      }
    });
    statusValues.forEach(status => {
      const count = records.filter(r => r.fields.status === status).length;
      console.log(`  ${status}: ${count} companions`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkHiddenCompanions();
