// Optimized Category Companions Grid Loader with Caching
class CategoryCompanions {
    constructor() {
        this.companions = [];
        this.init();
    }

    async init() {
        await this.loadCompanions();
        this.renderCompanionGrid();
        this.renderComparisonTable();
    }

    async loadCompanions() {
        try {
            // Check if data is already cached globally
            if (window.companionsCache && window.companionsCache.data) {
                console.log('Using cached companions data');
                this.companions = this.filterCompanionsByCategory(window.companionsCache.data);
                return;
            }

            // Build URL with language parameter if i18n is available
            const params = new URLSearchParams();
            if (window.i18n && window.i18n.currentLang) {
                params.append('lang', window.i18n.currentLang);
            }

            const url = `/.netlify/functions/companionguide-get${params.toString() ? '?' + params.toString() : ''}`;

            // Start loading immediately (no waiting for other scripts)
            const response = await fetch(url);
            const data = await response.json();

            if (data.companions) {
                // Cache the data globally for reuse
                window.companionsCache = {
                    data: data.companions,
                    timestamp: Date.now()
                };

                // Filter companions by current category page
                this.companions = this.filterCompanionsByCategory(data.companions);
            } else {
                console.warn('No companions data received, falling back to static data');
                this.companions = this.getStaticCompanions();
            }
        } catch (error) {
            console.error('Error loading companions:', error);
            // Fallback to static data
            this.companions = this.getStaticCompanions();
        }
    }

    filterCompanionsByCategory(companions) {
        // Get current page URL to determine category
        let currentPath = window.location.pathname;

        // Remove language prefix (/nl/ or /pt/) to get the base category path
        currentPath = currentPath.replace(/^\/(nl|pt)\//, '/');

        // Map URL paths to Airtable category values
        // For image-gen we need STRICT matching (must have image-gen tag)
        const categoryMapping = {
            '/categories/adult-content-uncensored-companions': ['nsfw', 'adult', 'uncensored'],
            '/categories/adult-image-generation-companions': ['image-gen'], // Only show companions with image-gen tag
            '/categories/ai-girlfriend-companions': ['ai-girlfriend', 'romance', 'dating'],
            '/categories/ai-boyfriend-companions': ['ai-boyfriend'],
            '/categories/ai-porn-chat-platforms': ['porn'],
            '/categories/hentai-ai-chat-platforms': ['hentai'],
            '/categories/roleplay-character-chat-companions': ['roleplaying', 'character', 'fantasy'],
            '/categories/video-companions-companions': ['video', 'visual'],
            '/categories/whatsapp-companions-companions': ['whatsapp', 'messaging'],
            '/categories/wellness-companions': ['wellness', 'therapy', 'mental-health'],
            '/categories/learning-companions': ['education', 'learning', 'productivity']
        };

        // Get categories for current page
        const pageCategories = categoryMapping[currentPath] || [];

        if (pageCategories.length === 0) {
            // If no mapping found, show all companions sorted by featured and rating
            console.warn('No category mapping found for', currentPath, 'showing all companions');
            const sorted = [...companions];
            sorted.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return (b.rating || 0) - (a.rating || 0);
            });
            return sorted;
        }

        // Filter companions that have matching categories
        const filteredCompanions = companions.filter(companion => {
            if (!companion.categories || !Array.isArray(companion.categories)) {
                return false;
            }

            // Check if companion has any of the page categories
            return companion.categories.some(companionCategory =>
                pageCategories.some(pageCategory =>
                    companionCategory.toLowerCase().includes(pageCategory.toLowerCase()) ||
                    pageCategory.toLowerCase().includes(companionCategory.toLowerCase())
                )
            );
        });

        console.log(`Found ${filteredCompanions.length} companions for categories:`, pageCategories);

        // Sort by featured first, then by rating
        filteredCompanions.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            return (b.rating || 0) - (a.rating || 0);
        });

        // Return all companions (no limit)
        return filteredCompanions;
    }

    getStaticCompanions() {
        // Fallback static data with proper feature structure
        return [
            {
                name: 'Secrets AI',
                slug: 'secrets-ai',
                rating: 4.8,
                short_description: '#1 Realistic AI girlfriend website with video generation and 100+ fantasy scenarios.',
                logo_url: '/images/logos/secrets-ai-review-companionguide.png',
                affiliate_url: 'https://www.secrets.ai/browse?fpr=companionguide',
                badges: ['Leader', 'Top Rated'],
                features: [
                    {icon: '💖', title: 'Realistic AI', description: 'Girlfriend experience'},
                    {icon: '🎭', title: '100+ Fantasies', description: 'Interactive scenarios'},
                    {icon: '🧠', title: 'Memory System', description: 'Remembers you'},
                    {icon: '🎬', title: 'Video Generation', description: 'Visual content'}
                ],
                review_count: 62,
                featured: true
            },
            {
                name: 'Hammer AI',
                slug: 'hammer-ai',
                rating: 4.7,
                short_description: 'Unlimited free AI character chat platform supporting local and cloud models.',
                logo_url: '/images/logos/hammerai.png',
                affiliate_url: 'https://gumroad.com/a/748605075/zrsof',
                badges: ['Leader', 'Featured'],
                features: [
                    {icon: '🆓', title: '100% Free', description: 'Unlimited access'},
                    {icon: '🔒', title: 'Privacy First', description: 'Local models'},
                    {icon: '🎭', title: 'Diverse Characters', description: 'Multiple categories'},
                    {icon: '✍️', title: 'Creative Tools', description: 'Story generation'}
                ],
                review_count: 44,
                featured: true
            }
        ];
    }

    generateBestFor(companion) {
        // Generate "Best For" based on companion's features and categories
        const features = companion.features || [];
        const categories = companion.categories || [];

        // Parse pricing_plans if it's a string
        let pricingPlans = [];
        if (companion.pricing_plans) {
            if (typeof companion.pricing_plans === 'string') {
                try {
                    pricingPlans = JSON.parse(companion.pricing_plans);
                } catch (e) {
                    pricingPlans = [];
                }
            } else if (Array.isArray(companion.pricing_plans)) {
                pricingPlans = companion.pricing_plans;
            }
        }

        // Check for specific features
        const hasImageGen = categories.includes('image-gen');
        const hasVideo = categories.includes('video');
        const hasVoice = features.some(f => f.title && f.title.toLowerCase().includes('voice'));
        const isFree = pricingPlans.length > 0 && pricingPlans.some(p => p.price === 0);
        const hasMemory = features.some(f => f.title && (f.title.toLowerCase().includes('memory') || f.title.toLowerCase().includes('remember')));

        // Determine best for based on features - prioritize unique combinations
        if (hasVideo && hasImageGen) return 'Multimedia lovers';
        if (hasVideo && hasVoice) return 'Immersive experiences';
        if (hasImageGen && hasVoice) return 'Multi-sensory dating';
        if (hasMemory && hasVoice) return 'Personal connections';

        // Secondary combinations
        if (hasVideo) return 'Visual experiences';
        if (hasImageGen) return 'Creative customization';
        if (hasVoice) return 'Conversational intimacy';
        if (hasMemory) return 'Long-term relationships';

        // Category-based
        if (categories.includes('nsfw') && categories.includes('roleplaying')) return 'Fantasy exploration';
        if (categories.includes('nsfw')) return 'Mature audiences';
        if (categories.includes('wellness')) return 'Emotional wellness';
        if (categories.includes('roleplaying')) return 'Story enthusiasts';
        if (categories.includes('ai-girlfriend')) return 'Romance seekers';

        // Price-based (lowest priority)
        if (isFree) return 'Budget-conscious users';

        // Fallback based on companion name/features
        if (features.length > 2) return 'Feature-rich experience';

        return 'Casual users';
    }

    getKeyFeature(companion) {
        // Extract the most prominent key feature
        const features = companion.features || [];
        const categories = companion.categories || [];

        if (features.length > 0 && features[0].title) {
            return features[0].title;
        }

        if (categories.includes('image-gen')) return 'Image generation';
        if (categories.includes('video')) return 'Video calls';
        if (categories.includes('nsfw')) return 'Uncensored chat';

        return 'AI chat';
    }

    generateStarRating(rating) {
        // Rating is stored as 0-10 in Airtable (e.g., 9.6)
        // We always show exactly 5 stars visually, rating text shows X/10
        // Simple 1:1 mapping rounded: 9.6 → 5 stars, 8.0 → 4 stars, 6.0 → 3 stars
        const stars = Math.round(rating / 2); // 9.6 → 5, 8.0 → 4, 7.0 → 4, 6.0 → 3
        const fullStars = Math.min(5, stars); // Cap at 5 stars max
        const emptyStars = 5 - fullStars;

        let starsHtml = '';

        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<span class="star-filled">★</span>';
        }

        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<span class="star-empty">☆</span>';
        }

        return starsHtml;
    }

    renderComparisonTable() {
        const tableBody = document.querySelector('.comparison-table tbody');
        if (!tableBody) {
            console.log('Comparison table tbody not found');
            return;
        }

        if (!this.companions || this.companions.length === 0) {
            console.log('No companions data available for table');
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Loading...</td></tr>';
            return;
        }

        console.log(`Rendering comparison table with ${this.companions.length} companions`);

        // Generate table rows from companions data
        const tableRows = this.companions.map(companion => {
            const pricing = this.getPricingText(companion);
            const keyFeature = this.getKeyFeature(companion);
            const bestFor = this.generateBestFor(companion);
            const slug = companion.slug || 'unknown';

            // Generate companion URL with proper language prefix
            const companionUrl = window.i18n && window.i18n.initialized
                ? window.i18n.getCompanionUrl(slug)
                : `/companions/${slug}`;

            return `
                <tr>
                    <td><strong><a href="${companionUrl}">${companion.name}</a></strong></td>
                    <td>${companion.rating.toFixed(1)}/10</td>
                    <td>${pricing}</td>
                    <td>${keyFeature}</td>
                    <td>${bestFor}</td>
                </tr>
            `;
        }).join('');

        tableBody.innerHTML = tableRows;
        console.log('Comparison table rendered successfully');
    }

    getPricingText(companion) {
        if (!companion.pricing_plans || companion.pricing_plans.length === 0) {
            return 'Free';
        }

        const plans = typeof companion.pricing_plans === 'string'
            ? JSON.parse(companion.pricing_plans)
            : companion.pricing_plans;

        const lowestPrice = Math.min(...plans.map(plan => parseFloat(plan.price || 0)));

        if (lowestPrice === 0) {
            const paidPlans = plans.filter(p => parseFloat(p.price || 0) > 0);
            if (paidPlans.length > 0) {
                const lowestPaid = Math.min(...paidPlans.map(p => parseFloat(p.price)));
                return `Free + $${lowestPaid.toFixed(2)}/month`;
            }
            return 'Free';
        }

        return `$${lowestPrice.toFixed(2)}/month`;
    }

    renderCompanionGrid() {
        const container = document.getElementById('nsfw-companions-container');
        if (!container) return;

        // Hide loading state
        const loadingState = document.getElementById('companions-loading');
        if (loadingState) {
            loadingState.style.display = 'none';
        }

        const html = this.companions.map((companion, index) => {
            const logoUrl = companion.logo_url || '/images/logos/default.png';
            const affiliateUrl = companion.affiliate_url || companion.website_url || '#';
            const rating = companion.rating || 4.0;
            const badges = companion.badges || [];
            const description = companion.short_description || companion.description || 'Premium AI companion for conversations';
            const reviewCount = companion.review_count || 0;
            const slug = companion.slug || 'unknown';

            // Generate companion URL with proper language prefix
            const companionUrl = window.i18n && window.i18n.initialized
                ? window.i18n.getCompanionUrl(slug)
                : `/companions/${slug}`;

            // Generate product badge based on badges or default ranking
            let productBadge = '';
            if (badges.includes('Leader')) {
                productBadge = `#${index + 1} Leader`;
            } else if (badges.includes('Adult')) {
                productBadge = '🔞 Adult';
            } else if (badges.includes('Popular')) {
                productBadge = '🔥 Popular';
            } else if (badges.includes('Featured')) {
                productBadge = '⭐ Featured';
            }

            // Extract features for feature highlights
            let features = companion.features || [];
            // Parse features if it's a JSON string
            if (typeof features === 'string') {
                try {
                    features = JSON.parse(features);
                } catch (e) {
                    features = [];
                }
            }
            // Ensure features is an array
            if (!Array.isArray(features)) {
                features = [];
            }

            let featureHighlights = '';
            if (features.length > 0) {
                featureHighlights = `
                    <div class="feature-highlights">
                        ${features.slice(0, 4).map(feature => {
                            const icon = feature.icon || '⭐';
                            const title = feature.title || feature;
                            const desc = feature.description || '';
                            return `
                                <div class="feature-item">
                                    <div class="feature-icon">${icon}</div>
                                    <div class="feature-title">${title}</div>
                                    <div class="feature-desc">${desc}</div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }

            // Generate pricing info
            let pricingInfo = '';
            try {
                const plans = typeof companion.pricing_plans === 'string'
                    ? JSON.parse(companion.pricing_plans)
                    : companion.pricing_plans || [];

                const freePlan = plans.find(plan => plan.price === 0);
                if (freePlan) {
                    pricingInfo = `
                        <div class="pricing-section">
                            <div class="price-main">Free trial</div>
                        </div>
                    `;
                }
            } catch (e) {
                // Silent fallback
            }

            // Generate "Best for" section
            const bestFor = companion.best_for || companion.Best_for || companion['Best for'] || this.generateBestFor(companion);
            const bestForLabel = window.i18n && window.i18n.initialized
                ? window.i18n.t('companionCard.bestFor')
                : 'Best for:';

            return `
                <article class="companion-card${companion.featured ? ' featured' : ''}">
                    ${productBadge ? `<div class="product-badge">${productBadge}</div>` : ''}
                    <div class="card-header">
                        <img src="${logoUrl}" alt="${companion.name}" class="logo" onerror="this.src='/images/logos/default.png'">
                        <div class="title-section">
                            <h3><a href="${companionUrl}">${companion.name}</a></h3>
                            <div class="rating-line">
                                <span class="stars">${this.generateStarRating(rating)}</span>
                                <span class="rating-score">${rating.toFixed(1)}/10</span>
                                ${reviewCount > 0 ? `<span class="review-count">(${reviewCount} reviews)</span>` : ''}
                            </div>
                        </div>
                    </div>
                    <p class="description">${description}</p>
                    ${featureHighlights}
                    ${pricingInfo}
                    ${bestFor ? `<div class="best-for-section">
                        <span class="best-for-label">${bestForLabel}</span> ${bestFor}
                    </div>` : ''}
                    <div class="card-actions">
                        <a href="${companionUrl}" class="btn-secondary">Read Review</a>
                        <a href="${affiliateUrl}" class="btn-primary" target="_blank" rel="noopener">Visit Website</a>
                    </div>
                </article>
            `;
        }).join('');

        container.innerHTML = html;
        container.style.display = 'grid'; // Ensure grid display
    }
}

// Initialize when DOM is loaded - optimized for speed
document.addEventListener('DOMContentLoaded', () => {
    // Start loading companions immediately, don't wait for i18n
    // i18n will auto-initialize in parallel and translations will be applied separately
    const initCompanions = async () => {
        // Quick check if i18n exists but not initialized
        if (window.i18n && !window.i18n.initialized) {
            // Don't await - let it initialize in parallel
            window.i18n.init().then(() => {
                console.log(`i18n initialized with language: ${window.i18n.currentLang}`);
            });
        }

        // Start loading companions immediately
        new CategoryCompanions();
    };

    initCompanions();
});