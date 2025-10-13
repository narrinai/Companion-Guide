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
