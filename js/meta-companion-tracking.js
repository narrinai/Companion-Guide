/**
 * Meta Pixel - Companion External Link Tracking
 * Tracks when users click on external companion website links
 */

(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCompanionTracking);
    } else {
        initCompanionTracking();
    }

    function initCompanionTracking() {
        // Track all external companion links
        trackCompanionLinks();

        // Set up mutation observer for dynamically loaded content
        observeDynamicContent();
    }

    function trackCompanionLinks() {
        // Select ALL external links (target="_blank") on the page
        const companionLinks = document.querySelectorAll(
            'a[target="_blank"][href^="http"]'
        );

        let newLinksCount = 0;

        companionLinks.forEach(link => {
            // Skip if already tracked
            if (link.dataset.metaTracked) return;

            link.addEventListener('click', function(e) {
                const companionData = extractCompanionData(this);

                // Track custom event with Meta Pixel
                if (typeof fbq !== 'undefined') {
                    fbq('trackCustom', 'CompanionExternalClick', {
                        companion_name: companionData.name,
                        companion_url: companionData.url,
                        page_location: window.location.pathname,
                        button_type: companionData.buttonType,
                        companion_slug: companionData.slug,
                        link_type: companionData.linkType
                    });

                    console.log('Meta Pixel: CompanionExternalClick tracked', companionData);
                } else {
                    console.warn('Meta Pixel (fbq) not loaded - event not tracked');
                }
            });

            // Mark as tracked
            link.dataset.metaTracked = 'true';
            newLinksCount++;
        });

        // Only log if new links were added
        if (newLinksCount > 0) {
            console.log(`Meta Companion Tracking: ${newLinksCount} new links initialized`);
        }
    }

    function extractCompanionData(linkElement) {
        const href = linkElement.href;
        const buttonText = linkElement.textContent.trim();

        // Try to extract companion name from various sources
        let companionName = 'Unknown';
        let companionSlug = '';
        let linkType = 'external_link';

        // Method 1: Check if we're on a companion detail page
        const pathMatch = window.location.pathname.match(/\/companions\/([^\/]+)/);
        if (pathMatch) {
            companionSlug = pathMatch[1];
            companionName = companionSlug.replace(/-/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            linkType = 'companion_page';
        }

        // Method 2: Look for companion name in nearby heading or card
        const card = linkElement.closest('.companion-card, .companion-product-card, .alternative, article, .hero-content, .test-card');
        if (card) {
            const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
            if (heading) {
                companionName = heading.textContent.trim();
                linkType = 'companion_card';
            }
        }

        // Method 3: Check for companion name in data attributes
        if (linkElement.dataset.companion) {
            companionName = linkElement.dataset.companion;
        }

        // Method 4: Extract domain name from URL as fallback
        if (companionName === 'Unknown' || companionName === '') {
            try {
                const urlObj = new URL(href);
                companionName = urlObj.hostname.replace('www.', '');
                linkType = 'domain_link';
            } catch (e) {
                companionName = 'External Link';
            }
        }

        return {
            name: companionName,
            url: href,
            buttonType: buttonText,
            slug: companionSlug,
            linkType: linkType
        };
    }

    function observeDynamicContent() {
        // Watch for dynamically added content (e.g., from Airtable)
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    trackCompanionLinks();
                }
            });
        });

        // Observe the entire document for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

})();
