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

        // Update main H1 title
        const heroTitle = document.querySelector('.companion-hero h1, .hero-title, h1');
        if (heroTitle) {
            heroTitle.textContent = reviewTitle;
        }

        // Update document title
        document.title = `${reviewTitle} 2025 - ${document.title.split(' - ').slice(1).join(' - ')}`;
    }

    updateHeroSection() {
        const companionName = this.getCompanionName();

        // Update logo alt text
        const logo = document.querySelector('.companion-logo, .hero img');
        if (logo && this.companionData.logo) {
            logo.src = this.companionData.logo;
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