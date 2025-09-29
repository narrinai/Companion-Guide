// FAQ Interactive Functionality with Accessibility Support

document.addEventListener('DOMContentLoaded', function() {
    initializeFAQs();
});

function initializeFAQs() {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach((item, index) => {
        // Add ARIA attributes for accessibility
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (question && answer) {
            // Set up ARIA attributes
            const questionId = `faq-question-${index}`;
            const answerId = `faq-answer-${index}`;

            question.id = questionId;
            answer.id = answerId;

            // Make FAQ item focusable and add ARIA attributes
            item.setAttribute('tabindex', '0');
            item.setAttribute('role', 'button');
            item.setAttribute('aria-expanded', 'false');
            item.setAttribute('aria-controls', answerId);
            question.setAttribute('aria-describedby', answerId);

            // Add click event listener
            item.addEventListener('click', () => toggleFAQ(item));

            // Add keyboard event listener for accessibility
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    toggleFAQ(item);
                }
            });
        }
    });

    // Add search functionality if search input exists
    const searchInput = document.querySelector('.faq-search');
    if (searchInput) {
        searchInput.addEventListener('input', filterFAQs);
    }
}

function toggleFAQ(item) {
    const isActive = item.classList.contains('active');
    const answer = item.querySelector('.faq-answer');

    if (isActive) {
        // Close FAQ
        item.classList.remove('active');
        item.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0';
    } else {
        // Close other open FAQs (optional - remove for accordion behavior)
        document.querySelectorAll('.faq-item.active').forEach(activeItem => {
            if (activeItem !== item) {
                activeItem.classList.remove('active');
                activeItem.setAttribute('aria-expanded', 'false');
                activeItem.querySelector('.faq-answer').style.maxHeight = '0';
            }
        });

        // Open FAQ
        item.classList.add('active');
        item.setAttribute('aria-expanded', 'true');
        // Calculate the actual content height including padding
        const fullHeight = answer.scrollHeight + 20; // Add some padding
        answer.style.maxHeight = fullHeight + 'px';

        // Set to auto after animation completes to prevent any cutoff
        setTimeout(() => {
            if (item.classList.contains('active')) {
                answer.style.maxHeight = 'none';
            }
        }, 300); // Match the CSS transition duration
    }

    // Track FAQ interaction for analytics (if analytics is available)
    if (typeof gtag !== 'undefined') {
        const question = item.querySelector('.faq-question').textContent;
        gtag('event', 'faq_interaction', {
            'event_category': 'FAQ',
            'event_label': question,
            'value': isActive ? 0 : 1 // 0 for close, 1 for open
        });
    }
}

function filterFAQs() {
    const searchTerm = document.querySelector('.faq-search').value.toLowerCase();
    const faqItems = document.querySelectorAll('.faq-item');
    let visibleCount = 0;

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question').textContent.toLowerCase();
        const answer = item.querySelector('.faq-answer').textContent.toLowerCase();

        if (question.includes(searchTerm) || answer.includes(searchTerm)) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
            // Close FAQ if it's hidden
            item.classList.remove('active');
            item.setAttribute('aria-expanded', 'false');
            item.querySelector('.faq-answer').style.maxHeight = '0';
        }
    });

    // Show/hide "no results" message
    const noResults = document.querySelector('.faq-no-results');
    if (noResults) {
        noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

// Auto-expand FAQ from URL hash
function autoExpandFAQFromHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#faq-')) {
        const faqItem = document.querySelector(hash);
        if (faqItem && faqItem.classList.contains('faq-item')) {
            setTimeout(() => {
                toggleFAQ(faqItem);
                faqItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }
}

// Initialize auto-expand on load and hash change
window.addEventListener('load', autoExpandFAQFromHash);
window.addEventListener('hashchange', autoExpandFAQFromHash);

// Export functions for external use
window.faqUtils = {
    toggleFAQ,
    filterFAQs,
    initializeFAQs
};