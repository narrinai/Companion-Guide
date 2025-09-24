const fs = require('fs');

// Read the extracted data
const companionsData = JSON.parse(fs.readFileSync('/Users/sebastiaansmits/Documents/AI-Companion-Reviews/companions_data.json', 'utf8'));

// Category mapping based on content analysis
const categoryMapping = {
    'secrets-ai': ['ai-girlfriend', 'video', 'image-gen', 'nsfw'],
    'soulkyn-ai': ['ai-girlfriend', 'nsfw', 'image-gen'],
    'candy-ai': ['ai-girlfriend'],
    'narrin-ai': ['wellness'],
    'hammer-ai': ['roleplaying'],
    'simone': ['whatsapp'],
    'girlfriend-gpt': ['ai-girlfriend', 'nsfw', 'roleplaying'],
    'fantasygf-ai': ['ai-girlfriend', 'video', 'roleplaying'],
    'character-ai': ['roleplaying'],
    'replika': ['wellness'],
    'dreamgf-ai': ['ai-girlfriend', 'image-gen'],
    'cuties-ai': ['ai-girlfriend', 'nsfw', 'image-gen'],
    'chai-ai': ['roleplaying'],
    'caveduck': ['roleplaying', 'image-gen'],
    'janitor-ai': ['roleplaying', 'nsfw'],
    'joi-ai': ['roleplaying'],
    'joyland-ai': ['roleplaying'],
    'kajiwoto-ai': ['learning'],
    'kupid-ai': ['ai-girlfriend', 'image-gen'],
    'lovescape': ['ai-girlfriend'],
    'muah-ai': ['nsfw'],
    'nectar-ai': ['roleplaying', 'image-gen'],
    'nomi-ai': ['wellness'],
    'ourdream-ai': ['video', 'image-gen', 'roleplaying'],
    'promptchan-ai': ['nsfw', 'video', 'image-gen'],
    'sakura-ai': ['roleplaying'],
    'selira-ai': ['nsfw'],
    'soulgen-ai': ['image-gen'],
    'spicychat-ai': ['nsfw', 'roleplaying'],
    'stories-ai': ['roleplaying'],
    'swipey-ai': ['ai-girlfriend', 'roleplaying', 'nsfw', 'video', 'image-gen'],
    'thotchat-ai': ['roleplaying', 'nsfw']
};

// Featured companions from index.html analysis
const featuredCompanions = [
    'secrets-ai', 'soulkyn-ai', 'candy-ai', 'narrin-ai', 'hammer-ai',
    'simone', 'girlfriend-gpt', 'fantasygf-ai'
];

// Badge mapping based on ratings and features
function getBadges(companion) {
    const badges = [];

    if (featuredCompanions.includes(companion.slug)) {
        badges.push('Featured');
    }

    if (companion.rating >= 4.7) {
        badges.push('Top Rated');
    }

    if (companion.rating >= 4.5) {
        badges.push('Popular');
    }

    // Add specific badges based on categories
    const categories = categoryMapping[companion.slug] || companion.categories || [];
    if (categories.includes('nsfw')) {
        badges.push('Adult');
    }

    // Leader badge for top platforms
    if (['secrets-ai', 'soulkyn-ai', 'candy-ai', 'narrin-ai', 'hammer-ai', 'simone'].includes(companion.slug)) {
        badges.push('Leader');
    }

    return [...new Set(badges)]; // Remove duplicates
}

// Create the final Airtable-ready structure
const airtableData = companionsData.map(companion => {
    const categories = categoryMapping[companion.slug] || companion.categories || [];
    const badges = getBadges(companion);

    // Clean up pricing data
    const cleanPricingPlans = companion.pricing_plans.map(plan => ({
        name: plan.name,
        price: plan.price,
        period: plan.price > 0 ? 'monthly' : 'free',
        features: plan.features
    }));

    return {
        // Basic Information
        name: companion.name,
        slug: companion.slug,
        rating: companion.rating,

        // Descriptions
        description: companion.description,
        short_description: companion.short_description,

        // URLs
        website_url: companion.website_url,
        affiliate_url: companion.affiliate_url,
        image_url: companion.image_url.replace('../', '/'),

        // Categorization
        categories: categories,
        badges: badges,
        featured: featuredCompanions.includes(companion.slug),

        // Pricing (JSON string for Airtable)
        pricing_plans: JSON.stringify(cleanPricingPlans),

        // Derived fields for easy filtering
        is_ai_girlfriend: categories.includes('ai-girlfriend'),
        is_nsfw: categories.includes('nsfw'),
        is_free: cleanPricingPlans.some(plan => plan.price === 0),
        min_price: Math.min(...cleanPricingPlans.filter(p => p.price > 0).map(p => p.price)),

        // Status
        status: 'active',
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
    };
}).filter(companion => companion.name && companion.name !== 'Companion Guide'); // Filter out invalid entries

console.log(`\nCreated Airtable import data for ${airtableData.length} companions\n`);

// Create summary statistics
const stats = {
    total_companions: airtableData.length,
    featured_companions: airtableData.filter(c => c.featured).length,
    ai_girlfriend_platforms: airtableData.filter(c => c.is_ai_girlfriend).length,
    nsfw_platforms: airtableData.filter(c => c.is_nsfw).length,
    free_platforms: airtableData.filter(c => c.is_free).length,
    average_rating: (airtableData.reduce((sum, c) => sum + c.rating, 0) / airtableData.length).toFixed(2),
    categories_breakdown: {
        'ai-girlfriend': airtableData.filter(c => c.categories.includes('ai-girlfriend')).length,
        'roleplaying': airtableData.filter(c => c.categories.includes('roleplaying')).length,
        'nsfw': airtableData.filter(c => c.categories.includes('nsfw')).length,
        'image-gen': airtableData.filter(c => c.categories.includes('image-gen')).length,
        'video': airtableData.filter(c => c.categories.includes('video')).length,
        'wellness': airtableData.filter(c => c.categories.includes('wellness')).length,
        'whatsapp': airtableData.filter(c => c.categories.includes('whatsapp')).length,
        'learning': airtableData.filter(c => c.categories.includes('learning')).length
    }
};

// Write the final data
fs.writeFileSync('/Users/sebastiaansmits/Documents/AI-Companion-Reviews/airtable_import.json', JSON.stringify(airtableData, null, 2));
fs.writeFileSync('/Users/sebastiaansmits/Documents/AI-Companion-Reviews/extraction_stats.json', JSON.stringify(stats, null, 2));

console.log('📊 Extraction Summary:');
console.log(`- Total companions: ${stats.total_companions}`);
console.log(`- Featured companions: ${stats.featured_companions}`);
console.log(`- AI Girlfriend platforms: ${stats.ai_girlfriend_platforms}`);
console.log(`- NSFW platforms: ${stats.nsfw_platforms}`);
console.log(`- Free platforms: ${stats.free_platforms}`);
console.log(`- Average rating: ${stats.average_rating}/5`);
console.log('\n📁 Files created:');
console.log('- airtable_import.json (main import file)');
console.log('- extraction_stats.json (statistics)');

console.log('\n✅ Ready for Airtable import!');