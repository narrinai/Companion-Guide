// Simple Cookie Banner - Non-intrusive, no data storage
(function() {
    // Check if user has already accepted
    if (localStorage.getItem('cookieAccepted')) {
        return; // Don't show banner
    }

    // Create banner HTML
    const banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML = `
        <div class="cookie-banner-content">
            <strong>We use cookies</strong>
            We use analytics to improve your experience.
        </div>
        <button class="cookie-banner-close" aria-label="Accept cookies">OK</button>
    `;

    // Add to page
    document.body.appendChild(banner);

    // Show banner with animation
    setTimeout(() => {
        banner.classList.add('show');
    }, 500);

    // Close button handler
    const closeBtn = banner.querySelector('.cookie-banner-close');
    closeBtn.addEventListener('click', () => {
        banner.classList.remove('show');
        setTimeout(() => {
            banner.remove();
        }, 300);
        // Remember that user accepted
        localStorage.setItem('cookieAccepted', 'true');
    });
})();
