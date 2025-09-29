// Demo script showing how to use the dynamic deals system

// Example: Adding a new deal programmatically
function addCandyAIDeal() {
    const newDeal = {
        id: 'candy-ai',
        name: 'Candy AI',
        logo: '/images/logos/candy-ai.png',
        rating: '4.2',
        reviewCount: '28',
        badge: '🍭 30% OFF',
        description: 'Sweet deal on Candy AI! Get 30% off the premium AI girlfriend experience with realistic conversations, image generation, and personalized companions.',
        features: [
            { icon: '💖', title: 'AI Girlfriend', desc: 'Realistic chat' },
            { icon: '📸', title: 'Photo Gen', desc: 'Custom images' },
            { icon: '🎯', title: 'Personalized', desc: 'Your preferences' },
            { icon: '🔒', title: 'Private', desc: 'Secure chat' }
        ],
        pricing: {
            originalPrice: '$9.99/month',
            salePrice: '$6.99/month',
            billingNote: '(limited time)'
        },
        links: {
            review: '/companions/candy-ai',
            affiliate: 'https://candy.ai/?ref=companionguide'
        },
        featured: false
    };

    // Add the deal
    DealsAPI.addDeal(newDeal);
}

// Example: Updating an existing deal
function updateOurDreamDeal() {
    const updates = {
        badge: '🍂 EXTENDED SALE',
        pricing: {
            originalPrice: 'was $39.99/month',
            salePrice: '$17.99/month',
            billingNote: '(55% off - extended offer)'
        }
    };

    DealsAPI.updateDeal('ourdream-ai', updates);
}

// Example: Removing a deal
function removeNectarDeal() {
    DealsAPI.removeDeal('nectar-ai');
}

// Example: Getting deal data
function logDealInfo() {
    console.log('All deals:', DealsAPI.getAllDeals());
    console.log('OurDream deal:', DealsAPI.getDeal('ourdream-ai'));
}

// Demo functions that can be called from browser console:
window.DealsDemoAPI = {
    addCandyAI: addCandyAIDeal,
    updateOurDream: updateOurDreamDeal,
    removeNectar: removeNectarDeal,
    logInfo: logDealInfo
};

// Usage examples:
// DealsDemoAPI.addCandyAI()        // Add Candy AI deal
// DealsDemoAPI.updateOurDream()    // Update OurDream pricing
// DealsDemoAPI.removeNectar()      // Remove Nectar AI deal
// DealsDemoAPI.logInfo()           // Log current deals info