/**
 * Dynamic Companion Links Manager
 * Automatically updates all companion external links to use Airtable website_url
 * Works on news pages, category pages, and any page with companion links
 *
 * URL source: Always from Airtable (website_url / website_url_2)
 * Slug detection: data-companion-slug attribute (preferred) or dynamic domain mapping
 */
class DynamicCompanionLinks {
    constructor() {
        this.companions = new Map(); // slug -> companion data
        this.domainToSlug = new Map(); // domain -> slug (built from Airtable data)
        // A/B test: read variant from cookie set by Edge Function
        this.useVariantB = this.getABVariantFromCookie() === 'B';
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            await this.loadCompanionData();
            this.buildDomainMappings();
            this.updateAllLinks();
            this.initialized = true;
            console.log('✅ Dynamic companion links initialized');
        } catch (error) {
            console.error('❌ Failed to initialize dynamic companion links:', error);
        }
    }

    async loadCompanionData() {
        // Wait for companionManager if available
        if (window.companionManager) {
            await window.companionManager.fetchCompanions();
            const companions = window.companionManager.companions || [];
            companions.forEach(c => {
                if (c.slug) {
                    this.companions.set(c.slug, c);
                }
            });
            console.log(`📦 Loaded ${this.companions.size} companions from companionManager`);
            return;
        }

        // Fallback: fetch directly from API
        try {
            const response = await fetch('/.netlify/functions/companionguide-get?limit=100');
            if (response.ok) {
                const data = await response.json();
                const companions = data.companions || [];
                companions.forEach(c => {
                    if (c.slug) {
                        this.companions.set(c.slug, c);
                    }
                });
                console.log(`📦 Loaded ${this.companions.size} companions from API`);
            }
        } catch (error) {
            console.error('Failed to fetch companion data:', error);
        }
    }

    /**
     * Build domain-to-slug mappings dynamically from Airtable data
     * Extracts domain from website_url for each companion
     */
    buildDomainMappings() {
        this.domainToSlug.clear();

        this.companions.forEach((companion, slug) => {
            // Extract domain from website_url
            if (companion.website_url) {
                const domain = this.extractDomain(companion.website_url);
                if (domain && !this.domainToSlug.has(domain)) {
                    this.domainToSlug.set(domain, slug);
                }
            }
            // Also map from website_url_2 if different domain
            if (companion.website_url_2) {
                const domain2 = this.extractDomain(companion.website_url_2);
                if (domain2 && !this.domainToSlug.has(domain2)) {
                    this.domainToSlug.set(domain2, slug);
                }
            }
        });

        console.log(`🗺️ Built ${this.domainToSlug.size} domain mappings from Airtable`);
    }

    /**
     * Extract domain from URL (without www prefix)
     */
    extractDomain(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.hostname.replace(/^www\./, '').toLowerCase();
        } catch {
            return null;
        }
    }

    /**
     * Get A/B variant from cookie (set by Edge Function)
     * Returns 'A' or 'B'
     */
    getABVariantFromCookie() {
        const match = document.cookie.match(/ab_variant=([AB])/);
        return match ? match[1] : 'A';
    }

    /**
     * Get the active external URL for a companion (supports A/B testing)
     */
    getActiveExternalUrl(companion) {
        if (!companion) return null;

        const hasVariantB = companion.website_url_2 && companion.website_url_2.trim() !== '';
        const isVariantB = hasVariantB && this.useVariantB;

        return isVariantB
            ? companion.website_url_2
            : (companion.website_url || null);
    }

    /**
     * Extract companion slug from link
     * Priority:
     * 1. data-companion-slug attribute (most reliable)
     * 2. Parent element with data-companion-slug
     * 3. Internal link path (/companions/slug)
     * 4. Section ID matching companion slug
     * 5. Domain mapping from Airtable data
     */
    extractSlugFromLink(link) {
        // 1. Check for data-companion-slug attribute on the link itself
        if (link.dataset.companionSlug) {
            return link.dataset.companionSlug;
        }

        // 2. Check parent elements for data-companion-slug
        const parentWithSlug = link.closest('[data-companion-slug]');
        if (parentWithSlug && parentWithSlug.dataset.companionSlug) {
            return parentWithSlug.dataset.companionSlug;
        }

        const href = link.getAttribute('href') || '';

        // 3. Check for internal companion review links: /companions/slug
        const internalMatch = href.match(/\/companions\/([a-z0-9-]+)/i);
        if (internalMatch) {
            return internalMatch[1];
        }

        // 4. Check parent elements for companion context via section ID
        const section = link.closest('[id]');
        if (section) {
            const sectionId = section.id;
            if (this.companions.has(sectionId)) {
                return sectionId;
            }
        }

        // 5. Try to match domain using dynamic mappings from Airtable
        const domain = this.extractDomain(href);
        if (domain && this.domainToSlug.has(domain)) {
            return this.domainToSlug.get(domain);
        }

        return null;
    }

    /**
     * Check if a link should be updated
     */
    shouldUpdateLink(link) {
        // Skip links inside footer, header, or nav
        if (link.closest('footer') || link.closest('header') || link.closest('nav')) {
            return false;
        }

        // Skip social links and review links
        if (link.classList.contains('social-link') || link.classList.contains('review-link')) {
            return false;
        }

        // Always update links with data-companion-slug
        if (link.dataset.companionSlug || link.closest('[data-companion-slug]')) {
            return true;
        }

        const href = link.getAttribute('href') || '';
        const text = link.textContent.trim().toLowerCase();

        // Check if this is a CTA-type link
        const isCTA =
            link.classList.contains('btn-primary') ||
            link.classList.contains('btn-secondary') ||
            link.classList.contains('platform-btn') ||
            link.classList.contains('cta-button') ||
            link.classList.contains('cta-primary') ||
            link.classList.contains('pricing-cta') ||
            link.classList.contains('external-link') ||
            text.includes('visit') ||
            text.includes('try') ||
            text.includes('get started') ||
            text.includes('bezoek') ||  // Dutch
            text.includes('visitar') || // Portuguese
            text.includes('besuchen');  // German

        // Must be an external link or internal companion link with CTA styling
        const isExternal = href.startsWith('http');
        const isCompanionLink = href.includes('/companions/');

        return isCTA && (isExternal || isCompanionLink);
    }

    /**
     * Update all companion links on the page
     */
    updateAllLinks() {
        // Selectors for links that might need updating
        const selectors = [
            // Data attribute selectors (preferred)
            '[data-companion-slug] a',
            'a[data-companion-slug]',
            // Legacy selectors for backwards compatibility
            '.platform-cta a',
            '.btn-primary[target="_blank"]',
            '.btn-secondary[target="_blank"]',
            '.cta-primary[target="_blank"]',
            '.cta-button[target="_blank"]',
            '.pricing-cta[target="_blank"]',
            'a.btn-primary[href*="http"]',
            'a.btn-secondary[href*="http"]',
            'main a[href*="http"][target="_blank"]',
            '.content-section a[href*="http"][target="_blank"]',
            '.platform-review a[href*="http"][target="_blank"]',
            'a.external-link',
        ];

        let updatedCount = 0;

        selectors.forEach(selector => {
            const links = document.querySelectorAll(selector);
            links.forEach(link => {
                if (!this.shouldUpdateLink(link)) {
                    return;
                }

                const slug = this.extractSlugFromLink(link);
                if (!slug) {
                    return;
                }

                const companion = this.companions.get(slug);
                if (!companion) {
                    console.warn(`⚠️ No companion data found for slug: ${slug}`);
                    return;
                }

                const newUrl = this.getActiveExternalUrl(companion);
                if (!newUrl) {
                    console.warn(`⚠️ No website_url for companion: ${slug}`);
                    return;
                }

                const oldUrl = link.getAttribute('href');
                if (oldUrl !== newUrl) {
                    link.setAttribute('href', newUrl);
                    updatedCount++;
                    console.log(`🔗 Updated ${slug}: ${oldUrl} → ${newUrl}`);
                }
            });
        });

        console.log(`✅ Updated ${updatedCount} companion links`);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dynamicCompanionLinks = new DynamicCompanionLinks();
    });
} else {
    window.dynamicCompanionLinks = new DynamicCompanionLinks();
}
