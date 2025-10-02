// Debug script to test image-gen category filtering
const fetch = require('node-fetch');

async function debugImageGenCategory() {
    try {
        console.log('Fetching companions data...');
        const response = await fetch('https://companionguide.ai/.netlify/functions/companionguide-get');
        const data = await response.json();

        console.log(`Total companions fetched: ${data.companions.length}\n`);

        // Current category mapping from category-companions.js
        const currentPath = '/categories/adult-image-generation-companions';
        const categoryMapping = {
            '/categories/adult-content-uncensored-companions': ['nsfw', 'adult', 'uncensored'],
            '/categories/adult-image-generation-companions': ['image-gen', 'nsfw', 'adult'],
            '/categories/ai-girlfriend-companions': ['ai-girlfriend', 'romance', 'dating'],
            '/categories/roleplay-character-chat-companions': ['roleplaying', 'character', 'fantasy'],
            '/categories/video-companions-companions': ['video', 'visual'],
            '/categories/whatsapp-companions-companions': ['whatsapp', 'messaging'],
            '/categories/wellness-companions': ['wellness', 'therapy', 'mental-health'],
            '/categories/learning-companions': ['education', 'learning', 'productivity']
        };

        const pageCategories = categoryMapping[currentPath];
        console.log(`Page categories to match: ${JSON.stringify(pageCategories)}\n`);

        // Test the filtering logic
        const filteredCompanions = data.companions.filter(companion => {
            if (!companion.categories || !Array.isArray(companion.categories)) {
                return false;
            }

            // Check if companion has any of the page categories
            const matches = companion.categories.some(companionCategory =>
                pageCategories.some(pageCategory =>
                    companionCategory.toLowerCase().includes(pageCategory.toLowerCase()) ||
                    pageCategory.toLowerCase().includes(companionCategory.toLowerCase())
                )
            );

            return matches;
        });

        console.log(`Filtered companions count: ${filteredCompanions.length}\n`);

        // Show companions with image-gen specifically
        console.log('Companions with "image-gen" tag:');
        const imageGenCompanions = data.companions.filter(c =>
            c.categories && c.categories.includes('image-gen')
        );
        imageGenCompanions.forEach((comp, idx) => {
            console.log(`${idx + 1}. ${comp.name} - Categories: ${JSON.stringify(comp.categories)}`);
        });

        console.log(`\nTotal with image-gen tag: ${imageGenCompanions.length}`);

        // Show what the filter actually returns
        console.log('\n\nFiltered companions (what should show on page):');
        filteredCompanions.slice(0, 12).forEach((comp, idx) => {
            console.log(`${idx + 1}. ${comp.name} - Categories: ${JSON.stringify(comp.categories)} - Rating: ${comp.rating}`);
        });

    } catch (error) {
        console.error('Error:', error);
    }
}

debugImageGenCategory();