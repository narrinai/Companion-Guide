/**
 * Advertisement Click Tracking
 * Tracks all clicks on OurDream AI advertisement placements
 */

(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAdTracking);
    } else {
        initAdTracking();
    }

    function initAdTracking() {
        // Track all ad clicks with event delegation for better performance
        document.addEventListener('click', function(e) {
            // Check if click is within an ad card (news ad or category ad)
            const adCard = e.target.closest('.news-ad-card, .advertisement-card');

            if (adCard) {
                // Check if the click is on a link or button
                const clickedLink = e.target.closest('a, button');

                if (clickedLink) {
                    trackAdClick(clickedLink, adCard);
                }
            }
        });

        console.log('Ad Tracking: Initialized');
    }

    function trackAdClick(element, adCard) {
        const href = element.href || '';
        const buttonText = element.textContent.trim();

        // Determine placement type
        let placement = 'unknown';
        if (adCard.classList.contains('news-ad-card')) {
            placement = 'news_feed';
        } else if (adCard.classList.contains('advertisement-card')) {
            placement = 'category_page';
        }

        // Determine click type
        let clickType = 'unknown';
        if (element.classList.contains('ad-btn-primary') || element.classList.contains('btn-primary')) {
            clickType = 'primary_button';
        } else if (element.classList.contains('ad-btn-secondary') || element.classList.contains('btn-secondary')) {
            clickType = 'secondary_button';
        } else if (element.classList.contains('ad-video-link') || element.closest('.ad-video-container')) {
            clickType = 'video';
        } else if (element.classList.contains('ad-companion-name')) {
            clickType = 'name_link';
        }

        const eventData = {
            companion_name: 'OurDream AI',
            placement: placement,
            click_type: clickType,
            button_text: buttonText,
            destination_url: href,
            page_location: window.location.pathname,
            page_url: window.location.href
        };

        // Track with Meta Pixel
        if (typeof fbq !== 'undefined') {
            fbq('trackCustom', 'AdClick', eventData);
            console.log('Meta Pixel: AdClick tracked', eventData);
        }

        // Track with Google Analytics if available
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ad_click', {
                event_category: 'Advertisement',
                event_label: `${placement} - ${clickType}`,
                companion_name: 'OurDream AI',
                click_type: clickType,
                placement: placement
            });
            console.log('GA: ad_click tracked', eventData);
        }
    }

})();
