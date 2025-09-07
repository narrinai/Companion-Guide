// AI Companion Reviews - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load and display featured companions on homepage
    if (document.getElementById('featured-companions')) {
        loadFeaturedCompanions();
    }
});

// Load featured companions from JSON data
async function loadFeaturedCompanions() {
    try {
        const response = await fetch('/data/companions.json');
        const data = await response.json();
        
        // Get top 6 companions by rating
        const featured = data.companions
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6);
        
        displayFeaturedCompanions(featured);
    } catch (error) {
        console.error('Error loading companions:', error);
    }
}

// Display featured companions on homepage
function displayFeaturedCompanions(companions) {
    const container = document.getElementById('featured-companions');
    if (!container) return;
    
    const html = companions.map(companion => `
        <div class="companion-card">
            <img src="${companion.logo}" alt="${companion.name} logo" class="logo">
            <div class="content">
                <h3><a href="/companions/${companion.id}.html">${companion.name}</a></h3>
                <div class="rating">${'★'.repeat(Math.floor(companion.rating))}${'☆'.repeat(5-Math.floor(companion.rating))} ${companion.rating}/5</div>
                <p>${companion.description}</p>
                <div class="features">
                    ${companion.features.slice(0, 3).map(feature => `<span>${feature}</span>`).join('')}
                </div>
                <div class="pricing">${companion.pricing}</div>
                <a href="${companion.website}" class="cta-button" target="_blank">Try ${companion.name} →</a>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = html;
}

// Search functionality (for future implementation)
function searchCompanions(query) {
    // This will be implemented when search is added
    console.log('Searching for:', query);
}

// Track clicks for analytics (basic implementation)
function trackClick(companionName, action = 'click') {
    // Simple tracking - can be enhanced with analytics service
    console.log(`Tracked: ${companionName} - ${action}`);
    
    // Example: Send to analytics service
    // analytics.track('companion_click', {
    //     companion: companionName,
    //     action: action,
    //     timestamp: new Date().toISOString()
    // });
}

// Add click tracking to all companion links
document.addEventListener('click', function(e) {
    const link = e.target.closest('a[href*="companions/"], a[href*="character.ai"], a[href*="replika.ai"], a[href*="janitorai.com"]');
    if (link) {
        const companionName = link.textContent.includes('→') 
            ? link.textContent.replace(' →', '').replace('Try ', '')
            : link.textContent;
        trackClick(companionName, 'external_link');
    }
});

// Smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add loading states for external links
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', function() {
        const originalText = this.textContent;
        this.textContent = 'Opening...';
        setTimeout(() => {
            this.textContent = originalText;
        }, 2000);
    });
});

// Mobile hamburger menu toggle
function toggleMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
}

// Utility function to format ratings
function formatRating(rating) {
    const stars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let output = '★'.repeat(stars);
    if (hasHalfStar) output += '½';
    output += '☆'.repeat(5 - stars - (hasHalfStar ? 1 : 0));
    return `${output} ${rating}/5`;
}

// Lazy loading for images (performance optimization)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Review form character counter
document.addEventListener('DOMContentLoaded', function() {
    const reviewTextarea = document.getElementById('review-text');
    const charCounter = document.querySelector('.char-counter .current');
    
    if (reviewTextarea && charCounter) {
        reviewTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            charCounter.textContent = currentLength;
            
            // Change color based on character count
            if (currentLength > 800) {
                charCounter.style.color = 'var(--accent-red)';
            } else if (currentLength > 600) {
                charCounter.style.color = 'var(--accent-orange)';
            } else {
                charCounter.style.color = 'var(--text-muted)';
            }
        });
    }
    
    // Review form submission handler
    const reviewForm = document.querySelector('.review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            const submitBtn = this.querySelector('.submit-review-btn');
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            // Re-enable after 3 seconds (in case of errors)
            setTimeout(() => {
                submitBtn.textContent = 'Submit Review for Approval';
                submitBtn.disabled = false;
            }, 3000);
        });
    }
});