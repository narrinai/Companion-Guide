// Simple Category Companions Grid Loader
class CategoryCompanions {
    constructor() {
        this.companions = [];
        this.init();
    }

    async init() {
        await this.loadCompanions();
        this.renderCompanionGrid();
    }

    async loadCompanions() {
        try {
            const response = await fetch('/.netlify/functions/get-companions');
            const data = await response.json();

            if (data.companions) {
                // Show all featured companions for category pages
                this.companions = data.companions.filter(companion => companion.featured).slice(0, 12);
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

    getStaticCompanions() {
        // Fallback static data
        return [
            {
                name: 'Secrets AI',
                slug: 'secrets-ai',
                rating: 4.8,
                short_description: '#1 Realistic AI girlfriend website with video generation and 100+ fantasy scenarios.',
                logo_url: '/images/logos/secrets-ai-review-companionguide.png',
                affiliate_url: 'https://www.secrets.ai/browse?fpr=companionguide',
                badges: ['Leader', 'Top Rated']
            },
            {
                name: 'Hammer AI',
                slug: 'hammer-ai',
                rating: 4.7,
                short_description: 'Unlimited free AI character chat platform supporting local and cloud models.',
                logo_url: '/images/logos/hammerai.png',
                affiliate_url: 'https://gumroad.com/a/748605075/zrsof',
                badges: ['Leader', 'Featured']
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

        const html = this.companions.map((companion, index) => {
            const logoUrl = companion.logo_url || '/images/logos/default.png';
            const affiliateUrl = companion.affiliate_url || companion.website_url || '#';
            const rating = companion.rating || 4.0;
            const badges = companion.badges || [];
            const description = companion.short_description || companion.description || 'Premium AI companion for conversations';
            const reviewCount = companion.review_count || 0;

            // Generate product badge based on badges or default ranking
            let productBadge = '';
            if (badges.includes('Leader')) {
                productBadge = `#${index + 1} Leader`;
            } else if (badges.includes('Adult')) {
                productBadge = '🔞 Adult';
            } else if (badges.includes('Popular')) {
                productBadge = '🔥 Popular';
            } else if (badges.includes('Featured')) {
                productBadge = '⭐ Featured';
            }

            // Extract features for feature highlights
            const features = companion.features || [];
            let featureHighlights = '';
            if (features.length > 0) {
                featureHighlights = `
                    <div class="feature-highlights">
                        ${features.slice(0, 4).map(feature => {
                            const icon = feature.icon || '⭐';
                            const title = feature.title || feature;
                            const desc = feature.description || '';
                            return `
                                <div class="feature-item">
                                    <span class="feature-icon">${icon}</span>
                                    <div class="feature-text">
                                        <span class="feature-title">${title}</span>
                                        <span class="feature-desc">${desc}</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }

            // Generate pricing info
            let pricingInfo = '';
            try {
                const plans = typeof companion.pricing_plans === 'string'
                    ? JSON.parse(companion.pricing_plans)
                    : companion.pricing_plans || [];

                const freePlan = plans.find(plan => plan.price === 0);
                if (freePlan) {
                    pricingInfo = `
                        <div class="pricing-section">
                            <div class="price-main">Free trial</div>
                        </div>
                    `;
                }
            } catch (e) {
                // Silent fallback
            }

            return `
                <article class="companion-card${companion.featured ? ' featured' : ''}">
                    ${productBadge ? `<div class="product-badge">${productBadge}</div>` : ''}
                    <div class="card-header">
                        <img src="${logoUrl}" alt="${companion.name}" class="logo" onerror="this.src='/images/logos/default.png'">
                        <div class="title-section">
                            <h3><a href="/companions/${companion.slug}">${companion.name}</a></h3>
                            <div class="rating-line">
                                <span class="stars">${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5-Math.floor(rating))}</span>
                                <span class="rating-score">${rating}/5</span>
                                ${reviewCount > 0 ? `<span class="review-count">(${reviewCount} reviews)</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <p class="description">${description}</p>
                    ${featureHighlights}
                    ${pricingInfo}
                    <div class="card-actions">
                        <a href="/companions/${companion.slug}" class="btn-secondary">Read Review</a>
                        <a href="${affiliateUrl}" class="btn-primary" target="_blank" rel="noopener">Visit Website</a>
                    </div>
                </article>
            `;
        }).join('');

        container.innerHTML = html;
        container.style.display = 'grid'; // Ensure grid display
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CategoryCompanions();
});