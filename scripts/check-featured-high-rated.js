const Airtable = require('airtable');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);

async function checkFeaturedHighRated() {
    try {
        console.log('Fetching all companions from Airtable...\n');

        const companions = [];

        await base('Companions').select({
            view: 'Grid view'
        }).eachPage((records, fetchNextPage) => {
            records.forEach(record => {
                const rating = parseFloat(record.get('Rating')) || 0;
                const featured = record.get('Featured') === true || record.get('Featured') === 'true';
                const hidden = record.get('Hidden') === true || record.get('Hidden') === 'true';
                const name = record.get('Name');

                companions.push({
                    name,
                    rating,
                    featured,
                    hidden
                });
            });
            fetchNextPage();
        });

        console.log(`Total companions: ${companions.length}\n`);

        // Filter for featured companions with rating 9.1+
        const featuredHighRated = companions
            .filter(c => c.featured && c.rating >= 9.1 && !c.hidden)
            .sort((a, b) => b.rating - a.rating);

        console.log(`Featured companions with rating 9.1+: ${featuredHighRated.length}`);
        console.log('================================================\n');

        featuredHighRated.forEach(c => {
            console.log(`${c.rating.toFixed(1)}/10 - ${c.name} (Featured: ${c.featured})`);
        });

        console.log('\n================================================');
        console.log('\nAll companions with rating 9.1+ (regardless of featured status):');
        console.log('================================================\n');

        const allHighRated = companions
            .filter(c => c.rating >= 9.1 && !c.hidden)
            .sort((a, b) => b.rating - a.rating);

        allHighRated.forEach(c => {
            console.log(`${c.rating.toFixed(1)}/10 - ${c.name} (Featured: ${c.featured})`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

checkFeaturedHighRated();
