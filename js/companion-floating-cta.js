/**
 * Compact Floating CTA for Companion Pages
 * Automatically extracts companion name and URL from the page
 * Includes "Best Alternative" button linking to high-rated companions (9.4+)
 */

class CompanionFloatingCTA {
  constructor() {
    this.cta = null;
    this.dismissed = false;
    this.storageKey = 'companionCTADismissed';
    this.companionData = null;
    this.alternativeData = null;
    // A/B test: read variant from cookie set by Edge Function
    this.useVariantB = this.getABVariantFromCookie() === 'B';

    // High-rated alternatives (9.4+ rating)
    this.highRatedCompanions = [
      {
        name: 'Hammer AI',
        slug: 'hammer-ai',
        rating: '9.4',
        url: 'https://gumroad.com/a/748605075/zrsof',
        logo: '/images/logos/hammer-ai.png'
      },
      {
        name: 'Secrets AI',
        slug: 'secrets-ai',
        rating: '9.6',
        url: 'http://secrets.ai/?spicy=true&gender=female&fpr=companionguide',
        logo: '/images/logos/secrets-ai.png'
      },
      {
        name: 'Soulkyn AI',
        slug: 'soulkyn-ai',
        rating: '9.4',
        url: 'https://soulkyn.com/?_go=companionguide',
        logo: '/images/logos/soulkyn-ai.png'
      }
    ];

    this.init();
  }

  init() {
    // Check if user has dismissed the CTA recently
    const dismissedTimestamp = localStorage.getItem(this.storageKey);
    if (dismissedTimestamp) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTimestamp)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        this.dismissed = true;
        return;
      }
    }

    // Wait for i18n to be ready before creating CTA
    if (window.i18n?.initialized) {
      this.initCTA();
    } else {
      // Listen for i18n ready event
      window.addEventListener('i18nTranslationsApplied', () => this.initCTA(), { once: true });
      // Fallback: if i18n doesn't load within 2 seconds, proceed anyway
      setTimeout(() => {
        if (!this.cta) this.initCTA();
      }, 2000);
    }
  }

  async initCTA() {
    // Get companion data from Airtable (with A/B test URL)
    await this.loadCompanionData();

    // Select a random high-rated alternative (excluding current companion)
    this.selectAlternative();

    if (this.companionData) {
      this.createCTA();
      this.attachEventListeners();
    }
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
  getActiveExternalUrl(companion) {
    if (!companion) return '#';

    const hasVariantB = companion.website_url_2 && companion.website_url_2.trim() !== '';
    const isVariantB = hasVariantB && this.useVariantB;

    return isVariantB
      ? companion.website_url_2
      : (companion.website_url || '#');
  }

  async loadCompanionData() {
    // Get current companion slug from URL (handles /companions/slug and /nl/companions/slug)
    const pathParts = window.location.pathname.split('/').filter(p => p);
    const currentSlug = pathParts[pathParts.length - 1].replace('.html', '');

    // Wait for companionManager if not ready
    if (!window.companionManager) {
      let attempts = 0;
      while (!window.companionManager && attempts < 30) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
    }

    if (!window.companionManager) {
      console.warn('CompanionManager not available for floating CTA');
      // Fallback to extracting from page
      this.extractCompanionData();
      return;
    }

    try {
      const airtableData = await window.companionManager.fetchCompanionById(currentSlug);
      if (airtableData) {
        this.companionData = {
          name: airtableData.name,
          url: this.getActiveExternalUrl(airtableData),
          logo: airtableData.logo_url || airtableData.logo || '',
          slug: airtableData.slug || currentSlug,
          rating: airtableData.rating || null,
          reviewCount: airtableData.review_count || null
        };
        this.airtableData = airtableData; // Store for tracking
        console.log(`Floating CTA: Loaded ${airtableData.name} with URL ${this.companionData.url}`);
      } else {
        // Fallback to extracting from page
        this.extractCompanionData();
      }
    } catch (e) {
      console.warn('Could not fetch companion data for floating CTA:', e);
      this.extractCompanionData();
    }
  }

  extractCompanionData() {
    // Find the companion name from h1 (e.g., "Hammer AI Review" → "Hammer AI")
    const h1 = document.querySelector('.companion-hero h1, .hero-text h1');
    let name = '';
    if (h1) {
      name = h1.textContent.trim().replace(/\s*Review\s*/i, '').trim();
    }

    // Find the website URL from the "Visit Website" button
    const visitButton = document.querySelector('.platform-btn[target="_blank"], .platform-info a[target="_blank"]');
    let url = '';
    if (visitButton) {
      url = visitButton.href;
    }

    // Find the logo image
    const logo = document.querySelector('.companion-logo, .hero-content img');
    let logoSrc = '';
    if (logo) {
      logoSrc = logo.src;
    }

    // Get current slug from URL
    const currentSlug = window.location.pathname.split('/').pop().replace('.html', '');

    // Only create CTA if we have both name and URL
    if (name && url) {
      this.companionData = {
        name: name,
        url: url,
        logo: logoSrc,
        slug: currentSlug
      };
    }
  }

  selectAlternative() {
    if (!this.companionData) return;

    // Filter out current companion from alternatives
    const availableAlternatives = this.highRatedCompanions.filter(
      c => c.slug !== this.companionData.slug
    );

    // Pick a random alternative
    if (availableAlternatives.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableAlternatives.length);
      this.alternativeData = availableAlternatives[randomIndex];
    }
  }

  createCTA() {
    if (!this.companionData) return;

    // Get translated strings (fallback to English if i18n not available or returns key)
    let visitWebsiteText = 'Visit Website';
    let bestAlternativeText = 'Best Alternative';
    let currentCompanionText = 'CURRENT COMPANION';

    if (window.i18n?.t) {
      const visitKey = window.i18n.t('floatingCta.visitWebsite');
      const altKey = window.i18n.t('floatingCta.bestAlternative');
      const currentKey = window.i18n.t('floatingCta.currentCompanion');
      // Only use translation if it doesn't return the key itself
      if (visitKey && !visitKey.includes('floatingCta.')) visitWebsiteText = visitKey;
      if (altKey && !altKey.includes('floatingCta.')) bestAlternativeText = altKey;
      if (currentKey && !currentKey.includes('floatingCta.')) currentCompanionText = currentKey;
    }

    // Create the floating CTA container (div instead of anchor for multiple buttons)
    this.cta = document.createElement('div');
    this.cta.className = 'companion-floating-cta';

    // Build alternative button HTML if available
    let alternativeHTML = '';
    if (this.alternativeData) {
      alternativeHTML = `
        <a href="${this.alternativeData.url}" target="_blank" rel="noopener noreferrer" class="companion-floating-cta-btn companion-floating-cta-btn-alt" data-action="alternative" data-alternative-slug="${this.alternativeData.slug}">
          ${bestAlternativeText} <span class="companion-floating-cta-arrow">→</span>
        </a>
      `;
    }

    // Generate star rating HTML
    let starsHTML = '';
    let rating = 0;
    if (this.companionData.rating) {
      rating = parseFloat(this.companionData.rating);
      const fullStars = Math.floor(rating / 2); // Convert 10-scale to 5-star
      const hasHalfStar = (rating / 2) % 1 >= 0.5;
      const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

      for (let i = 0; i < fullStars; i++) starsHTML += '★';
      if (hasHalfStar) starsHTML += '★';
      for (let i = 0; i < emptyStars; i++) starsHTML += '☆';
    }

    // Build CTA HTML - COTM style design
    let ctaHTML = `
      <div class="companion-floating-cta-label">${currentCompanionText}</div>
      <div class="companion-floating-cta-content">
        ${this.companionData.logo ?
          `<a href="${this.companionData.url}" target="_blank" rel="noopener noreferrer"><img src="${this.companionData.logo}" alt="${this.escapeHtml(this.companionData.name)}" class="companion-floating-cta-logo"></a>` :
          ''
        }
        <div class="companion-floating-cta-info">
          <a href="${this.companionData.url}" target="_blank" rel="noopener noreferrer" class="companion-floating-cta-name-link">${this.escapeHtml(this.companionData.name)}</a>
          <div class="companion-floating-cta-rating">
            <span class="companion-floating-cta-stars">${starsHTML}</span>
            <span class="companion-floating-cta-score">${rating.toFixed(1)}</span><span class="companion-floating-cta-score-label">/10</span>
          </div>
        </div>
      </div>
      <div class="companion-floating-cta-buttons">
        <a href="${this.companionData.url}" target="_blank" rel="noopener noreferrer" class="companion-floating-cta-btn companion-floating-cta-btn-primary" data-action="visit">
          ${visitWebsiteText} <span class="companion-floating-cta-arrow">→</span>
        </a>
        ${alternativeHTML}
      </div>
      <span class="companion-floating-cta-close" data-close="true">×</span>
    `;

    this.cta.innerHTML = ctaHTML;
    document.body.appendChild(this.cta);
  }

  attachEventListeners() {
    if (!this.cta) return;

    // Handle close button
    const closeBtn = this.cta.querySelector('[data-close]');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dismiss();
      });
    }

    // Hide CTA when near footer or before header on mobile
    window.addEventListener('scroll', () => this.handleScroll());
    // Initial check
    this.handleScroll();

    // Track clicks on primary button
    const primaryBtn = this.cta.querySelector('[data-action="visit"]');
    if (primaryBtn) {
      primaryBtn.addEventListener('click', () => {
        this.trackClick('visit');
      });
    }

    // Track clicks on alternative button
    const altBtn = this.cta.querySelector('[data-action="alternative"]');
    if (altBtn) {
      altBtn.addEventListener('click', () => {
        this.trackAlternativeClick();
      });
    }
  }

  handleScroll() {
    if (!this.cta || this.dismissed) return;

    // On mobile, show CTA only after scrolling past the header
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const hero = document.querySelector('.companion-hero');
      if (hero) {
        const heroBottom = hero.getBoundingClientRect().bottom;
        if (heroBottom <= 0) {
          // Scrolled past the header - show CTA
          this.cta.classList.add('show-after-scroll');
        } else {
          // Still at/above header - hide CTA
          this.cta.classList.remove('show-after-scroll');
        }
      }
    }

    const footer = document.querySelector('footer');
    if (!footer) return;

    const footerTop = footer.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (footerTop < windowHeight + 100) {
      this.cta.classList.add('near-footer');
    } else {
      this.cta.classList.remove('near-footer');
    }
  }

  dismiss() {
    if (!this.cta) return;

    this.dismissed = true;
    this.cta.classList.add('hidden');
    localStorage.setItem(this.storageKey, Date.now().toString());

    // Remove element after animation
    setTimeout(() => {
      if (this.cta && this.cta.parentNode) {
        this.cta.parentNode.removeChild(this.cta);
      }
    }, 300);
  }

  async trackClick() {
    // Get domain from URL
    let domain = '';
    try {
      const urlObj = new URL(this.companionData.url);
      domain = urlObj.hostname.replace('www.', '');
    } catch (e) {
      domain = 'unknown';
    }

    // Try to get Airtable data for enriched tracking
    const airtableData = await this.getAirtableData();
    const isCOTM = airtableData?.is_month === true;

    // Build event parameters
    const eventParams = {
      event_category: 'outbound',
      event_label: `${this.companionData.name.toLowerCase().replace(/\s+/g, '_')}_floating_cta_cta_button`,
      link_text: 'Visit ' + this.companionData.name,
      link_url: this.companionData.url,
      link_domain: domain,
      page_location: window.location.pathname,
      companion_name: this.companionData.name,
      link_type: 'floating_cta',
      link_position: 'floating_cta',
      link_identifier: `${this.companionData.name.toLowerCase().replace(/\s+/g, '_')}_floating_cta_cta_button`,
      value: 1
    };

    // Add Airtable-enriched parameters if available
    if (airtableData) {
      eventParams.companion_slug = airtableData.slug || '';
      eventParams.companion_rating = airtableData.rating || 0;
      eventParams.companion_categories = Array.isArray(airtableData.categories)
        ? airtableData.categories.join(', ')
        : '';
      eventParams.companion_is_featured = airtableData.featured === true || airtableData.is_featured === true;
      eventParams.companion_is_cotm = isCOTM;
      eventParams.companion_badges = Array.isArray(airtableData.badges)
        ? airtableData.badges.join(', ')
        : '';
    }

    // Track outbound click (same as other Visit Website buttons)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'outbound_click', eventParams);
    }

    // Track COTM-specific event
    if (isCOTM && typeof gtag !== 'undefined') {
      gtag('event', 'cotm_floating_cta_click', {
        event_category: 'Companion of the Month',
        event_label: this.companionData.name,
        companion_name: this.companionData.name,
        companion_slug: airtableData?.slug || '',
        companion_rating: airtableData?.rating || 0,
        companion_categories: Array.isArray(airtableData?.categories)
          ? airtableData.categories.join(', ')
          : '',
        is_cotm: true,
        value: 1
      });
    }

    // Track with Facebook Pixel if available (only for COTM)
    if (isCOTM && typeof fbq !== 'undefined') {
      fbq('track', 'Lead', {
        content_name: `COTM Floating CTA - ${this.companionData.name}`,
        content_category: 'Companion of the Month',
        value: 1.00,
        currency: 'USD'
      });
    }
  }

  trackAlternativeClick() {
    if (!this.alternativeData) return;

    // Get domain from URL
    let domain = '';
    try {
      const urlObj = new URL(this.alternativeData.url);
      domain = urlObj.hostname.replace('www.', '');
    } catch (e) {
      domain = 'unknown';
    }

    // Build event parameters
    const eventParams = {
      event_category: 'outbound',
      event_label: `${this.alternativeData.slug}_floating_cta_best_alternative`,
      link_text: 'Best Alternative - ' + this.alternativeData.name,
      link_url: this.alternativeData.url,
      link_domain: domain,
      page_location: window.location.pathname,
      companion_name: this.alternativeData.name,
      companion_slug: this.alternativeData.slug,
      companion_rating: this.alternativeData.rating,
      link_type: 'floating_cta_alternative',
      link_position: 'floating_cta',
      link_identifier: `${this.alternativeData.slug}_floating_cta_best_alternative`,
      source_companion: this.companionData.name,
      value: 1
    };

    // Track outbound click
    if (typeof gtag !== 'undefined') {
      gtag('event', 'outbound_click', eventParams);
      gtag('event', 'best_alternative_click', {
        event_category: 'Best Alternative',
        event_label: this.alternativeData.name,
        alternative_name: this.alternativeData.name,
        alternative_slug: this.alternativeData.slug,
        alternative_rating: this.alternativeData.rating,
        source_companion: this.companionData.name,
        value: 1
      });
    }

    // Track with Facebook Pixel if available
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead', {
        content_name: `Best Alternative - ${this.alternativeData.name}`,
        content_category: 'Best Alternative',
        value: 1.00,
        currency: 'USD'
      });
    }
  }

  async getAirtableData() {
    // Return cached data if already loaded
    if (this.airtableData) return this.airtableData;

    // Get current companion slug from URL (handles /companions/slug and /nl/companions/slug)
    const pathParts = window.location.pathname.split('/').filter(p => p);
    const currentSlug = pathParts[pathParts.length - 1].replace('.html', '');

    // Wait for companionManager if not ready
    if (!window.companionManager) {
      let attempts = 0;
      while (!window.companionManager && attempts < 20) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
    }

    if (!window.companionManager) return null;

    try {
      this.airtableData = await window.companionManager.fetchCompanionById(currentSlug);
      return this.airtableData;
    } catch (e) {
      console.warn('Could not fetch Airtable data for floating CTA');
      return null;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new CompanionFloatingCTA();
  });
} else {
  new CompanionFloatingCTA();
}
