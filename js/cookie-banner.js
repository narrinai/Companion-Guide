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
        <div class="cookie-banner-actions">
            <a href="#" class="cookie-banner-reject">Reject</a>
            <button class="cookie-banner-close" aria-label="Accept cookies">OK</button>
        </div>
    `;

    // Add to page
    document.body.appendChild(banner);

    // Show banner with animation
    setTimeout(() => {
        banner.classList.add('show');
    }, 500);

    // Accept button handler
    const closeBtn = banner.querySelector('.cookie-banner-close');
    closeBtn.addEventListener('click', () => {
        banner.classList.remove('show');
        setTimeout(() => {
            banner.remove();
        }, 300);
        // Remember that user accepted
        localStorage.setItem('cookieAccepted', 'true');
    });

    // Reject button handler
    const rejectBtn = banner.querySelector('.cookie-banner-reject');
    rejectBtn.addEventListener('click', (e) => {
        e.preventDefault();
        banner.classList.remove('show');
        setTimeout(() => {
            banner.remove();
        }, 300);
        // Remember that user rejected (also prevents banner from showing again)
        localStorage.setItem('cookieAccepted', 'rejected');
    });
})();
