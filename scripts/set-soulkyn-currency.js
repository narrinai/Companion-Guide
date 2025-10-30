const Airtable = require('airtable');

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
  .base(process.env.AIRTABLE_BASE_ID_CG);

const tableId = process.env.AIRTABLE_TABLE_ID_CG;

async function setSoulkynCurrency() {
  try {
    console.log('🔍 Searching for Soulkyn AI record...\n');

    // Find Soulkyn AI record
    const records = await base(tableId)
      .select({
        filterByFormula: "OR({slug} = 'soulkyn-ai', {name} = 'Soulkyn AI')",
        maxRecords: 1
      })
      .firstPage();

    if (records.length === 0) {
      console.log('❌ Soulkyn AI record not found!');
      return;
    }

    const record = records[0];
    console.log(`✅ Found: ${record.fields.name} (${record.id})\n`);

    // Update the currency field
    await base(tableId).update([
      {
        id: record.id,
        fields: {
          currency: '€'
        }
      }
    ]);

    console.log('✅ Successfully set Soulkyn AI currency to €!\n');
    console.log('💶 Soulkyn AI will now display prices in Euros');
    console.log('\n✨ Done!');

  } catch (error) {
    console.error('❌ Error updating Soulkyn currency:', error.message);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
  }
}

setSoulkynCurrency();
