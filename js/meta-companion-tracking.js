/**
 * Meta Pixel - Comprehensive Tracking
 * Tracks ViewContent, external link clicks, and other conversion events
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
        // Track ViewContent for companion detail pages
        trackViewContent();

        // Track all external companion links
        trackCompanionLinks();

        // Track search events if search functionality exists
        trackSearchEvents();

        // Set up mutation observer for dynamically loaded content
        observeDynamicContent();
    }

    /**
     * Track ViewContent Standard Event
     * Fires when user views a companion detail page
     */
    function trackViewContent() {
        // Check if we're on a companion detail page
        const pathMatch = window.location.pathname.match(/\/companions\/([^\/]+)/);

        if (pathMatch) {
            const companionSlug = pathMatch[1];
            const companionName = extractCompanionNameFromPage();

            // Try to extract category from page content
            let category = 'AI Companion';
            const categoryBadge = document.querySelector('.product-badge, .category-badge');
            if (categoryBadge) {
                category = categoryBadge.textContent.trim();
            }

            if (typeof fbq !== 'undefined') {
                fbq('track', 'ViewContent', {
                    content_name: companionName,
                    content_category: category,
                    content_ids: [companionSlug],
                    content_type: 'product'
                });

                console.log('Meta Pixel: ViewContent tracked', {
                    content_name: companionName,
                    content_category: category,
                    content_ids: [companionSlug]
                });
            }
        }

        // Track ViewContent for news/guide articles
        const newsMatch = window.location.pathname.match(/\/news\/([^\/]+)/);
        if (newsMatch) {
            const articleSlug = newsMatch[1];
            const articleTitle = document.querySelector('h1')?.textContent.trim() || articleSlug;

            if (typeof fbq !== 'undefined') {
                fbq('track', 'ViewContent', {
                    content_name: articleTitle,
                    content_category: 'Article',
                    content_ids: [articleSlug],
                    content_type: 'article'
                });

                console.log('Meta Pixel: ViewContent (Article) tracked', {
                    content_name: articleTitle,
                    content_ids: [articleSlug]
                });
            }
        }
    }

    /**
     * Extract companion name from page title or heading
     */
    function extractCompanionNameFromPage() {
        // Try h1 first
        const h1 = document.querySelector('h1');
        if (h1) {
            return h1.textContent.trim().split('-')[0].trim();
        }

        // Fallback to title tag
        const title = document.title;
        return title.split('-')[0].trim();
    }

    /**
     * Track Search Standard Event
     * Fires when user performs a search
     */
    function trackSearchEvents() {
        const searchInputs = document.querySelectorAll('input[type="search"], input[name*="search"], input[id*="search"]');

        searchInputs.forEach(input => {
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter' && this.value.trim() !== '') {
                    if (typeof fbq !== 'undefined') {
                        fbq('track', 'Search', {
                            search_string: this.value.trim(),
                            content_category: 'AI Companion'
                        });

                        console.log('Meta Pixel: Search tracked', {
                            search_string: this.value.trim()
                        });
                    }
                }
            });
        });
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
