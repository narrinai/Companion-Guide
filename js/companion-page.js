// Companion Page Dynamic Content Manager
class CompanionPageManager {
    constructor() {
        this.companionId = this.extractCompanionIdFromUrl();
        this.companionData = null;
        this.init();
    }

    extractCompanionIdFromUrl() {
        // Extract companion ID from URL path like /companions/ourdream-ai
        const path = window.location.pathname;
        const matches = path.match(/\/companions\/([^\/]+)/);
        return matches ? matches[1] : null;
    }

    async init() {
        if (!this.companionId) {
            console.warn('No companion ID found in URL');
            return;
        }

        // Wait for companion manager to be available
        await this.waitForCompanionManager();

        // Load companion data
        await this.loadCompanionData();

        // Update page elements
        this.updatePageContent();

        // Update pricing if available
        this.updatePricing();
    }

    async waitForCompanionManager() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (typeof window.companionManager !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);

            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 5000);
        });
    }

    async loadCompanionData() {
        try {
            // Initialize companion manager if not already done
            if (typeof window.companionManager === 'undefined') {
                window.companionManager = new CompanionManager();
            }

            // Check if fetchCompanionById method exists
            if (typeof window.companionManager.fetchCompanionById !== 'function') {
                console.warn('fetchCompanionById method not available');
                return;
            }

            // Try different variations of the companion ID
            const companionIds = [
                this.companionId,
                this.companionId.replace('-', ''),
                this.companionId.replace('-ai', ''),
                this.companionId.replace('-', ' '),
                this.companionId.charAt(0).toUpperCase() + this.companionId.slice(1)
            ];

            for (const id of companionIds) {
                try {
                    this.companionData = await window.companionManager.fetchCompanionById(id);
                    if (this.companionData) {
                        console.log(`Loaded companion data for ${this.companionId}:`, this.companionData);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!this.companionData) {
                console.warn(`No companion data found for ${this.companionId}`);
                // Try to get all companions to debug
                const allCompanions = await window.companionManager.fetchCompanions();
                console.log('Available companions:', allCompanions.map(c => ({ id: c.id, slug: c.slug, name: c.name })));
            }

        } catch (error) {
            console.error('Error loading companion data:', error);
        }
    }

    updatePageContent() {
        if (!this.companionData) {
            console.warn('No companion data available for page updates');
            return;
        }

        // Update page title with dynamic name + Review
        this.updatePageTitle();

        // Update hero section
        this.updateHeroSection();

        // Update rating if available
        this.updateRating();

        // Update meta tags
        this.updateMetaTags();
    }

    updatePageTitle() {
        const companionName = this.getCompanionName();
        const reviewTitle = `${companionName} Review`;

        // Update main H1 title (exclude header H1)
        const heroTitle = document.querySelector('.companion-hero h1, .hero-title, main h1, .hero h1');
        if (heroTitle) {
            heroTitle.textContent = reviewTitle;
        }

        // Update document title
        document.title = `${reviewTitle} 2025 - ${document.title.split(' - ').slice(1).join(' - ')}`;
    }

    updateHeroSection() {
        const companionName = this.getCompanionName();

        // Update logo - check multiple possible field names
        const logo = document.querySelector('.companion-logo, .hero img');
        const logoUrl = this.companionData.logo_url || this.companionData.logo || this.companionData['logo_url'];
        if (logo && logoUrl) {
            logo.src = logoUrl;
            logo.alt = `${companionName} logo`;
        }

        // Update any "What is [Platform]?" headings
        const whatIsHeading = document.querySelector('h2');
        if (whatIsHeading && whatIsHeading.textContent.includes('What is')) {
            whatIsHeading.textContent = `What is ${companionName}?`;
        }
    }

    updateRating() {
        if (!this.companionData.rating) return;

        const ratingElement = document.querySelector('.rating');
        if (ratingElement) {
            const rating = parseFloat(this.companionData.rating);
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 !== 0;
            const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

            const starDisplay = '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);
            ratingElement.textContent = `${starDisplay} ${rating}/5`;
        }
    }

    updateMetaTags() {
        const companionName = this.getCompanionName();
        const reviewTitle = `${companionName} Review`;

        // Update meta title
        const metaTitle = document.querySelector('meta[property="og:title"], meta[name="twitter:title"]');
        if (metaTitle) {
            metaTitle.setAttribute('content', `${reviewTitle} 2025 - AI Companion Platform`);
        }

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"], meta[property="og:description"]');
        if (metaDesc && this.companionData.description) {
            const description = `In-depth ${reviewTitle} covering features, pricing, and capabilities. ${this.companionData.description}`;
            metaDesc.setAttribute('content', description);
        }
    }

    updatePricing() {
        if (!this.companionData?.pricing_plans) {
            // No dynamic pricing data - add CTA buttons to existing static pricing tiers
            this.addCtaToStaticPricing();
            return;
        }

        let pricingPlans = this.companionData.pricing_plans;

        // If pricing_plans is a string, try to parse it as JSON
        if (typeof pricingPlans === 'string') {
            try {
                // Clean up the JSON string - remove line breaks and extra spaces
                const cleanedJson = pricingPlans.replace(/\n\s*/g, '').trim();
                pricingPlans = JSON.parse(cleanedJson);
            } catch (e) {
                console.warn('Failed to parse pricing_plans JSON:', e);
                return;
            }
        }

        if (!Array.isArray(pricingPlans) || pricingPlans.length === 0) return;

        console.log('Updating pricing with data:', pricingPlans);

        // Find the pricing section
        const pricingSection = document.querySelector('.pricing .pricing-grid');
        if (!pricingSection) return;

        // Clear existing pricing tiers
        pricingSection.innerHTML = '';

        // Generate pricing tiers from Airtable data
        pricingPlans.forEach((plan, index) => {
            const tierDiv = document.createElement('div');
            tierDiv.className = 'pricing-tier';

            // Add featured class to second plan (usually most popular)
            if (index === 1 || plan.name.toLowerCase().includes('premium')) {
                tierDiv.classList.add('featured');
            }

            const price = plan.price === 0 ? 'Free' : `$${plan.price}`;
            const period = plan.price === 0 ? '' : `/${plan.period}`;

            let badgeHtml = '';
            if (index === 1 || plan.name.toLowerCase().includes('premium')) {
                badgeHtml = '<div class="tier-badge">MOST POPULAR</div>';
            }

            const featuresHtml = plan.features.map(feature => {
                // Clean up the feature text - remove all ✅ and ❌ symbols since CSS will handle styling
                let cleanFeature = feature.replace(/^✅\s*/, '').replace(/^❌\s*/, '');
                const hasFeature = !feature.includes('❌');

                // Add appropriate CSS class for styling
                if (hasFeature) {
                    return `<li class="feature-included">${cleanFeature}</li>`;
                } else {
                    return `<li class="feature-excluded">${cleanFeature}</li>`;
                }
            }).join('');

            const websiteUrl = this.companionData.website_url || this.companionData.website || '#';

            tierDiv.innerHTML = `
                ${badgeHtml}
                <h3>${plan.name}</h3>
                <div class="price">${price} <span class="period">${period}</span></div>
                <ul>
                    ${featuresHtml}
                </ul>
                <a href="${websiteUrl}" class="cta-button primary" target="_blank" rel="noopener" style="margin-top: var(--space-4); width: 100%; text-align: center; display: inline-block; padding: var(--space-3) var(--space-4); background: var(--accent-primary); color: white; text-decoration: none; border-radius: var(--radius-md); font-weight: 600; transition: background 0.3s ease;">Visit Website →</a>
            `;

            pricingSection.appendChild(tierDiv);
        });
    }

    addCtaToStaticPricing() {
        // Add CTA buttons to existing static pricing tiers
        const staticPricingTiers = document.querySelectorAll('.pricing-tier');
        const websiteUrl = this.companionData?.website_url || this.companionData?.website || '#';

        staticPricingTiers.forEach(tier => {
            // Check if CTA button already exists
            if (tier.querySelector('.cta-button, .pricing-cta')) {
                return;
            }

            // Create CTA button
            const ctaButton = document.createElement('a');
            ctaButton.href = websiteUrl;
            ctaButton.className = 'cta-button primary pricing-cta';
            ctaButton.target = '_blank';
            ctaButton.rel = 'noopener';
            ctaButton.textContent = 'Visit Website →';
            ctaButton.style.cssText = 'margin-top: var(--space-4); width: 100%; text-align: center; display: inline-block; padding: var(--space-3) var(--space-4); background: var(--accent-primary); color: white; text-decoration: none; border-radius: var(--radius-md); font-weight: 600; transition: background 0.3s ease;';

            // Add button to the tier
            tier.appendChild(ctaButton);
        });
    }

    getCompanionName() {
        // Try different field variations for the name
        return this.companionData?.name ||
               this.companionData?.['Name'] ||
               this.companionData?.title ||
               this.companionData?.['Title'] ||
               this.companionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    // Method to manually update companion data (for testing)
    updateCompanionData(data) {
        this.companionData = data;
        this.updatePageContent();
    }
}

// Initialize companion page manager when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Only initialize on companion pages
    if (window.location.pathname.includes('/companions/')) {
        window.companionPageManager = new CompanionPageManager();
    }
});

// Expose for external use
window.CompanionPageAPI = {
    updateCompanionData: (data) => window.companionPageManager?.updateCompanionData(data),
    getCompanionData: () => window.companionPageManager?.companionData,
    reload: () => window.companionPageManager?.init()
};