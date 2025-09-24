// AI Companion Reviews - Main JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Load and display featured companions on homepage
    if (document.getElementById('featured-companions')) {
        loadFeaturedCompanions();
    }

    // Load and display featured companions on news page
    if (document.getElementById('news-featured-companions')) {
        loadNewsFeaturedCompanions();
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

// Load featured companions for news page from Airtable
async function loadNewsFeaturedCompanions() {
    try {
        const response = await fetch('/.netlify/functions/get-companions');
        const data = await response.json();

        // Get only companions that are marked as featured in Airtable
        const featured = data.companions
            .filter(c => c.featured === true)
            .sort((a, b) => b.rating - a.rating);

        displayNewsFeaturedCompanions(featured);
    } catch (error) {
        console.error('Error loading companions:', error);
        // Fallback to show error message
        const container = document.getElementById('news-featured-companions');
        if (container) {
            container.innerHTML = '<p>Unable to load featured companions at this time.</p>';
        }
    }
}

// Display featured companions on news page
function displayNewsFeaturedCompanions(companions) {
    const container = document.getElementById('news-featured-companions');
    if (!container) return;

    const html = companions.map((companion, index) => {
        const features = companion.features || [];
        const pricingPlans = typeof companion.pricing_plans === 'string'
            ? JSON.parse(companion.pricing_plans)
            : companion.pricing_plans || [];
        const freePlan = pricingPlans.find(p => p.price === 0);
        const paidPlan = pricingPlans.find(p => p.price > 0);

        const pricingText = freePlan && paidPlan
            ? `Free`
            : paidPlan
            ? `$${paidPlan.price}${paidPlan.period ? '/' + paidPlan.period.replace('ly', '') : ''}`
            : 'Contact for Pricing';

        const pricingNote = freePlan && paidPlan
            ? `Premium $${paidPlan.price}${paidPlan.period ? '/' + paidPlan.period.replace('ly', '') : ''}`
            : '';

        const getBadge = (idx) => {
            switch(idx) {
                case 0: return '🏆 Top Rated';
                case 1: return '🏆 Leader';
                case 2: return '⚡ Popular';
                case 3: return '🌟 Featured';
                default: return '';
            }
        };

        const badge = getBadge(index);
        const featuredClass = index < 4 ? 'featured' : '';

        return `
            <article class="companion-card ${featuredClass}">
                ${badge ? `<div class="product-badge">${badge}</div>` : ''}
                <div class="card-header">
                    <img src="${companion.logo_url}" alt="${companion.name}" class="logo">
                    <div class="title-section">
                        <h3><a href="/companions/${companion.slug}">${companion.name}</a></h3>
                        <div class="rating-line">
                            <span class="stars">${'★'.repeat(Math.floor(companion.rating))}${'☆'.repeat(5-Math.floor(companion.rating))}</span>
                            <span class="rating-score">${companion.rating}/5</span>
                            <span class="review-count">(${companion.review_count || 0} reviews)</span>
                        </div>
                    </div>
                </div>
                <p class="description">${companion.description}</p>

                <div class="feature-highlights">
                    ${features.slice(0, 4).map(feature => `
                        <div class="feature-item">
                            <div class="feature-icon">${feature.icon}</div>
                            <div class="feature-title">${feature.title}</div>
                            <div class="feature-desc">${feature.description}</div>
                        </div>
                    `).join('')}
                </div>

                <div class="pricing-section">
                    <div class="price-main">${pricingText}</div>
                    ${pricingNote ? `<div class="price-note">${pricingNote}</div>` : ''}
                </div>

                <div class="card-actions">
                    <a href="/companions/${companion.slug}" class="btn-primary">Read Review</a>
                    <a href="${companion.website_url}" class="btn-secondary" target="_blank">Visit Website</a>
                </div>
            </article>
        `;
    }).join('');

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