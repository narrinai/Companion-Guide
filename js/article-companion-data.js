// Article Companion Data Loader
// Dynamically loads companion data from Airtable for blog articles

class ArticleCompanionDataLoader {
    constructor() {
        this.companionData = {};
        this.apiUrl = '/.netlify/functions/companionguide-get';
        this.init();
    }

    async init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.loadData());
        } else {
            await this.loadData();
        }
    }

    async loadData() {
        try {
            // Find all elements with data-companion-slug attribute
            const companionElements = document.querySelectorAll('[data-companion-slug]');

            if (companionElements.length === 0) {
                console.log('No companion data elements found');
                return;
            }

            // Fetch all companions data once
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                console.error('Failed to fetch companion data');
                return;
            }

            const data = await response.json();
            const companions = data.companions || [];

            // Create a map of companions by slug
            companions.forEach(companion => {
                this.companionData[companion.slug] = companion;
            });

            // Update each element with companion data
            companionElements.forEach(element => {
                const slug = element.getAttribute('data-companion-slug');
                const companion = this.companionData[slug];

                if (!companion) {
                    console.warn(`Companion not found: ${slug}`);
                    return;
                }

                this.updateElement(element, companion);
            });

            console.log(`Loaded data for ${Object.keys(this.companionData).length} companions`);
        } catch (error) {
            console.error('Error loading companion data:', error);
        }
    }

    updateElement(element, companion) {
        const type = element.getAttribute('data-companion-type');

        switch (type) {
            case 'name':
                element.textContent = companion.name;
                break;

            case 'rating':
                const rating = parseFloat(companion.rating);
                element.textContent = `${rating}/10`;
                break;

            case 'rating-stars':
                const stars = Math.round(parseFloat(companion.rating) / 2);
                const fullStars = Math.min(5, stars);
                const emptyStars = 5 - fullStars;
                element.textContent = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
                break;

            case 'price':
                const pricing = this.parsePricing(companion.pricing_plans);
                if (pricing && pricing.length > 0) {
                    const lowestPrice = Math.min(...pricing.map(p => p.price).filter(p => p > 0));
                    element.textContent = lowestPrice > 0 ? `$${lowestPrice}/month` : 'Free';
                } else {
                    element.textContent = 'Free trial available';
                }
                break;

            case 'pricing-table':
                this.renderPricingTable(element, companion);
                break;

            case 'features-list':
                this.renderFeaturesList(element, companion);
                break;

            case 'link':
                if (companion.website_url || companion.affiliate_url) {
                    element.href = companion.affiliate_url || companion.website_url;
                }
                break;

            default:
                console.warn(`Unknown companion data type: ${type}`);
        }
    }

    parsePricing(pricingPlans) {
        if (!pricingPlans) return [];

        if (typeof pricingPlans === 'string') {
            try {
                return JSON.parse(pricingPlans);
            } catch (e) {
                console.error('Error parsing pricing plans:', e);
                return [];
            }
        }

        return Array.isArray(pricingPlans) ? pricingPlans : [];
    }

    parseFeatures(features) {
        if (!features) return [];

        if (typeof features === 'string') {
            try {
                return JSON.parse(features);
            } catch (e) {
                console.error('Error parsing features:', e);
                return [];
            }
        }

        return Array.isArray(features) ? features : [];
    }

    renderPricingTable(element, companion) {
        const pricing = this.parsePricing(companion.pricing_plans);

        if (pricing.length === 0) {
            element.innerHTML = '<p>Pricing information not available.</p>';
            return;
        }

        let html = '<div class="pricing-table">';

        pricing.forEach(plan => {
            const price = plan.price === 0 ? 'Free' : `$${plan.price}`;
            const period = plan.price === 0 ? '' : `/${plan.period || 'month'}`;

            html += `
                <div class="pricing-tier">
                    <h3>${plan.name}</h3>
                    <div class="price">${price}<span class="period">${period}</span></div>
                    <ul>
                        ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
                    </ul>
                </div>
            `;
        });

        html += '</div>';
        element.innerHTML = html;
    }

    renderFeaturesList(element, companion) {
        const features = this.parseFeatures(companion.features);

        if (features.length === 0) {
            element.innerHTML = '<p>Features information not available.</p>';
            return;
        }

        let html = '<div class="features-list">';

        features.forEach(feature => {
            html += `
                <div class="feature-item">
                    <span class="feature-icon">${feature.icon || '⭐'}</span>
                    <div class="feature-content">
                        <strong>${feature.title}</strong>
                        <p>${feature.description}</p>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        element.innerHTML = html;
    }
}

// Initialize when script loads
if (typeof window !== 'undefined') {
    window.articleCompanionDataLoader = new ArticleCompanionDataLoader();
}
