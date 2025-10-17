/**
 * Google Analytics 4 - External Link & Event Tracking
 * Tracks outbound clicks, page views, and user interactions
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
                    gtag('event', 'click', {
                        event_category: 'outbound',
                        event_label: linkData.url,
                        link_text: linkData.text,
                        link_url: linkData.url,
                        link_domain: linkData.domain,
                        page_location: window.location.pathname,
                        companion_name: linkData.companionName,
                        link_type: linkData.linkType
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

        // Extract domain
        try {
            const urlObj = new URL(href);
            domain = urlObj.hostname.replace('www.', '');
        } catch (e) {
            domain = 'unknown';
        }

        // Try to find companion name
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

        // Determine button type
        if (linkElement.classList.contains('platform-btn') || linkElement.classList.contains('cta-button')) {
            linkType = 'cta_button';
        } else if (linkElement.closest('.pricing-tier')) {
            linkType = 'pricing_cta';
        }

        return {
            url: href,
            text: linkText,
            domain: domain,
            companionName: companionName || domain,
            linkType: linkType
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
