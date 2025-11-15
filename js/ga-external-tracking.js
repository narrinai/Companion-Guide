/**
 * Google Analytics 4 - External Link & Event Tracking
 * Tracks outbound clicks, page views, and user interactions
 *
 * TRACKED EVENTS:
 *
 * 1. outbound_click - Uitgaande clicks naar externe websites
 *    Parameters:
 *    - event_category: 'outbound'
 *    - event_label: unieke link identifier (bijv. 'candy_ai_hero_cta')
 *    - link_text: de tekst van de link
 *    - link_url: de volledige URL waar naartoe wordt geklikt
 *    - link_domain: het domein van de externe link
 *    - page_location: vanaf welke pagina er werd geklikt
 *    - companion_name: naam van de companion (als van toepassing)
 *    - link_type: type link (hero_cta, pricing_cta, companion_card_link, etc.)
 *    - link_position: positie op de pagina (hero, pricing, alternatives, footer, etc.)
 *    - pricing_tier: welke pricing tier (Free Plan, Premium, etc.)
 *    - section_name: naam van de sectie waar de link staat
 *    - link_identifier: unieke ID voor rapportage
 *    - value: 1 (voor conversie tracking)
 *
 * 2. form_submit - Formulier inzendingen
 * 3. scroll - Scroll depth tracking (25%, 50%, 75%, 100%)
 * 4. cta_click - Interne CTA button clicks
 * 5. page_view - Enhanced page views met context
 *
 * GEBRUIK IN GA4:
 * - Ga naar Reports > Events > outbound_click
 * - Filter op event parameters zoals 'companion_name' of 'link_position'
 * - Maak custom reports met dimensies: link_identifier, pricing_tier, link_position
 */

(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGATracking);
    } else {
        initGATracking();
    }

    function initGATracking() {
        // Track all external companion links
        trackExternalLinks();

        // Track form submissions
        trackFormSubmissions();

        // Track scroll depth
        trackScrollDepth();

        // Track CTA button clicks
        trackCTAButtons();

        // Set up mutation observer for dynamically loaded content
        observeDynamicContent();
    }

    /**
     * Track External Link Clicks (Outbound Links)
     * Fires when user clicks on external companion/affiliate links
     */
    function trackExternalLinks() {
        // Select ALL external links (target="_blank") on the page
        const externalLinks = document.querySelectorAll(
            'a[target="_blank"][href^="http"]'
        );

        let newLinksCount = 0;

        externalLinks.forEach(link => {
            // Skip if already tracked
            if (link.dataset.gaTracked) return;

            link.addEventListener('click', function(e) {
                const linkData = extractLinkData(this);

                // Track with Google Analytics 4
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'outbound_click', {
                        event_category: 'outbound',
                        event_label: linkData.linkIdentifier,
                        link_text: linkData.text,
                        link_url: linkData.url,
                        link_domain: linkData.domain,
                        page_location: window.location.pathname,
                        companion_name: linkData.companionName,
                        link_type: linkData.linkType,
                        link_position: linkData.linkPosition,
                        pricing_tier: linkData.pricingTier,
                        section_name: linkData.sectionName,
                        link_identifier: linkData.linkIdentifier,
                        value: 1
                    });

                    console.log('GA4: Outbound click tracked', linkData);
                } else {
                    console.warn('Google Analytics (gtag) not loaded - event not tracked');
                }
            });

            // Mark as tracked
            link.dataset.gaTracked = 'true';
            newLinksCount++;
        });

        // Only log if new links were added
        if (newLinksCount > 0) {
            console.log(`GA External Tracking: ${newLinksCount} new external links initialized`);
        }
    }

    /**
     * Extract link data for tracking
     */
    function extractLinkData(linkElement) {
        const href = linkElement.href;
        const linkText = linkElement.textContent.trim();
        let domain = '';
        let companionName = '';
        let linkType = 'external_link';
        let linkPosition = 'unknown';
        let pricingTier = '';
        let sectionName = '';

        // Extract domain
        try {
            const urlObj = new URL(href);
            domain = urlObj.hostname.replace('www.', '');
        } catch (e) {
            domain = 'unknown';
        }

        // Try to find companion name from URL path
        const pathMatch = window.location.pathname.match(/\/companions\/([^\/]+)/);
        if (pathMatch) {
            companionName = pathMatch[1].replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            linkType = 'companion_page_link';
        }

        // Check for companion card context
        const card = linkElement.closest('.companion-card, .companion-product-card, .alternative, article');
        if (card) {
            const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
            if (heading) {
                companionName = heading.textContent.trim();
                linkType = 'companion_card_link';
            }
        }

        // Determine link position and context
        if (linkElement.closest('.companion-hero')) {
            linkPosition = 'hero';
            linkType = 'hero_cta';
        } else if (linkElement.closest('.platform-info')) {
            linkPosition = 'platform_info';
        } else if (linkElement.closest('.pricing-tier')) {
            linkPosition = 'pricing';
            linkType = 'pricing_cta';

            // Extract pricing tier information
            const pricingTierElement = linkElement.closest('.pricing-tier');
            const tierHeading = pricingTierElement.querySelector('h3');
            if (tierHeading) {
                pricingTier = tierHeading.textContent.trim();
            }
        } else if (linkElement.closest('.quick-facts')) {
            linkPosition = 'quick_facts';
        } else if (linkElement.closest('.alternatives-section')) {
            linkPosition = 'alternatives';
            linkType = 'alternative_link';
        } else if (linkElement.closest('.faq-section')) {
            linkPosition = 'faq';
        } else if (linkElement.closest('footer')) {
            linkPosition = 'footer';
        } else if (linkElement.closest('header')) {
            linkPosition = 'header';
        }

        // Detect section name from nearest heading
        const nearestSection = linkElement.closest('section');
        if (nearestSection) {
            const sectionHeading = nearestSection.querySelector('h2, h3');
            if (sectionHeading) {
                sectionName = sectionHeading.textContent.trim();
            }
        }

        // Determine button type
        if (linkElement.classList.contains('platform-btn') || linkElement.classList.contains('cta-button')) {
            linkType = 'cta_button';
        }

        // Create unique link identifier for better reporting
        const linkIdentifier = `${companionName || domain}_${linkPosition}_${linkType}`.toLowerCase().replace(/\s+/g, '_');

        return {
            url: href,
            text: linkText,
            domain: domain,
            companionName: companionName || domain,
            linkType: linkType,
            linkPosition: linkPosition,
            pricingTier: pricingTier,
            sectionName: sectionName,
            linkIdentifier: linkIdentifier
        };
    }

    /**
     * Track Form Submissions
     */
    function trackFormSubmissions() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const formName = this.name || this.id || 'unknown_form';

                if (typeof gtag !== 'undefined') {
                    gtag('event', 'form_submit', {
                        event_category: 'engagement',
                        event_label: formName,
                        form_name: formName,
                        page_location: window.location.pathname
                    });

                    console.log('GA4: Form submission tracked', { form_name: formName });
                }
            });
        });
    }

    /**
     * Track Scroll Depth
     * Tracks when users scroll 25%, 50%, 75%, and 100% of page
     */
    function trackScrollDepth() {
        let trackedDepths = {
            25: false,
            50: false,
            75: false,
            100: false
        };

        window.addEventListener('scroll', function() {
            const scrollPercentage = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );

            Object.keys(trackedDepths).forEach(depth => {
                if (scrollPercentage >= parseInt(depth) && !trackedDepths[depth]) {
                    trackedDepths[depth] = true;

                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'scroll', {
                            event_category: 'engagement',
                            event_label: `${depth}%`,
                            scroll_depth: depth,
                            page_location: window.location.pathname
                        });

                        console.log('GA4: Scroll depth tracked', { depth: `${depth}%` });
                    }
                }
            });
        });
    }

    /**
     * Track CTA Button Clicks (non-external)
     */
    function trackCTAButtons() {
        const ctaButtons = document.querySelectorAll('.cta-button, .btn-primary, .subscribe-btn, .get-started-btn');

        ctaButtons.forEach(button => {
            // Skip external links (already tracked)
            if (button.target === '_blank') return;
            if (button.dataset.gaCtaTracked) return;

            button.addEventListener('click', function(e) {
                const buttonText = this.textContent.trim();
                const buttonHref = this.href || window.location.pathname;

                if (typeof gtag !== 'undefined') {
                    gtag('event', 'cta_click', {
                        event_category: 'engagement',
                        event_label: buttonText,
                        button_text: buttonText,
                        button_location: window.location.pathname,
                        button_destination: buttonHref
                    });

                    console.log('GA4: CTA click tracked', { button_text: buttonText });
                }
            });

            button.dataset.gaCtaTracked = 'true';
        });
    }

    /**
     * Track Page View (Enhanced)
     * Called automatically by GA, but we can send additional data
     */
    function trackEnhancedPageView() {
        const pageData = {
            page_title: document.title,
            page_location: window.location.href,
            page_path: window.location.pathname
        };

        // Add companion-specific data if on companion page
        const companionMatch = window.location.pathname.match(/\/companions\/([^\/]+)/);
        if (companionMatch) {
            pageData.companion_slug = companionMatch[1];
            pageData.page_type = 'companion_detail';
        }

        // Add article-specific data if on news page
        const newsMatch = window.location.pathname.match(/\/news\/([^\/]+)/);
        if (newsMatch) {
            pageData.article_slug = newsMatch[1];
            pageData.page_type = 'article';
        }

        if (typeof gtag !== 'undefined') {
            gtag('event', 'page_view', pageData);
            console.log('GA4: Enhanced page view tracked', pageData);
        }
    }

    /**
     * Observe dynamically loaded content
     */
    function observeDynamicContent() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    trackExternalLinks();
                    trackCTAButtons();
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Track enhanced page view on load
    trackEnhancedPageView();

})();
