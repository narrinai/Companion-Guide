// Companion Page Dynamic Content Manager
class CompanionPageManager {
    constructor() {
        this.companionId = this.extractCompanionIdFromUrl();
        this.companionData = null;
        this.init();
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
     * Only runs on non-English pages (NL/PT)
     */
    updateQuickFactsFromHeroSpecs() {
        // Only run for non-English pages
        if (!window.i18n || window.i18n.currentLang === 'en') {
            return;
        }

        // Check if companion data has hero_specs
        if (!this.companionData || !this.companionData.hero_specs) {
            console.log('⚠️ No hero_specs available for translation');
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
            // Skip if heading already has correct format (i18n.js already processed it)
            const currentText = whatIsHeading.textContent.trim();
            const hasCorrectFormat = currentText.includes(companionName) &&
                                    (currentText.startsWith('What is') ||
                                     currentText.startsWith('Wat is') ||
                                     currentText.startsWith('O que é'));

            if (hasCorrectFormat) {
                return; // i18n.js already handled this
            }

            // Detect language from URL
            const path = window.location.pathname;
            const langMatch = path.match(/^\/(pt|nl)\//);

            if (langMatch) {
                const lang = langMatch[1];
                // Use translated "What is" text
                if (lang === 'nl') {
                    whatIsHeading.textContent = `Wat is ${companionName}?`;
                } else if (lang === 'pt') {
                    whatIsHeading.textContent = `O que é ${companionName}?`;
                }
            } else {
                // English
                whatIsHeading.textContent = `What is ${companionName}?`;
            }
        }
    }

    updateRating() {
        // Skip rating update for PT/NL pages - use hardcoded HTML rating
        const path = window.location.pathname;
        if (path.match(/^\/(pt|nl)\//)) {
            return;
        }

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
        const usesEuro = companionCurrency === '€' || companionCurrency === 'EUR' || this.companionId === 'soulkyn-ai';

        // Generate pricing tiers from Airtable data
        pricingPlans.forEach((plan, index) => {
            const tierDiv = document.createElement('div');
            tierDiv.className = 'pricing-tier';

            // Handle both numeric prices and "Free" string
            const isFree = plan.price === 0 || plan.price === 'Free' || plan.price === 'free';
            // Use plan currency if specified, otherwise use companion default
            const planCurrency = plan.currency || (usesEuro ? '€' : '$');
            const price = isFree ? 'Free' : `${planCurrency}${plan.price}`;
            const period = isFree ? '' : (plan.period ? `/${plan.period}` : '');

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

            const websiteUrl = this.companionData.website_url || this.companionData.website || '#';

            tierDiv.innerHTML = `
                ${badgeHtml}
                <h3>${plan.name}</h3>
                <div class="price">${price} <span class="period">${period}</span></div>
                <ul>
                    ${featuresHtml}
                </ul>
                <a href="${websiteUrl}" class="cta-button primary" target="_blank" rel="noopener" style="margin-top: var(--space-4); width: 100%; text-align: center; display: inline-block; padding: var(--space-3) var(--space-4); background: var(--accent-primary); color: white; text-decoration: none; border-radius: var(--radius-md); font-weight: 600; transition: background 0.3s ease;">Visit Website →</a>
            `;

            pricingSection.appendChild(tierDiv);
        });
    }

    addCtaToStaticPricing() {
        // Add CTA buttons to existing static pricing tiers
        const staticPricingTiers = document.querySelectorAll('.pricing-tier');
        const websiteUrl = this.companionData?.website_url || this.companionData?.website || '#';

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

        const websiteUrl = this.companionData.website_url;
        console.log(`Updating all external links to: ${websiteUrl}`);

        // Find and update all external "Visit Website" links
        // Target links in hero section, CTA sections, and pricing
        const externalLinkSelectors = [
            '.platform-btn', // Hero section button
            '.cta-button.primary', // CTA section buttons
            '.btn-secondary[target="_blank"]', // Companion listing "Visit Website" buttons
            'a[href*="http"][target="_blank"]:not(.social-link):not(.review-link)' // Generic external links
        ];

        externalLinkSelectors.forEach(selector => {
            const links = document.querySelectorAll(selector);
            links.forEach(link => {
                // Only update links that look like external affiliate/website links
                // Skip internal links, social links, and specific external content links
                const href = link.getAttribute('href');
                const text = link.textContent.trim();

                // Check if this is likely a "Visit Website" type link
                if (text.includes('Visit Website') ||
                    text.includes('Try') ||
                    text.includes('Get Started') ||
                    link.classList.contains('platform-btn') ||
                    link.classList.contains('cta-button')) {

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
     * Load and update translated content (verdict, tagline, body description) from Airtable for PT/NL pages
     */
    async loadAndUpdateTranslations() {
        // Detect language from URL path
        const path = window.location.pathname;
        const langMatch = path.match(/^\/(pt|nl)\//);

        // Determine language: pt, nl, or en (default)
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
                this.updateVerdictSection(data.my_verdict);
                console.log(`✅ Updated verdict section with ${language.toUpperCase()} translation`);
            } else if (language !== 'en') {
                console.warn(`No my_verdict found for ${this.companionId} in ${language}`);
            }

            // Update features if available from translations (for ALL languages: EN, NL, PT)
            if (data.features) {
                console.log(`🎨 Loading features from ${language.toUpperCase()} translation:`, data.features);
                // Override companionData features with translated version
                this.companionData.features = data.features;
                console.log(`✅ Loaded features from ${language.toUpperCase()} translation (${data.features.length} features)`);
            }

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
    updateVerdictSection(verdictText) {
        // Find both verdict and personal-experience sections
        const verdictSection = document.querySelector('.verdict, section.verdict');
        const personalExpSection = document.querySelector('.personal-experience, section.personal-experience');

        if (!verdictSection) {
            console.warn('Verdict section not found on page');
            return;
        }

        // Split the my_verdict content into lines
        const lines = verdictText.split('\n');
        let verdictHtml = '';
        let personalExpHtml = '';
        let inPersonalExp = false;
        let prosHtml = '';
        let inPros = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // Check if we're entering personal experience section
            if (line.includes('My ') && line.includes('Week') && line.includes('Experience')) {
                inPersonalExp = true;
                personalExpHtml += `<h2>${line}</h2>\n`;
                continue;
            }

            // Check if we're in pros section
            if (line.toLowerCase().includes('what genuinely impressed') ||
                line.toLowerCase().includes('what impressed me') ||
                line.toLowerCase().includes('companion.pros')) {
                inPros = true;
                continue;
            }

            // Build HTML based on current section
            if (inPersonalExp) {
                // Check for headings (H3 and H4)
                if (line.length < 100 && line.match(/^(Week \d+|Day \d+|The |When |How |My |A |An |During |After |Before |Final |Month |Today )/i)) {
                    // Determine if H3 or H4
                    if (line.startsWith('Week ') || line.includes('Experience') || line.length < 50) {
                        personalExpHtml += `<h3>${line}</h3>\n`;
                    } else {
                        personalExpHtml += `<h4>${line}</h4>\n`;
                    }
                } else if (line.startsWith('-')) {
                    personalExpHtml += `<li>${line.substring(1).trim()}</li>\n`;
                } else {
                    personalExpHtml += `<p>${line}</p>\n`;
                }
            } else if (inPros) {
                prosHtml += `<li>${line}</li>\n`;
            } else {
                // Verdict section
                if (line.length < 100 && !line.includes('.') && !line.startsWith('-')) {
                    verdictHtml += `<h3>${line}</h3>\n`;
                } else {
                    verdictHtml += `<p>${line}</p>\n`;
                }
            }
        }

        // IMPORTANT: Replace verdict section content (clears English, adds translation)
        const verdictTextDiv = verdictSection.querySelector('.verdict-text');
        if (verdictTextDiv) {
            verdictTextDiv.innerHTML = verdictHtml || ''; // Replace completely
        }

        // IMPORTANT: Replace personal experience section (clears English, adds translation)
        if (personalExpSection) {
            personalExpSection.innerHTML = personalExpHtml || ''; // Replace completely, even if empty
        }

        console.log('✅ Updated verdict and personal experience sections');
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

        // Default fallback features for Dream Companion
        const fallbackFeatures = [
            {icon: "💬", title: "Imaginative AI Chat", description: "Captivating conversations that spark imagination"},
            {icon: "🖼️", title: "Realistic Images", description: "Precise visuals bringing fantasies to life"},
            {icon: "🎨", title: "Consistent Characters", description: "Well-crafted personalities that stay true"},
            {icon: "🧠", title: "Long-Term Memory", description: "Remembers preferences and past interactions"}
        ];

        let features = null;

        if (this.companionData) {
            console.log('📦 Companion data available');
            console.log('📊 Features in companionData:', this.companionData.features);

            // Get features - API already returns translated version based on language
            features = this.companionData.features;

            // Parse features if it's a string (shouldn't be needed, but safety check)
            if (typeof features === 'string') {
                try {
                    features = JSON.parse(features);
                    console.log('✅ Parsed features from string');
                } catch (e) {
                    console.error('❌ Failed to parse features:', e);
                    features = null;
                }
            }

            // Check if features is valid array
            if (!Array.isArray(features) || features.length === 0) {
                console.log('⚠️ Features not valid array or empty');
                features = null;
            }
        } else {
            console.log('⚠️ No companion data available');
        }

        // Use fallback if no features from Airtable
        if (!features) {
            console.log('💾 Using fallback features');
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