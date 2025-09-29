// Dynamic Category Page Functionality
class CategoryCompanions {
    constructor() {
        this.companions = [];
        this.categorySlug = this.getCurrentCategory();

        this.init();
    }

    getCurrentCategory() {
        // Extract category from URL path
        const path = window.location.pathname;
        const segments = path.split('/');
        return segments[segments.length - 1] || segments[segments.length - 2];
    }

    async init() {
        await this.loadCompanions();
        this.renderCompanionGrid();
        this.renderComparisonTable();
        this.hideLoadingStates();
    }

    async loadCompanions() {
        try {
            const response = await fetch('/.netlify/functions/get-companions');
            const data = await response.json();

            if (data.companions) {
                // Filter companions by category
                this.companions = this.filterCompanionsByCategory(data.companions);
            } else {
                console.warn('No companions data received, falling back to static data');
                this.companions = this.getStaticCompanions();
            }
        } catch (error) {
            console.error('Error loading companions:', error);
            // Fallback to static data
            this.companions = this.getStaticCompanions();
        }
    }

    filterCompanionsByCategory(companions) {
        // Category mapping for different page types
        const categoryMappings = {
            'adult-content-uncensored-companions': ['Adult Content', 'NSFW', 'Uncensored'],
            'roleplay-character-chat-companions': ['Roleplay', 'Character Chat', 'Gaming'],
            'ai-girlfriend-companions': ['AI Girlfriend', 'Romance', 'Dating'],
            'free-ai-companions': ['Free', 'Freemium']
        };

        const targetCategories = categoryMappings[this.categorySlug] || [];

        if (targetCategories.length === 0) {
            return companions.slice(0, 15); // Return first 15 if no specific category mapping
        }

        return companions.filter(companion => {
            if (!companion.categories || companion.categories.length === 0) {
                return false;
            }

            // Check if any of the companion's categories match our target categories
            return companion.categories.some(cat =>
                targetCategories.some(target =>
                    cat.toLowerCase().includes(target.toLowerCase()) ||
                    target.toLowerCase().includes(cat.toLowerCase())
                )
            );
        }).slice(0, 15); // Limit to 15 companions
    }

    getStaticCompanions() {
        // Fallback static data for adult content category
        return [
            {
                name: 'Candy AI',
                slug: 'candy-ai',
                rating: 4.7,
                pricing_plans: [{ name: 'Free', price: 0 }, { name: 'Premium', price: 12.99 }],
                features: ['AI girlfriend', 'Mobile app support'],
                categories: ['Adult Content']
            },
            {
                name: 'Hammer AI',
                slug: 'hammer-ai',
                rating: 4.7,
                pricing_plans: [{ name: 'Free', price: 0 }],
                features: ['100% free uncensored', 'Privacy-focused chat'],
                categories: ['Adult Content']
            },
            {
                name: 'FantasyGF',
                slug: 'fantasygf-ai',
                rating: 4.7,
                pricing_plans: [{ name: 'Free', price: 0 }, { name: 'Premium', price: 12.99 }],
                features: ['Voice calls & video gen', 'Virtual dating'],
                categories: ['Adult Content']
            }
        ];
    }

    renderCompanionGrid() {
        const container = document.getElementById('nsfw-companions-container');
        if (!container) return;

        // Hide loading state
        const loadingState = document.getElementById('companions-loading');
        if (loadingState) {
            loadingState.style.display = 'none';
        }

        const html = this.companions.map(companion => {
            const logoUrl = companion.logo_url || '/images/logos/default.png';
            const affiliateUrl = companion.affiliate_url || companion.website_url || '#';
            const rating = companion.rating || 4.0;
            const badges = companion.badges || [];

            return `
                <div class="companion-card">
                    <div class="companion-header">
                        <img src="${logoUrl}" alt="${companion.name}" class="companion-logo" onerror="this.src='/images/logos/default.png'">
                        <div class="companion-info">
                            <h3>${companion.name}</h3>
                            <div class="rating">
                                ${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5-Math.floor(rating))} ${rating}/5
                            </div>
                            ${badges.length > 0 ? `<div class="badges">${badges.slice(0, 2).map(badge => `<span class="badge">${badge}</span>`).join('')}</div>` : ''}
                        </div>
                    </div>
                    <p class="companion-description">${companion.short_description || companion.description || 'Premium AI companion for adult conversations'}</p>
                    <div class="companion-actions">
                        <a href="/companions/${companion.slug}" class="btn-secondary">Read Review</a>
                        <a href="${affiliateUrl}" class="btn-primary" target="_blank" rel="noopener">Try Now</a>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
        container.style.display = 'grid'; // Ensure grid display
    }

    renderComparisonTable() {
        const tableBody = document.querySelector('.comparison-table tbody');
        if (!tableBody) return;

        const html = this.companions.map(companion => {
            const rating = companion.rating || 4.0;
            const pricing = this.getPricingString(companion.pricing_plans);
            const keyFeature = this.getKeyFeature(companion.features);
            const bestFor = this.getBestFor(companion.features, companion.categories);

            return `
                <tr>
                    <td><strong>${companion.name}</strong></td>
                    <td>${rating}/5</td>
                    <td>${pricing}</td>
                    <td>${keyFeature}</td>
                    <td>${bestFor}</td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = html;
    }

    getPricingString(pricingPlans) {
        if (!pricingPlans || pricingPlans.length === 0) {
            return 'Free + Premium plans';
        }

        const freePlan = pricingPlans.find(plan => plan.price === 0 || plan.name.toLowerCase().includes('free'));
        const paidPlans = pricingPlans.filter(plan => plan.price > 0);

        if (freePlan && paidPlans.length > 0) {
            const lowestPaid = Math.min(...paidPlans.map(plan => plan.price));
            return `Free + $${lowestPaid}/month`;
        } else if (freePlan) {
            return 'Free';
        } else if (paidPlans.length > 0) {
            const lowestPaid = Math.min(...paidPlans.map(plan => plan.price));
            return `$${lowestPaid}/month`;
        }

        return 'Contact for pricing';
    }

    getKeyFeature(features) {
        if (!features || features.length === 0) {
            return 'AI companion';
        }

        // Priority features for adult content
        const priorityFeatures = [
            'uncensored', 'nsfw', 'adult', 'voice', 'video', 'image', 'free',
            'premium', 'girlfriend', 'roleplay', 'chat', 'ai'
        ];

        for (const priority of priorityFeatures) {
            const feature = features.find(f =>
                f.toLowerCase().includes(priority)
            );
            if (feature) {
                return feature.length > 25 ? feature.substring(0, 25) + '...' : feature;
            }
        }

        return features[0].length > 25 ? features[0].substring(0, 25) + '...' : features[0];
    }

    getBestFor(features, categories) {
        if (!features && !categories) {
            return 'AI conversations';
        }

        // Combine features and categories for best matching
        const allTags = [...(features || []), ...(categories || [])];
        const tagString = allTags.join(' ').toLowerCase();

        // Define best-for mappings based on content
        if (tagString.includes('uncensored') || tagString.includes('nsfw')) {
            return 'Adult conversations';
        } else if (tagString.includes('girlfriend') || tagString.includes('dating')) {
            return 'Virtual dating';
        } else if (tagString.includes('roleplay') || tagString.includes('character')) {
            return 'Roleplay scenarios';
        } else if (tagString.includes('voice') || tagString.includes('call')) {
            return 'Voice interactions';
        } else if (tagString.includes('image') || tagString.includes('photo')) {
            return 'Visual content';
        } else if (tagString.includes('free')) {
            return 'Budget-conscious users';
        } else if (tagString.includes('premium') || tagString.includes('advanced')) {
            return 'Premium features';
        } else if (tagString.includes('mobile') || tagString.includes('app')) {
            return 'Mobile users';
        } else if (tagString.includes('privacy') || tagString.includes('anonymous')) {
            return 'Privacy-focused users';
        }

        return 'AI conversations';
    }

    hideLoadingStates() {
        // Hide any remaining loading states
        const loadingElements = document.querySelectorAll('.loading-state, .loading-row');
        loadingElements.forEach(element => {
            element.style.display = 'none';
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CategoryCompanions();
});