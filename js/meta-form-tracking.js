/**
 * Meta Pixel - Form Tracking
 * Tracks Lead and CompleteRegistration events for forms
 */

(function() {
    'use strict';

    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFormTracking);
    } else {
        initFormTracking();
    }

    function initFormTracking() {
        // Track contact form submissions
        trackContactForm();

        // Track review submission forms
        trackReviewForms();

        // Track newsletter subscriptions
        trackNewsletterSubscriptions();
    }

    /**
     * Track Contact Form - Lead Event
     */
    function trackContactForm() {
        const contactForm = document.querySelector('#contactForm, form[name="contact"]');

        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                const formData = new FormData(this);
                const subject = formData.get('subject');
                const newsletter = formData.get('newsletter');

                // Track as Lead
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'Lead', {
                        content_name: 'Contact Form',
                        content_category: subject || 'general',
                        status: 'submitted'
                    });

                    console.log('Meta Pixel: Lead tracked (Contact Form)', {
                        content_category: subject
                    });

                    // Track newsletter subscription if checked
                    if (newsletter === 'yes') {
                        fbq('track', 'CompleteRegistration', {
                            content_name: 'Newsletter Signup',
                            registration_method: 'contact_form'
                        });

                        console.log('Meta Pixel: CompleteRegistration tracked (Newsletter)');
                    }
                }
            });
        }
    }

    /**
     * Track Review Submission Forms - Lead Event
     */
    function trackReviewForms() {
        const reviewForms = document.querySelectorAll('form[name="review"], #reviewForm, form[action*="review"]');

        reviewForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                const formData = new FormData(this);
                const companionName = formData.get('companion') || 'Unknown';
                const rating = formData.get('rating');

                if (typeof fbq !== 'undefined') {
                    fbq('track', 'Lead', {
                        content_name: 'Review Submission',
                        content_category: 'User Review',
                        value: parseFloat(rating) || 0,
                        predicted_ltv: parseFloat(rating) || 0
                    });

                    console.log('Meta Pixel: Lead tracked (Review)', {
                        companion: companionName,
                        rating: rating
                    });
                }
            });
        });
    }

    /**
     * Track Newsletter Subscriptions - CompleteRegistration Event
     */
    function trackNewsletterSubscriptions() {
        // Track standalone newsletter forms
        const newsletterForms = document.querySelectorAll('form[name="newsletter"], #newsletterForm, .newsletter-form');

        newsletterForms.forEach(form => {
            form.addEventListener('submit', function(e) {
                if (typeof fbq !== 'undefined') {
                    fbq('track', 'CompleteRegistration', {
                        content_name: 'Newsletter Signup',
                        registration_method: 'newsletter_form',
                        status: 'subscribed'
                    });

                    console.log('Meta Pixel: CompleteRegistration tracked (Newsletter)');
                }
            });
        });

        // Track newsletter checkboxes in other forms
        const newsletterCheckboxes = document.querySelectorAll('input[type="checkbox"][name="newsletter"]');

        newsletterCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    console.log('Newsletter checkbox checked - will track on form submit');
                }
            });
        });
    }

})();
