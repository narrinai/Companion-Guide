const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
  .base(process.env.AIRTABLE_BASE_ID_CG);

async function showExamples() {
  const companions = ['candy-ai', 'dream-companion', 'replika'];

  for (const slug of companions) {
    const records = await base(process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG)
      .select({
        filterByFormula: `AND({slug (from companion)} = "${slug}", {language} = "en")`,
        maxRecords: 1
      })
      .all();

    if (records.length > 0) {
      const name = records[0].fields['name (from companion)']?.[0];
      const bodyText = records[0].fields.body_text;

      console.log('\n' + '='.repeat(70));
      console.log(name);
      console.log('='.repeat(70));
      console.log(bodyText);
      console.log(`\nWords: ${bodyText.split(' ').length}`);
    }
  }
}

showExamples();
