// Companion Page Dynamic Content Manager
class CompanionPageManager {
    constructor() {
        this.companionId = this.extractCompanionIdFromUrl();
        this.companionData = null;
        // A/B test: read variant from cookie set by Edge Function
        this.useVariantB = this.getABVariantFromCookie() === 'B';
        this.init();
    }

    /**
     * Get A/B variant from cookie (set by Edge Function)
     * Returns 'A' or 'B'
     */
    getABVariantFromCookie() {
        const match = document.cookie.match(/ab_variant=([AB])/);
        return match ? match[1] : 'A';
    }

    /**
     * Get the active external URL for A/B testing
     * If website_url_2 exists and variant B is selected, use it
     * Otherwise always use website_url
     */
    getActiveExternalUrl() {
        if (!this.companionData) return '#';

        const hasVariantB = this.companionData.website_url_2 && this.companionData.website_url_2.trim() !== '';
        const isVariantB = hasVariantB && this.useVariantB;

        return isVariantB
            ? this.companionData.website_url_2
            : (this.companionData.website_url || '#');
    }

    extractCompanionIdFromUrl() {
        // Extract companion ID from URL path like /companions/ourdream-ai
        const path = window.location.pathname;
        const matches = path.match(/\/companions\/([^\/]+)/);
        return matches ? matches[1] : null;
    }

    async init() {
        if (!this.companionId) {
            console.warn('No companion ID found in URL');
            return;
        }

        // Wait for companion manager to be available
        await this.waitForCompanionManager();

        // Load companion data
        await this.loadCompanionData();

        // Update page elements
        this.updatePageContent();

        // Update pricing if available
        this.updatePricing();

        // Load and update translated content (including features) for all languages
        await this.loadAndUpdateTranslations();

        // Render features from Airtable (after translations are loaded)
        this.renderFeatures();

        // Update quick-facts with hero_specs from Airtable (PT/NL)
        this.updateQuickFactsFromHeroSpecs();

        // Protect quick-facts paragraphs from translation
        this.protectFactContent();

        // Render image gallery if available
        this.renderGallery();

        // Translate CTA section (wait for i18n to be ready)
        if (window.i18n && window.i18n.initialized) {
            this.translateCTASection();
        } else {
            // Listen for i18n event
            window.addEventListener('i18nTranslationsApplied', () => {
                this.translateCTASection();
            }, { once: true });
        }
    }

    /**
     * Update quick-facts paragraphs with hero_specs from Airtable
     * Runs on all pages including English
     */
    updateQuickFactsFromHeroSpecs() {
        // Check if companion data has hero_specs
        if (!this.companionData || !this.companionData.hero_specs) {
            console.log('⚠️ No hero_specs available');
            return;
        }

        try {
            // Parse hero_specs (comes as JSON string from Airtable)
            let heroSpecs;
            if (typeof this.companionData.hero_specs === 'string') {
                heroSpecs = JSON.parse(this.companionData.hero_specs);
            } else {
                heroSpecs = this.companionData.hero_specs;
            }

            console.log('📊 Updating quick-facts with hero_specs:', heroSpecs);

            // Update each fact paragraph based on its header
            const facts = document.querySelectorAll('.quick-facts .fact');
            facts.forEach(fact => {
                const header = fact.querySelector('h3');
                const paragraph = fact.querySelector('p');

                if (!header || !paragraph) return;

                const headerKey = header.getAttribute('data-i18n');

                // Map data-i18n keys to hero_specs keys
                let heroSpecKey = null;
                if (headerKey === 'companion.pricingLabel') {
                    heroSpecKey = 'pricing';
                } else if (headerKey === 'companion.bestForLabel') {
                    heroSpecKey = 'best_for';
                } else if (headerKey === 'companion.platformLabel') {
                    heroSpecKey = 'platform';
                } else if (headerKey === 'companion.contentPolicyLabel') {
                    heroSpecKey = 'content_policy';
                }

                // Update paragraph with translated text if available
                if (heroSpecKey && heroSpecs[heroSpecKey]) {
                    paragraph.textContent = heroSpecs[heroSpecKey];
                    console.log(`✅ Updated ${heroSpecKey}: ${heroSpecs[heroSpecKey]}`);
                }
            });

        } catch (error) {
            console.error('❌ Error parsing hero_specs:', error);
        }
    }

    /**
     * Protect quick-facts paragraph content from translation by i18n
     * After updateQuickFactsFromHeroSpecs() has set the content
     */
    protectFactContent() {
        const factParagraphs = document.querySelectorAll('.quick-facts .fact p');

        // Store current content (from hero_specs or original English)
        const originalContent = new Map();
        factParagraphs.forEach(p => {
            originalContent.set(p, p.textContent.trim());
        });

        // Use MutationObserver to watch for changes and restore content
        const observer = new MutationObserver(() => {
            factParagraphs.forEach(p => {
                const original = originalContent.get(p);
                if (original && p.textContent.trim() !== original) {
                    p.textContent = original;
                    console.log('✅ Protected fact content from unwanted changes');
                }
            });
        });

        // Observe each paragraph for text changes
        factParagraphs.forEach(p => {
            observer.observe(p, { childList: true, characterData: true, subtree: true });
        });

        console.log(`🛡️ Protected ${factParagraphs.length} fact paragraphs`);
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

    async loadCompanionData() {
        try {
            // Initialize companion manager if not already done
            if (typeof window.companionManager === 'undefined') {
                window.companionManager = new CompanionManager();
            }

            // Check if fetchCompanionById method exists
            if (typeof window.companionManager.fetchCompanionById !== 'function') {
                console.warn('fetchCompanionById method not available');
                return;
            }

            // Try different variations of the companion ID
            const companionIds = [
                this.companionId,
                this.companionId.replace('-', ''),
                this.companionId.replace('-ai', ''),
                this.companionId.replace('-', ' '),
                this.companionId.charAt(0).toUpperCase() + this.companionId.slice(1)
            ];

            for (const id of companionIds) {
                try {
                    this.companionData = await window.companionManager.fetchCompanionById(id);
                    if (this.companionData) {
                        console.log(`Loaded companion data for ${this.companionId}:`, this.companionData);
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }

            if (!this.companionData) {
                console.warn(`No companion data found for ${this.companionId}`);
                // Try to get all companions to debug
                const allCompanions = await window.companionManager.fetchCompanions();
                console.log('Available companions:', allCompanions.map(c => ({ id: c.id, slug: c.slug, name: c.name })));
            }

        } catch (error) {
            console.error('Error loading companion data:', error);
        }
    }

    updatePageContent() {
        if (!this.companionData) {
            console.warn('No companion data available for page updates');
            return;
        }

        // Update page title with dynamic name + Review
        this.updatePageTitle();

        // Update hero section
        this.updateHeroSection();

        // Update rating if available
        this.updateRating();

        // Update meta tags
        this.updateMetaTags();

        // Update all external links with website_url from Airtable
        this.updateExternalLinks();

        // Update structured data schema with website_url
        this.updateStructuredData();
    }

    updatePageTitle() {
        const companionName = this.getCompanionName();
        const reviewTitle = `${companionName} Review`;

        // Update main H1 title (exclude header H1)
        const heroTitle = document.querySelector('.companion-hero h1, .hero-title, main h1, .hero h1');
        if (heroTitle) {
            heroTitle.textContent = reviewTitle;
        }

        // Update document title
        document.title = `${reviewTitle} 2025 - ${document.title.split(' - ').slice(1).join(' - ')}`;
    }

    updateHeroSection() {
        const companionName = this.getCompanionName();

        // Update logo - check multiple possible field names
        const logo = document.querySelector('.companion-logo, .hero img');
        const logoUrl = this.companionData.logo_url || this.companionData.logo || this.companionData['logo_url'];
        if (logo && logoUrl) {
            logo.src = logoUrl;
            logo.alt = `${companionName} logo`;
        }

        // Update tagline from Airtable if available
        const taglineElement = document.querySelector('.companion-hero .tagline, .hero-text .tagline, .tagline');
        const tagline = this.companionData.tagline || this.companionData.short_description;
        if (taglineElement && tagline) {
            taglineElement.textContent = tagline;
        }

        // Update any "What is [Platform]?" headings with multi-language support
        const whatIsHeading = document.querySelector('h2[data-i18n="companion.whatIs"], .overview h2');
        if (whatIsHeading) {
            // Skip if heading already has correct format AND companion name (not {name} placeholder)
            const currentText = whatIsHeading.textContent.trim();
            const hasCorrectFormat = currentText.includes(companionName) &&
                                    !currentText.includes('{name}') &&
                                    (currentText.startsWith('What is') ||
                                     currentText.startsWith('Wat is') ||
                                     currentText.startsWith('Was ist') ||
                                     currentText.startsWith('O que é'));

            if (hasCorrectFormat) {
                return; // i18n.js already handled this
            }

            // Detect language from URL
            const path = window.location.pathname;
            const langMatch = path.match(/^\/(pt|nl|de)\//);

            if (langMatch) {
                const lang = langMatch[1];
                // Use translated "What is" text
                if (lang === 'nl') {
                    whatIsHeading.textContent = `Wat is ${companionName}?`;
                } else if (lang === 'pt') {
                    whatIsHeading.textContent = `O que é ${companionName}?`;
                } else if (lang === 'de') {
                    whatIsHeading.textContent = `Was ist ${companionName}?`;
                }
            } else {
                // English
                whatIsHeading.textContent = `What is ${companionName}?`;
            }
        }
    }

    updateRating() {
        if (!this.companionData.rating) return;

        const ratingElement = document.querySelector('.rating');
        if (ratingElement) {
            const rating = parseFloat(this.companionData.rating);
            // Rating is 0-10 in Airtable, show as 5 stars max
            // 9.6 → 5 stars, 8.0 → 4 stars, etc.
            const stars = Math.round(rating / 2);
            const fullStars = Math.min(5, stars);
            const emptyStars = 5 - fullStars;

            const starDisplay = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
            ratingElement.textContent = `${starDisplay} ${rating}/10`;
        }
    }

    updateMetaTags() {
        const companionName = this.getCompanionName();
        const reviewTitle = `${companionName} Review`;

        // Update meta title
        const metaTitle = document.querySelector('meta[property="og:title"], meta[name="twitter:title"]');
        if (metaTitle) {
            metaTitle.setAttribute('content', `${reviewTitle} 2025 - AI Companion Platform`);
        }

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"], meta[property="og:description"]');
        if (metaDesc && this.companionData.description) {
            const description = `In-depth ${reviewTitle} covering features, pricing, and capabilities. ${this.companionData.description}`;
            metaDesc.setAttribute('content', description);
        }
    }

    updatePricing() {
        if (!this.companionData?.pricing_plans) {
            // No dynamic pricing data - add CTA buttons to existing static pricing tiers
            this.addCtaToStaticPricing();
            return;
        }

        let pricingPlans = this.companionData.pricing_plans;

        // If pricing_plans is a string, try to parse it as JSON
        if (typeof pricingPlans === 'string') {
            try {
                // Clean up the JSON string - remove line breaks and extra spaces
                const cleanedJson = pricingPlans.replace(/\n\s*/g, '').trim();
                pricingPlans = JSON.parse(cleanedJson);
            } catch (e) {
                console.warn('Failed to parse pricing_plans JSON:', e);
                return;
            }
        }

        if (!Array.isArray(pricingPlans) || pricingPlans.length === 0) return;

        console.log('Updating pricing with data:', pricingPlans);

        // Find the pricing section
        const pricingSection = document.querySelector('.pricing .pricing-grid');
        if (!pricingSection) return;

        // Clear existing pricing tiers
        pricingSection.innerHTML = '';

        // Detect currency - default to $ unless specified
        const companionCurrency = this.companionData.currency || '$';
        const usesEuro = companionCurrency === '€' || companionCurrency === 'EUR';

        // Generate pricing tiers from Airtable data
        pricingPlans.forEach((plan, index) => {
            const tierDiv = document.createElement('div');
            tierDiv.className = 'pricing-tier';

            // Handle both numeric prices and "Free" string
            const isFree = plan.price === 0 || plan.price === 'Free' || plan.price === 'free';
            // Use plan currency if specified, otherwise use companion default
            const planCurrency = plan.currency || (usesEuro ? '€' : '$');
            const price = isFree ? 'Free' : `${planCurrency}${plan.price}`;

            // Translate period using i18n
            let period = '';
            if (!isFree && plan.period) {
                const periodLower = plan.period.toLowerCase();
                if (periodLower === 'monthly' || periodLower === 'month' || periodLower === '/month') {
                    period = '<span class="period" data-i18n="pricing.perMonth">/month</span>';
                } else if (periodLower === 'yearly' || periodLower === 'year' || periodLower === '/year') {
                    period = '<span class="period" data-i18n="pricing.perYear">/year</span>';
                } else if (periodLower === 'free') {
                    period = '<span class="period" data-i18n="pricing.free">Free</span>';
                } else {
                    period = `<span class="period">/${plan.period}</span>`;
                }
            }

            // Determine if this should be featured (middle tier, or "Premium" named)
            const isFeatured = (index === Math.floor(pricingPlans.length / 2)) ||
                              plan.name.toLowerCase().includes('premium');

            if (isFeatured) {
                tierDiv.classList.add('featured');
            }

            // Add badge based on plan type
            let badgeHtml = '';
            if (isFeatured) {
                badgeHtml = '<div class="tier-badge">MOST POPULAR</div>';
            } else if (index === pricingPlans.length - 1 && !isFree) {
                badgeHtml = '<div class="tier-badge">BEST VALUE</div>';
            }

            const featuresHtml = plan.features.map(feature => {
                // Clean up the feature text - remove all ✅ and ❌ symbols since CSS will handle styling
                let cleanFeature = feature.replace(/^✅\s*/, '').replace(/^❌\s*/, '');
                const hasFeature = !feature.includes('❌');

                // Add appropriate CSS class for styling
                if (hasFeature) {
                    return `<li class="feature-included">${cleanFeature}</li>`;
                } else {
                    return `<li class="feature-excluded">${cleanFeature}</li>`;
                }
            }).join('');

            // Use A/B test URL for pricing CTAs
            const websiteUrl = this.getActiveExternalUrl();

            tierDiv.innerHTML = `
                ${badgeHtml}
                <h3>${plan.name}</h3>
                <div class="price">${price} ${period}</div>
                <ul>
                    ${featuresHtml}
                </ul>
                <a href="${websiteUrl}" class="pricing-cta" target="_blank" data-i18n="companionCard.visitWebsite">Visit Website</a>
            `;

            pricingSection.appendChild(tierDiv);
        });

        // Apply i18n translations to newly added content
        if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
            window.i18n.applyTranslations();
        }
    }

    addCtaToStaticPricing() {
        // Add CTA buttons to existing static pricing tiers
        const staticPricingTiers = document.querySelectorAll('.pricing-tier');
        const websiteUrl = this.getActiveExternalUrl();

        staticPricingTiers.forEach(tier => {
            // Check if CTA button already exists
            if (tier.querySelector('.cta-button, .pricing-cta')) {
                return;
            }

            // Create CTA button
            const ctaButton = document.createElement('a');
            ctaButton.href = websiteUrl;
            ctaButton.className = 'cta-button primary pricing-cta';
            ctaButton.target = '_blank';
            ctaButton.rel = 'noopener';
            ctaButton.textContent = 'Visit Website →';
            ctaButton.style.cssText = 'margin-top: var(--space-4); width: 100%; text-align: center; display: inline-block; padding: var(--space-3) var(--space-4); background: var(--accent-primary); color: white; text-decoration: none; border-radius: var(--radius-md); font-weight: 600; transition: background 0.3s ease;';

            // Add button to the tier
            tier.appendChild(ctaButton);
        });
    }

    getCompanionName() {
        // Try different field variations for the name
        return this.companionData?.name ||
               this.companionData?.['Name'] ||
               this.companionData?.title ||
               this.companionData?.['Title'] ||
               this.companionId.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    updateExternalLinks() {
        if (!this.companionData?.website_url) {
            console.warn('No website_url found in companion data');
            return;
        }

        const websiteUrl = this.getActiveExternalUrl();
        const variantInfo = this.companionData.website_url_2 ? ` (variant ${this.useVariantB ? 'B' : 'A'})` : '';
        console.log(`Updating all external links to: ${websiteUrl}${variantInfo}`);

        // Find and update all external "Visit Website" links
        // Target links in hero section, CTA sections, pricing, and pros/cons (NOT footer)
        const externalLinkSelectors = [
            '.platform-btn', // Hero section button
            '.cta-button.primary', // CTA section buttons
            '.btn-secondary[target="_blank"]', // Companion listing "Visit Website" buttons
            '.pricing-grid .pricing-cta', // Pricing section CTAs
            '.pricing-grid .tier-cta', // Pricing section tier CTAs
            '.pros-cons .pricing-cta', // Pros/cons section CTAs
            '.pros .pricing-cta', // Pros section CTA
            '.cons .pricing-cta', // Cons section CTA
            '.cta-section .pricing-cta', // CTA section
            'main a[href*="http"][target="_blank"]:not(.social-link):not(.review-link)' // Generic external links in main content
        ];

        externalLinkSelectors.forEach(selector => {
            const links = document.querySelectorAll(selector);
            links.forEach(link => {
                // Skip links inside footer
                if (link.closest('footer')) {
                    return;
                }

                // Only update links that look like external affiliate/website links
                // Skip internal links, social links, and specific external content links
                const href = link.getAttribute('href');
                const text = link.textContent.trim();

                // Check if this is likely a "Visit Website" type link (multi-language)
                if (text.includes('Visit Website') ||
                    text.includes('Bezoek Website') ||  // Dutch
                    text.includes('Visitar Site') ||    // Portuguese
                    text.includes('Website besuchen') || // German
                    text.includes('Try') ||
                    text.includes('Get Started') ||
                    link.classList.contains('platform-btn') ||
                    link.classList.contains('cta-button') ||
                    link.classList.contains('pricing-cta') ||
                    link.classList.contains('tier-cta')) {

                    console.log(`Updating link: ${href} -> ${websiteUrl}`);
                    link.setAttribute('href', websiteUrl);
                }
            });
        });
    }

    updateStructuredData() {
        if (!this.companionData?.website_url) return;

        const websiteUrl = this.companionData.website_url;

        // Find and update JSON-LD structured data
        const scripts = document.querySelectorAll('script[type="application/ld+json"]');

        scripts.forEach(script => {
            try {
                const data = JSON.parse(script.textContent);

                // Update Review schema url
                if (data['@type'] === 'Review' && data.itemReviewed) {
                    if (data.itemReviewed.url) {
                        data.itemReviewed.url = websiteUrl;
                        script.textContent = JSON.stringify(data, null, 2);
                        console.log('Updated structured data schema with website_url');
                    }
                }
            } catch (e) {
                console.warn('Failed to parse structured data:', e);
            }
        });
    }

    // Method to manually update companion data (for testing)
    updateCompanionData(data) {
        this.companionData = data;
        this.updatePageContent();
    }

    /**
     * Load and update translated content (verdict, tagline, body description) from Airtable for PT/NL/DE pages
     */
    async loadAndUpdateTranslations() {
        // Detect language from URL path
        const path = window.location.pathname;
        const langMatch = path.match(/^\/(pt|nl|de)\//);

        // Determine language: pt, nl, de, or en (default)
        const language = langMatch ? langMatch[1] : 'en';
        console.log(`Loading ${language.toUpperCase()} translations for: ${this.companionId}`);

        try {
            // Fetch translation from Netlify function
            const response = await fetch(`/.netlify/functions/get-translations?slug=${this.companionId}&lang=${language}`);

            if (!response.ok) {
                if (response.status === 404) {
                    console.log(`No ${language.toUpperCase()} translation found in Companion_Translations table`);
                } else {
                    console.warn(`Failed to fetch ${language} translation:`, response.status);
                }
                return;
            }

            const data = await response.json();

            // Update tagline/subtitle if available (only for non-EN pages)
            if (language !== 'en' && data.tagline) {
                const taglineElement = document.querySelector('.companion-hero .tagline, .hero-text .tagline, .tagline');
                if (taglineElement) {
                    taglineElement.textContent = data.tagline;
                    console.log(`✅ Updated tagline with ${language.toUpperCase()} translation`);
                }
            }

            // Update body description (overview paragraphs) if available (only for non-EN pages)
            if (language !== 'en' && (data.body_description || data.description)) {
                const bodyDesc = data.body_description || data.description;
                this.updateBodyDescription(bodyDesc);
                console.log(`✅ Updated body description with ${language.toUpperCase()} translation`);
            }

            // Update verdict section if available (only for non-EN pages)
            if (language !== 'en' && data.my_verdict) {
                await this.updateVerdictSection(data.my_verdict);
                console.log(`✅ Updated verdict section with ${language.toUpperCase()} translation`);
            } else if (language !== 'en') {
                console.warn(`No my_verdict found for ${this.companionId} in ${language}`);
            }

            // NOTE: Features are now loaded directly from the main Companions table
            // The features field in Airtable already contains the correct language version
            // We no longer override features from Companion_Translations table

        } catch (error) {
            console.error('Error loading translations:', error);
        }
    }

    /**
     * Update body description (overview section paragraphs) with translated content
     */
    updateBodyDescription(bodyDescText) {
        // Find the overview section
        const overviewSection = document.querySelector('.overview, section.overview');
        if (!overviewSection) {
            console.warn('Overview section not found');
            return;
        }

        // Split body description into paragraphs (separated by double newlines or single newlines)
        const paragraphs = bodyDescText.split(/\n\n|\n/).filter(p => p.trim().length > 0);

        // Find existing paragraph elements (skip the h2 title)
        const existingParagraphs = overviewSection.querySelectorAll('p');

        // Update existing paragraphs or add new ones
        paragraphs.forEach((paraText, index) => {
            const text = paraText.trim();
            if (!text) return;

            if (existingParagraphs[index]) {
                // Update existing paragraph
                existingParagraphs[index].textContent = text;
            } else {
                // Create new paragraph before the features container
                const p = document.createElement('p');
                p.textContent = text;

                // Insert before #dynamic-features if it exists
                const featuresContainer = overviewSection.querySelector('#dynamic-features');
                if (featuresContainer) {
                    overviewSection.insertBefore(p, featuresContainer);
                } else {
                    overviewSection.appendChild(p);
                }
            }
        });
    }

    /**
     * Update the verdict section with translated content
     */
    async updateVerdictSection(verdictText) {
        // Wait for companionHeader to be available (loaded after companion-page.js)
        let attempts = 0;
        while (!window.companionHeader && attempts < 30) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }

        // Use the companionHeader's updateVerdict method which has smart heading detection and read more
        if (window.companionHeader && typeof window.companionHeader.updateVerdict === 'function') {
            console.log('🔄 Using companionHeader.updateVerdict for translated content');
            window.companionHeader.updateVerdict(verdictText);
        } else {
            console.warn('⚠️ companionHeader.updateVerdict not available, falling back to simple update');
            const verdictSection = document.querySelector('.verdict, section.verdict');
            if (!verdictSection) return;

            const verdictTextDiv = verdictSection.querySelector('.verdict-text');
            if (verdictTextDiv) {
                verdictTextDiv.innerHTML = `<p>${verdictText.replace(/\n\n/g, '</p><p>')}</p>`;
            }
        }

        console.log('✅ Updated verdict section with translation');
    }

    /**
     * Translate CTA (Call to Action) section for PT/NL pages
     */
    translateCTASection() {
        // Check if i18n is available and initialized
        if (!window.i18n || !window.i18n.initialized) {
            console.log('i18n not ready, skipping CTA translation');
            return;
        }

        // Only translate for PT/NL pages
        if (window.i18n.currentLang === 'en') {
            return;
        }

        // Find CTA section
        const ctaSection = document.querySelector('.cta-section');
        if (!ctaSection) {
            console.log('CTA section not found');
            return;
        }

        // Get companion name from page
        const companionName = this.companionData?.name || this.extractCompanionNameFromPage();

        // Translate heading
        const heading = ctaSection.querySelector('h2');
        if (heading) {
            const translatedHeading = window.i18n.t('companion.readyToTry', { name: companionName });
            heading.textContent = translatedHeading;
        }

        // Translate description
        const description = ctaSection.querySelector('p');
        if (description) {
            description.textContent = window.i18n.t('companion.ctaDescription');
        }

        // Translate button text
        const button = ctaSection.querySelector('.cta-button');
        if (button) {
            button.textContent = window.i18n.t('companionCard.visitWebsite') + ' →';
        }

        console.log('✅ Translated CTA section');
    }

    /**
     * Extract companion name from page title or h1
     */
    extractCompanionNameFromPage() {
        // Try to get from page title first
        const titleMatch = document.title.match(/^([^-]+)/);
        if (titleMatch) {
            return titleMatch[1].trim();
        }

        // Try to get from h1
        const h1 = document.querySelector('h1');
        if (h1) {
            return h1.textContent.trim();
        }

        // Fallback: capitalize the slug
        return this.companionId
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Render features from Airtable with translation support
     */
    renderFeatures() {
        console.log('🎨 renderFeatures() called');
        const container = document.getElementById('dynamic-features');
        if (!container) {
            console.warn('⚠️ Dynamic features container not found');
            return;
        }

        console.log('✅ Container found:', container);

        // Detect current language from URL
        const path = window.location.pathname;
        const langMatch = path.match(/^\/(pt|nl|de)\//);
        const currentLang = langMatch ? langMatch[1] : 'en';

        // Default fallback features with multilingual support
        const fallbackFeaturesMap = {
            'en': [
                {icon: "💬", title: "Imaginative AI Chat", description: "Captivating conversations that spark imagination"},
                {icon: "🖼️", title: "Realistic Images", description: "Precise visuals bringing fantasies to life"},
                {icon: "🎨", title: "Consistent Characters", description: "Well-crafted personalities that stay true"},
                {icon: "🧠", title: "Long-Term Memory", description: "Remembers preferences and past interactions"}
            ],
            'nl': [
                {icon: "💬", title: "Creatieve AI Chat", description: "Boeiende gesprekken die de verbeelding prikkelen"},
                {icon: "🖼️", title: "Realistische Afbeeldingen", description: "Precieze visuals die fantasieën tot leven brengen"},
                {icon: "🎨", title: "Consistente Personages", description: "Goed uitgewerkte persoonlijkheden die trouw blijven"},
                {icon: "🧠", title: "Langetermijngeheugen", description: "Onthoudt voorkeuren en eerdere interacties"}
            ],
            'pt': [
                {icon: "💬", title: "Chat de IA Criativo", description: "Conversas envolventes que estimulam a imaginação"},
                {icon: "🖼️", title: "Imagens Realistas", description: "Visuais precisos que dão vida às fantasias"},
                {icon: "🎨", title: "Personagens Consistentes", description: "Personalidades bem elaboradas que permanecem fiéis"},
                {icon: "🧠", title: "Memória de Longo Prazo", description: "Lembra preferências e interações passadas"}
            ],
            'de': [
                {icon: "💬", title: "Kreativer KI-Chat", description: "Fesselnde Gespräche, die die Fantasie anregen"},
                {icon: "🖼️", title: "Realistische Bilder", description: "Präzise Visuals, die Fantasien zum Leben erwecken"},
                {icon: "🎨", title: "Konsistente Charaktere", description: "Gut ausgearbeitete Persönlichkeiten, die treu bleiben"},
                {icon: "🧠", title: "Langzeitgedächtnis", description: "Erinnert sich an Vorlieben und frühere Interaktionen"}
            ]
        };

        const fallbackFeatures = fallbackFeaturesMap[currentLang] || fallbackFeaturesMap['en'];

        let features = null;

        if (this.companionData) {
            console.log('📦 Companion data available');
            console.log('📊 Features in companionData:', this.companionData.features);

            // Get features from main Airtable Companions table
            features = this.companionData.features;

            // Parse features if it's a string
            if (typeof features === 'string') {
                try {
                    // Clean up the JSON string: remove ALL line breaks (both \n with spaces and standalone \n)
                    const cleanedFeatures = features.replace(/\n\s*/g, ' ').replace(/\s{2,}/g, ' ');
                    features = JSON.parse(cleanedFeatures);
                    console.log('✅ Parsed features from string');
                } catch (e) {
                    console.error('❌ Failed to parse features:', e);
                    console.error('Raw features string:', features.substring(0, 500));
                    features = null;
                }
            }

            // Check if features is valid array
            if (!Array.isArray(features) || features.length === 0) {
                console.log('⚠️ Features not valid array or empty, using fallback');
                features = null;
            } else {
                console.log(`✅ Using ${features.length} features from Airtable Companions table`);
            }
        } else {
            console.log('⚠️ No companion data available');
        }

        // Use multilingual fallback if no features from Airtable
        if (!features) {
            console.log(`💾 Using ${currentLang.toUpperCase()} fallback features`);
            features = fallbackFeatures;
        }

        // Render feature cards
        const featuresHtml = features.map(feature => `
            <div class="highlight-item">
                <strong>${feature.icon ? feature.icon + ' ' : ''}${feature.title}:</strong>
                <span>${feature.description || feature.text || ''}</span>
            </div>
        `).join('');

        container.innerHTML = featuresHtml;
        console.log(`✅ Rendered ${features.length} features to container`);
        console.log('📄 HTML:', featuresHtml.substring(0, 200) + '...');
    }

    /**
     * Render image gallery from Airtable data
     */
    renderGallery() {
        const galleryContainer = document.getElementById('companionGallery');
        if (!galleryContainer) {
            console.log('⚠️ Gallery container not found on this page');
            return;
        }

        console.log('🖼️ Rendering companion image gallery...');

        // Check if companion data has gallery_images
        if (!this.companionData || !this.companionData.gallery_images) {
            console.log('⚠️ No gallery_images data available');
            return;
        }

        try {
            // Parse gallery_images (comes as JSON string from Airtable)
            let galleryImages;
            if (typeof this.companionData.gallery_images === 'string') {
                galleryImages = JSON.parse(this.companionData.gallery_images);
            } else if (Array.isArray(this.companionData.gallery_images)) {
                galleryImages = this.companionData.gallery_images;
            } else {
                console.warn('⚠️ gallery_images is not in expected format');
                return;
            }

            // Validate images array
            if (!Array.isArray(galleryImages) || galleryImages.length === 0) {
                console.log('⚠️ No images in gallery_images array');
                return;
            }

            console.log(`✅ Found ${galleryImages.length} images for gallery`);

            // Initialize gallery with CompanionGallery class
            if (window.CompanionGallery) {
                const options = {
                    isUncensored: this.companionData.is_uncensored || false,
                    websiteUrl: this.getActiveExternalUrl() // Use A/B tested URL
                };
                window.companionGalleryInstance = new window.CompanionGallery('companionGallery', galleryImages, options);
                const variantInfo = this.companionData.website_url_2 ? ` (variant ${this.useVariantB ? 'B' : 'A'})` : '';
                console.log(`✅ Gallery initialized successfully (uncensored: ${options.isUncensored})${variantInfo}`);
            } else {
                console.error('❌ CompanionGallery class not loaded');
            }
        } catch (error) {
            console.error('❌ Error rendering gallery:', error);
        }
    }
}

// Initialize companion page manager when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Only initialize on companion pages
    if (window.location.pathname.includes('/companions/')) {
        window.companionPageManager = new CompanionPageManager();
    }
});

// Expose for external use
window.CompanionPageAPI = {
    updateCompanionData: (data) => window.companionPageManager?.updateCompanionData(data),
    getCompanionData: () => window.companionPageManager?.companionData,
    reload: () => window.companionPageManager?.init()
};