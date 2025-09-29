// Dynamic Deals System
class DealsManager {
    constructor() {
        this.deals = [
            {
                companionId: 'nectar-ai',
                badge: '🔥 50% OFF',
                discountPercentage: 50,
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
                affiliate: 'https://trynectar.ai/?utm_source=affiliate&utm_medium=referral&utm_campaign=companionguide',
                featured: true,
                cta: 'Claim Deal'
            },
            {
                companionId: 'ourdream-ai',
                badge: '🍂 50% OFF',
                discountPercentage: 50,
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
                affiliate: 'https://t.mbsrv2.com/388589/7710?popUnder=true&source=companionguide&aff_sub5=SF_006OG000004lmDN',
                featured: true,
                cta: 'Subscribe Now'
            }
        ];
        this.companionsData = new Map();
        this.init();
    }

    async init() {
        await this.loadCompanionData();
        this.renderDeals();
        this.attachEventListeners();
    }

    async loadCompanionData() {
        // Wait for companionManager to be available
        if (typeof window.companionManager === 'undefined') {
            await this.waitForCompanionManager();
        }

        try {
            // Check if fetchCompanionById method exists
            if (!window.companionManager || typeof window.companionManager.fetchCompanionById !== 'function') {
                console.warn('fetchCompanionById method not available, using fallback data');
                return;
            }

            // Fetch companion data for each deal
            for (const deal of this.deals) {
                try {
                    // Try different variations of the companion ID
                    const companionIds = [
                        deal.companionId,
                        deal.companionId.replace('-', ''),
                        deal.companionId.replace('-ai', ''),
                        deal.companionId.replace('-', ' '),
                        deal.companionId.charAt(0).toUpperCase() + deal.companionId.slice(1)
                    ];

                    let companionData = null;
                    for (const id of companionIds) {
                        try {
                            companionData = await window.companionManager.fetchCompanionById(id);
                            if (companionData) break;
                        } catch (e) {
                            // Try next variation
                            continue;
                        }
                    }

                    if (companionData) {
                        this.companionsData.set(deal.companionId, companionData);
                        console.log(`Loaded data for ${deal.companionId}:`, companionData);
                    } else {
                        console.warn(`No data found for companion: ${deal.companionId} (tried variations: ${companionIds.join(', ')})`);

                        // Try to get all companions to see what's available
                        const allCompanions = await window.companionManager.fetchCompanions();
                        console.log('Available companions:', allCompanions.map(c => ({ id: c.id, slug: c.slug, name: c.name })));
                    }
                } catch (companionError) {
                    console.error(`Error fetching companion ${deal.companionId}:`, companionError);
                }
            }
        } catch (error) {
            console.error('Error loading companion data for deals:', error);
        }
    }

    async waitForCompanionManager() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (typeof window.companionManager !== 'undefined') {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);

            // Timeout after 5 seconds
            setTimeout(() => {
                clearInterval(checkInterval);
                resolve();
            }, 5000);
        });
    }

    renderDeals() {
        const dealsContainer = document.querySelector('.deals-container');
        if (!dealsContainer) return;

        dealsContainer.innerHTML = '';

        // Sort deals by discount percentage (descending), then by review score (descending)
        const sortedDeals = [...this.deals].sort((a, b) => {
            // First sort by discount percentage (higher discounts first)
            const discountDiff = (b.discountPercentage || 0) - (a.discountPercentage || 0);
            if (discountDiff !== 0) return discountDiff;

            // If discount is equal, sort by review score (higher ratings first)
            const aCompanionData = this.companionsData.get(a.companionId);
            const bCompanionData = this.companionsData.get(b.companionId);

            const aRating = parseFloat(aCompanionData?.rating || aCompanionData?.['Rating'] || '0');
            const bRating = parseFloat(bCompanionData?.rating || bCompanionData?.['Rating'] || '0');

            return bRating - aRating;
        });

        sortedDeals.forEach(deal => {
            const companionData = this.companionsData.get(deal.companionId);
            const dealCard = this.createDealCard(deal, companionData);
            dealsContainer.appendChild(dealCard);
        });
    }

    createDealCard(deal, companionData) {
        const article = document.createElement('article');
        article.className = `deal-card${deal.featured ? ' featured' : ''}`;
        article.setAttribute('data-deal-id', deal.companionId);

        // Use dynamic data if available, fallback to static data
        const name = companionData?.name || companionData?.['Name'] || deal.companionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
        const logo = companionData?.logo || companionData?.['Logo'] || `/images/logos/${deal.companionId}.png`;
        const rating = companionData?.rating || companionData?.['Rating'] || '4.0';
        const reviewCount = companionData?.review_count || companionData?.reviewCount || companionData?.['Review Count'] || companionData?.['review_count'] || '0';
        const reviewLink = `/companions/${deal.companionId}`;

        // Debug log to see what data we're getting
        if (companionData) {
            console.log(`Companion data for ${deal.companionId}:`, {
                name: name,
                logo: logo,
                rating: rating,
                reviewCount: reviewCount,
                review_count_field: companionData?.review_count,
                rawData: companionData
            });
        }

        // Generate star rating display
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        const starDisplay = '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars);

        article.innerHTML = `
            <div class="deal-badge">${deal.badge}</div>

            <div class="deal-header">
                <img src="${logo}" alt="${name} - AI companion platform special offer logo" class="deal-logo">
                <div class="deal-info">
                    <h3 class="deal-title"><a href="${reviewLink}" style="color: inherit; text-decoration: none;">${name}</a></h3>
                    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
                        <span style="color: #ffa500;">${starDisplay}</span>
                        <span style="color: #fff; font-size: 0.95rem;">${rating}/5</span>
                        <span style="color: #666; font-size: 0.9rem;">(${reviewCount} reviews)</span>
                    </div>
                </div>
            </div>

            <p class="deal-description">${deal.description}</p>

            <div style="margin: 1.5rem 0; padding: 1rem; background: #2a2a2a; border-radius: 8px;">
                <div style="color: #4a9eff; font-size: 0.85rem; margin-bottom: 0.5rem;">${deal.badge} - LIMITED TIME</div>
                <div style="display: flex; align-items: baseline; gap: 1rem;">
                    <span style="text-decoration: line-through; color: #666;">${deal.pricing.originalPrice}</span>
                    <span style="color: #4a9eff; font-size: 1.3rem; font-weight: 600;">${deal.pricing.salePrice}</span>
                    <span style="color: #666; font-size: 0.85rem;">${deal.pricing.billingNote}</span>
                </div>
                ${deal.companionId === 'ourdream-ai' ? '<div style="color: #666; font-size: 0.85rem; margin-top: 0.5rem;">Cancel anytime • No adult transaction in bank statement</div>' : ''}
            </div>

            <div class="deal-features">
                ${deal.features.map(feature => `
                    <div class="deal-feature-item">
                        <div class="deal-feature-icon">${feature.icon}</div>
                        <div class="deal-feature-title">${feature.title}</div>
                        <div class="deal-feature-desc">${feature.desc}</div>
                    </div>
                `).join('')}
            </div>

            <div class="deal-cta">
                <div style="display: flex; gap: 1rem;">
                    <a href="${reviewLink}" class="deal-button btn-secondary" style="background: #333;">Read Review</a>
                    <a href="${deal.affiliate}" class="deal-button" target="_blank">
                        ${deal.cta}
                    </a>
                </div>
            </div>
        `;

        return article;
    }

    attachEventListeners() {
        // Track deal clicks for analytics
        document.addEventListener('click', (e) => {
            if (e.target && e.target.classList && e.target.classList.contains('deal-button')) {
                const dealCard = e.target.closest('.deal-card');
                if (dealCard) {
                    const dealId = dealCard.getAttribute('data-deal-id');
                    this.trackDealClick(dealId, e.target.textContent.trim());
                }
            }
        });

        // Add hover effects
        document.addEventListener('mouseenter', (e) => {
            if (e.target && e.target.classList && e.target.classList.contains('deal-card')) {
                this.animateDealCard(e.target, 'enter');
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target && e.target.classList && e.target.classList.contains('deal-card')) {
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
document.addEventListener('DOMContentLoaded', async () => {
    if (document.querySelector('.deals-container')) {
        // Initialize companion manager first if it doesn't exist
        if (typeof window.companionManager === 'undefined') {
            window.companionManager = new CompanionManager();
        }

        // Then initialize deals manager
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