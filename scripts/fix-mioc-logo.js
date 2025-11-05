const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG}).base(process.env.AIRTABLE_BASE_ID_CG);

async function fixMiocLogo() {
    try {
        console.log('Finding mioc-ai record...\n');

        const records = await base('Table 1').select({
            filterByFormula: "{slug} = 'mioc-ai'"
        }).firstPage();

        if (records.length === 0) {
            console.error('mioc-ai record not found');
            return;
        }

        const record = records[0];
        console.log(`Found record: ${record.id}`);
        console.log(`Current logo_url: ${record.fields.logo_url}\n`);

        // Update logo_url
        await base('Table 1').update(record.id, {
            'logo_url': '/images/logos/mioc-ai-logo.png'
        });

        console.log('✅ Updated logo_url to: /images/logos/mioc-ai-logo.png');

    } catch (error) {
        console.error('Error:', error);
    }
}

fixMiocLogo();
