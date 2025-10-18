/**
 * FAQ Dynamic Ratings Loader
 * Replaces hardcoded ratings in FAQ sections with dynamic data from Airtable
 */

(function() {
    'use strict';

    // Wait for DOM and companion manager to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFAQRatings);
    } else {
        initFAQRatings();
    }

    async function initFAQRatings() {
        // Wait for companion manager to be available
        await waitForCompanionManager();

        // Load and update FAQ ratings
        updateFAQRatings();
    }

    async function waitForCompanionManager() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (typeof window.companionManager !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);

            // Timeout after 10 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 10000);
        });
    }

    async function updateFAQRatings() {
        if (typeof window.companionManager === 'undefined') {
            console.warn('Companion manager not available for FAQ ratings');
            return;
        }

        // Get all FAQ answers
        const faqAnswers = document.querySelectorAll('.faq-answer');

        if (faqAnswers.length === 0) {
            return;
        }

        // Fetch all companions data
        let companions = [];
        try {
            companions = await window.companionManager.fetchCompanions();
        } catch (error) {
            console.error('Error fetching companions for FAQ ratings:', error);
            return;
        }

        // Create a map of companion slugs to ratings
        const companionRatings = {};
        companions.forEach(companion => {
            if (companion.slug && companion.rating) {
                companionRatings[companion.slug] = {
                    rating: companion.rating,
                    name: companion.name
                };
            }
        });

        // Process each FAQ answer
        faqAnswers.forEach(answer => {
            updateRatingsInText(answer, companionRatings);
        });

        console.log('FAQ dynamic ratings updated for', Object.keys(companionRatings).length, 'companions');
    }

    function updateRatingsInText(element, companionRatings) {
        // Get all text nodes and links
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
            null
        );

        const nodesToProcess = [];
        let node;
        while (node = walker.nextNode()) {
            if (node.nodeType === Node.TEXT_NODE) {
                nodesToProcess.push(node);
            }
        }

        // Process text nodes
        nodesToProcess.forEach(textNode => {
            let text = textNode.textContent;
            let hasChanges = false;
            let newText = text;

            // Pattern to match: "CompanionName (X.X/5" or "CompanionName (X/5" or similar rating formats
            // Examples: "Candy AI (4.5/5", "Secrets AI (4.8/5", "DreamGF (4.2/5"
            Object.keys(companionRatings).forEach(slug => {
                const data = companionRatings[slug];
                const companionName = data.name;

                // Create regex patterns to find ratings in various formats
                const patterns = [
                    // "Name (X.X/5" or "Name (X/5"
                    new RegExp(`(${escapeRegex(companionName)})\\s*\\(\\d+\\.?\\d*/5`, 'gi'),
                    // "Name (X.X/10" or "Name (X/10"
                    new RegExp(`(${escapeRegex(companionName)})\\s*\\(\\d+\\.?\\d*/10`, 'gi'),
                    // Just the rating part after a mention
                    new RegExp(`(${escapeRegex(companionName)})\\s+\\(\\d+\\.?\\d*`, 'gi')
                ];

                patterns.forEach(pattern => {
                    if (pattern.test(text)) {
                        // Convert rating from X/5 format to X.X/5 format
                        const displayRating = (data.rating / 2).toFixed(1);

                        newText = newText.replace(pattern, (match, name) => {
                            hasChanges = true;
                            // Preserve the original format (whether it was /5 or /10)
                            if (match.includes('/10')) {
                                return `${name} (${data.rating.toFixed(1)}/10`;
                            } else if (match.includes('/5')) {
                                return `${name} (${displayRating}/5`;
                            } else {
                                return `${name} (${displayRating}/5`;
                            }
                        });
                    }
                });
            });

            // Replace text node content if changes were made
            if (hasChanges && newText !== text) {
                textNode.textContent = newText;
            }
        });
    }

    function escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

})();
