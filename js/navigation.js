// Mobile hamburger menu toggle
function toggleMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const overlay = document.querySelector('.nav-menu-overlay');

    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');

    // Toggle body scroll when menu is open
    if (navMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

/**
 * Update navigation links with proper language URLs and translations
 */
function updateNavigationLinks() {
    if (!window.i18n || !window.i18n.initialized) {
        console.warn('i18n not initialized, skipping nav update');
        return;
    }

    const currentLang = window.i18n.currentLang;
    const langPrefix = currentLang === 'en' ? '' : `/${currentLang}`;

    // Map of nav items to their translation keys
    const navItems = {
        'Home': { key: 'nav.home', href: langPrefix || '/' },
        'Companions': { key: 'nav.companions', href: `${langPrefix}/companions` },
        'Categories': { key: 'nav.categories', href: `${langPrefix}/categories` },
        'News & Insights': { key: 'nav.news', href: `${langPrefix}/news` },
        'News': { key: 'nav.news', href: `${langPrefix}/news` },
        'Deals': { key: 'nav.deals', href: `${langPrefix}/deals` },
        'Contact': { key: 'nav.contact', href: `${langPrefix}/contact` }
    };

    // Update nav menu links
    const navLinks = document.querySelectorAll('.nav-menu li a');
    navLinks.forEach(link => {
        const originalText = link.textContent.trim();

        // Find matching nav item
        for (const [original, config] of Object.entries(navItems)) {
            if (originalText === original || originalText === window.i18n.t(config.key)) {
                // Update text with translation
                link.textContent = window.i18n.t(config.key);

                // Update href if not active page
                if (!link.classList.contains('active')) {
                    link.setAttribute('href', config.href);
                }
                break;
            }
        }
    });

    console.log(`✅ Updated navigation links for ${currentLang}`);
}

// Close menu when clicking overlay
document.addEventListener('DOMContentLoaded', function() {
    const overlay = document.querySelector('.nav-menu-overlay');
    if (overlay) {
        overlay.addEventListener('click', toggleMenu);
    }

    // Close menu when clicking a nav link
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const navMenu = document.querySelector('.nav-menu');
            if (navMenu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });
});

// Listen for i18n translations applied event
window.addEventListener('i18nTranslationsApplied', function(event) {
    console.log('i18n translations applied, updating navigation...');
    updateNavigationLinks();
});
