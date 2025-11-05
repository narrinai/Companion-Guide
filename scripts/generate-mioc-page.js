const Airtable = require('airtable');
const https = require('https');
const http = require('http');
require('dotenv').config();

const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG}).base(process.env.AIRTABLE_BASE_ID_CG);

async function generateMiocPage() {
    try {
        console.log('Fetching mioc-ai record from Airtable...\n');

        // Fetch the updated record
        const records = await base('Table 1').select({
            filterByFormula: "{slug} = 'mioc-ai'"
        }).firstPage();

        if (records.length === 0) {
            console.error('Record not found for slug: mioc-ai');
            return;
        }

        const record = records[0];
        const fields = record.fields;

        console.log('Found record:', record.id);
        console.log('Name:', fields.name);
        console.log('Rating:', fields.rating);
        console.log('Features count:', JSON.parse(fields.features || '[]').length);
        console.log('Pricing plans count:', JSON.parse(fields.pricing_plans || '[]').length);

        // Prepare data for page generation
        const pageData = {
            slug: fields.slug,
            name: fields.name,
            rating: fields.rating,
            description: fields.description,
            short_description: fields.tagline,
            pricing_plans: fields.pricing_plans,
            features: fields.features,
            categories: fields.categories || [],
            website_url: fields.website_url
        };

        console.log('\nGenerating companion page via Netlify function...\n');

        // Call the Netlify function to generate the page
        const postData = JSON.stringify(pageData);

        const options = {
            hostname: 'localhost',
            port: 8888,
            path: '/.netlify/functions/generate-companion-page',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const response = await new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    resolve({
                        statusCode: res.statusCode,
                        data: JSON.parse(data)
                    });
                });
            });

            req.on('error', reject);
            req.write(postData);
            req.end();
        });

        console.log('✅ Response:', response.data);
        console.log('\n✅ Companion page generated successfully!');
        console.log('📄 File location: companions/mioc-ai.html');
        console.log('🌐 View at: http://localhost:8888/companions/mioc-ai.html');

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

generateMiocPage();
