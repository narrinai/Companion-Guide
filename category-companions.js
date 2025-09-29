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

        const html = this.companions.map(companion => {
            const logoUrl = companion.logo_url || '/images/logos/default.png';
            const affiliateUrl = companion.affiliate_url || companion.website_url || '#';
            const rating = companion.rating || 4.0;
            const badges = companion.badges || [];
            const description = companion.short_description || companion.description || 'Premium AI companion for conversations';

            return `
                <div class="companion-card">
                    <div class="companion-header">
                        <img src="${logoUrl}" alt="${companion.name}" class="companion-logo" onerror="this.src='/images/logos/default.png'">
                        <div class="companion-info">
                            <h3>${companion.name}</h3>
                            <div class="rating">${'★'.repeat(Math.floor(rating))}${'☆'.repeat(5-Math.floor(rating))} ${rating}/5</div>
                            ${badges.length > 0 ? `<div class="badges">${badges.slice(0, 2).map(badge => `<span class="badge">${badge}</span>`).join('')}</div>` : ''}
                        </div>
                    </div>
                    <p class="companion-description">${description}</p>
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
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new CategoryCompanions();
});