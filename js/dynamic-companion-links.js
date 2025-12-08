/**
 * Dynamic Companion Links Manager
 * Automatically updates all companion external links to use Airtable website_url
 * Works on news pages, category pages, and any page with companion links
 */
class DynamicCompanionLinks {
    constructor() {
        this.companions = new Map(); // slug -> companion data
        // A/B test: use global variant if already set, otherwise determine once per page load
        if (typeof window.abTestVariantB === 'undefined') {
            window.abTestVariantB = Math.random() > 0.5;
        }
        this.useVariantB = window.abTestVariantB;
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            await this.loadCompanionData();
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
     * Extract companion slug from various link formats
     */
    extractSlugFromLink(link) {
        const href = link.getAttribute('href') || '';

        // Check for internal companion review links: /companions/slug
        const internalMatch = href.match(/\/companions\/([a-z0-9-]+)/i);
        if (internalMatch) {
            return internalMatch[1];
        }

        // Check for data attributes
        if (link.dataset.companionSlug) {
            return link.dataset.companionSlug;
        }

        // Check parent elements for companion context
        const section = link.closest('[id]');
        if (section) {
            const sectionId = section.id;
            // Section IDs often match companion slugs (e.g., id="crushon-ai")
            if (this.companions.has(sectionId)) {
                return sectionId;
            }
        }

        // Try to match domain to companion
        const domainMatch = href.match(/https?:\/\/(?:www\.)?([^\/\?]+)/i);
        if (domainMatch) {
            const domain = domainMatch[1].toLowerCase();

            // Domain to slug mapping for common patterns
            const domainMappings = {
                'crushon.ai': 'crushon-ai',
                'soulkyn.com': 'soulkyn-ai',
                'nomi.ai': 'nomi-ai',
                'character.ai': 'character-ai',
                'replika.com': 'replika',
                'chai.ml': 'chai-ai',
                'janitorai.com': 'janitor-ai',
                'spicychat.ai': 'spicychat-ai',
                'candy.ai': 'candy-ai',
                'dreamgf.ai': 'dreamgf-ai',
                'fantasygf.ai': 'fantasygf-ai',
                'fantasygf.com': 'fantasygf-ai',
                'promptchan.ai': 'promptchan-ai',
                'promptchan.com': 'promptchan-ai',
                'selira.ai': 'selira-ai',
                'nectar.ai': 'nectar-ai',
                'soulgen.ai': 'soulgen-ai',
                'soulgen.net': 'soulgen-ai',
                'ourdream.ai': 'ourdream-ai',
                'secrets.ai': 'secrets-ai',
                'ehentai.ai': 'ehentai-ai',
                'chub.ai': 'chub-ai',
                'kupid.ai': 'kupid-ai',
                'simone.app': 'simone',
                'sakura.fm': 'sakura-ai',
                'joyland.ai': 'joyland-ai',
                'caveduck.io': 'caveduck',
                'muah.ai': 'muah-ai',
                'dunia.gg': 'dunia-ai',
                'kajiwoto.ai': 'kajiwoto-ai',
                'aviosa.fun': 'aviosa-ai',
                'junipero.ai': 'junipero-ai',
                'gptgirlfriend.online': 'girlfriend-gpt',
                'girlfriendgpt.com': 'girlfriend-gpt',
                // Affiliate tracking domains - check parent section for context
                't.crjmpy.com': null,
                't.avlmy.com': null,
                't.mbsrv2.com': null,
                'gumroad.com': null,
                'edenai.go2cloud.org': null,
            };

            if (domainMappings.hasOwnProperty(domain)) {
                return domainMappings[domain];
            }
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
