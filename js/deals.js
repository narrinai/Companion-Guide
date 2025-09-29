// Dynamic Deals System
class DealsManager {
    constructor() {
        this.deals = [
            {
                id: 'nectar-ai',
                name: 'Nectar AI',
                logo: '/images/logos/nectar-ai.png',
                rating: '4.4',
                reviewCount: '36',
                badge: '🔥 50% OFF',
                description: 'Save 50% on Nectar AI\'s premium AI chat platform! Create your perfect AI chat companion with advanced personality crafting, romantic AI chat interactions, and engaging conversations. Experience unlimited AI chat with customizable companions.',
                features: [
                    { icon: '💕', title: 'Romantic Chat', desc: 'AI chat love' },
                    { icon: '🎭', title: 'Customizable', desc: 'Personality traits' },
                    { icon: '🎨', title: 'Image Gen', desc: 'Visual content' },
                    { icon: '🎤', title: 'Voice Chat', desc: 'AI audio chat' }
                ],
                pricing: {
                    originalPrice: '$14.99/month',
                    salePrice: '$7.49/month',
                    billingNote: '(billed annually)'
                },
                links: {
                    review: '/companions/nectar-ai',
                    affiliate: 'https://trynectar.ai/?utm_source=affiliate&utm_medium=referral&utm_campaign=companionguide'
                },
                featured: true
            },
            {
                id: 'ourdream-ai',
                name: 'OurDream AI',
                logo: '/images/logos/ourdream-ai.png',
                rating: '4.3',
                reviewCount: '6',
                badge: '🍂 50% OFF',
                description: '🍂 Fall Sale Special! Save 50% on OurDream AI\'s premium AI companion playground. Create unlimited AI characters, chat, generate images & videos with your personalized AI companions. More Chars • More Chat • More Pics!',
                features: [
                    { icon: '🎭', title: 'Character Creation', desc: 'Unlimited AI companions' },
                    { icon: '💬', title: 'Unlimited Chat', desc: '+1,000 DreamCoins' },
                    { icon: '🎨', title: 'Image & Video', desc: 'AI multimedia gen' },
                    { icon: '🔒', title: 'Discreet Billing', desc: 'No adult transaction' }
                ],
                pricing: {
                    originalPrice: 'was $39.99/month',
                    salePrice: '$19.99/month',
                    billingNote: '(50% off monthly • 75% off yearly)'
                },
                links: {
                    review: '/companions/ourdream-ai',
                    affiliate: 'https://t.mbsrv2.com/388589/7710?popUnder=true&source=companionguide&aff_sub5=SF_006OG000004lmDN'
                },
                featured: true
            }
        ];
        this.init();
    }

    init() {
        this.renderDeals();
        this.attachEventListeners();
    }

    renderDeals() {
        const dealsContainer = document.querySelector('.deals-container');
        if (!dealsContainer) return;

        dealsContainer.innerHTML = '';

        this.deals.forEach(deal => {
            const dealCard = this.createDealCard(deal);
            dealsContainer.appendChild(dealCard);
        });
    }

    createDealCard(deal) {
        const article = document.createElement('article');
        article.className = `deal-card${deal.featured ? ' featured' : ''}`;
        article.setAttribute('data-deal-id', deal.id);

        article.innerHTML = `
            <div class="deal-badge">${deal.badge}</div>

            <div class="deal-header">
                <img src="${deal.logo}" alt="${deal.name} - AI companion platform special offer logo" class="deal-logo">
                <div class="deal-info">
                    <h3 class="deal-title"><a href="${deal.links.review}" style="color: inherit; text-decoration: none;">${deal.name}</a></h3>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span style="color: #ffa500;">★★★★${deal.rating >= 4.5 ? '★' : '☆'}</span>
                        <span style="color: #fff; font-size: 0.95rem;">${deal.rating}/5</span>
                        <span style="color: #666; font-size: 0.9rem;">(${deal.reviewCount} reviews)</span>
                    </div>
                </div>
            </div>

            <p class="deal-description">${deal.description}</p>

            <div class="deal-features">
                ${deal.features.map(feature => `
                    <div class="deal-feature-item">
                        <div class="deal-feature-icon">${feature.icon}</div>
                        <div class="deal-feature-title">${feature.title}</div>
                        <div class="deal-feature-desc">${feature.desc}</div>
                    </div>
                `).join('')}
            </div>

            <div style="margin: 1.5rem 0; padding: 1rem; background: #2a2a2a; border-radius: 8px;">
                <div style="color: #4a9eff; font-size: 0.85rem; margin-bottom: 0.5rem;">${deal.badge} - LIMITED TIME</div>
                <div style="display: flex; align-items: baseline; gap: 1rem;">
                    <span style="text-decoration: line-through; color: #666;">${deal.pricing.originalPrice}</span>
                    <span style="color: #4a9eff; font-size: 1.3rem; font-weight: 600;">${deal.pricing.salePrice}</span>
                    <span style="color: #666; font-size: 0.85rem;">${deal.pricing.billingNote}</span>
                </div>
                ${deal.id === 'ourdream-ai' ? '<div style="color: #666; font-size: 0.85rem; margin-top: 0.5rem;">Cancel anytime • No adult transaction in bank statement</div>' : ''}
            </div>

            <div class="deal-cta">
                <div style="display: flex; gap: 1rem;">
                    <a href="${deal.links.review}" class="deal-button btn-secondary" style="background: #333;">Read Review</a>
                    <a href="${deal.links.affiliate}" class="deal-button" target="_blank">
                        ${deal.id === 'ourdream-ai' ? 'Subscribe Now' : 'Claim Deal'}
                    </a>
                </div>
            </div>
        `;

        return article;
    }

    attachEventListeners() {
        // Track deal clicks for analytics
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('deal-button')) {
                const dealCard = e.target.closest('.deal-card');
                if (dealCard) {
                    const dealId = dealCard.getAttribute('data-deal-id');
                    this.trackDealClick(dealId, e.target.textContent.trim());
                }
            }
        });

        // Add hover effects
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('deal-card')) {
                this.animateDealCard(e.target, 'enter');
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('deal-card')) {
                this.animateDealCard(e.target, 'leave');
            }
        }, true);
    }

    trackDealClick(dealId, buttonText) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'deal_click', {
                'deal_id': dealId,
                'button_text': buttonText,
                'event_category': 'deals'
            });
        }

        // Facebook Pixel tracking
        if (typeof fbq !== 'undefined') {
            fbq('track', 'Lead', {
                content_name: dealId,
                content_category: 'deal'
            });
        }
    }

    animateDealCard(card, action) {
        if (action === 'enter') {
            card.style.transform = 'translateY(-4px)';
            card.style.boxShadow = '0 20px 40px rgba(0,0,0,0.3)';
        } else {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '';
        }
    }

    // Method to add new deals programmatically
    addDeal(dealData) {
        this.deals.push(dealData);
        this.renderDeals();
    }

    // Method to update existing deal
    updateDeal(dealId, updates) {
        const dealIndex = this.deals.findIndex(deal => deal.id === dealId);
        if (dealIndex !== -1) {
            this.deals[dealIndex] = { ...this.deals[dealIndex], ...updates };
            this.renderDeals();
        }
    }

    // Method to remove deal
    removeDeal(dealId) {
        this.deals = this.deals.filter(deal => deal.id !== dealId);
        this.renderDeals();
    }
}

// Initialize deals manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.deals-container')) {
        window.dealsManager = new DealsManager();
    }
});

// Expose methods for external use
window.DealsAPI = {
    addDeal: (dealData) => window.dealsManager?.addDeal(dealData),
    updateDeal: (dealId, updates) => window.dealsManager?.updateDeal(dealId, updates),
    removeDeal: (dealId) => window.dealsManager?.removeDeal(dealId),
    getDeal: (dealId) => window.dealsManager?.deals.find(deal => deal.id === dealId),
    getAllDeals: () => window.dealsManager?.deals || []
};