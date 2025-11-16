#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Fetch all companions from Netlify function
async function fetchCompanions() {
    const url = 'http://localhost:8888/.netlify/functions/companionguide-get';

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Handle both array and object with companions property
    const companions = Array.isArray(data) ? data : data.companions;

    if (!Array.isArray(companions)) {
        console.error('Response data:', data);
        throw new Error('Response is not an array');
    }

    return companions.map(companion => ({
        slug: companion.slug,
        name: companion.name,
        rating: companion.rating
    }));
}

// Update structured data in HTML file
function updateStructuredData(filePath, rating) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Find and replace ratingValue in structured data
    const ratingValueRegex = /"ratingValue":\s*"[0-9.]+"/g;
    const newRatingValue = `"ratingValue": "${rating}"`;

    if (content.match(ratingValueRegex)) {
        content = content.replace(ratingValueRegex, newRatingValue);
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }

    return false;
}

// Main function
async function main() {
    console.log('🔄 Fetching companions from Airtable...');
    const companions = await fetchCompanions();
    console.log(`✅ Found ${companions.length} companions\n`);

    let updatedCount = 0;
    let notFoundCount = 0;

    // Update each companion page in all languages
    const languages = ['', 'nl', 'pt', 'de'];

    for (const companion of companions) {
        if (!companion.slug || !companion.rating) {
            console.log(`⚠️  Skipping ${companion.name} - missing slug or rating`);
            continue;
        }

        for (const lang of languages) {
            const langPath = lang ? `${lang}/` : '';
            const filePath = path.join(__dirname, '..', langPath, 'companions', `${companion.slug}.html`);

            if (fs.existsSync(filePath)) {
                const updated = updateStructuredData(filePath, companion.rating);
                if (updated) {
                    console.log(`✅ Updated ${langPath}companions/${companion.slug}.html - Rating: ${companion.rating}`);
                    updatedCount++;
                } else {
                    console.log(`⚠️  No structured data found in ${langPath}companions/${companion.slug}.html`);
                }
            } else {
                notFoundCount++;
            }
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updatedCount} files`);
    console.log(`   Not found: ${notFoundCount} files`);
    console.log(`\n✅ Done!`);
}

main().catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
});
