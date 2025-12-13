/**
 * Deals Page - Dynamic Deal Loading from Airtable
 * Fetches and displays deals from Airtable based on deal_active checkbox
 */

class DealsManager {
  constructor() {
    this.deals = [];
    this.container = document.querySelector('.deals-container');
    // A/B test: read variant from cookie set by Edge Function
    this.useVariantB = this.getABVariantFromCookie() === 'B';
    // Detect current language from URL
    this.currentLang = this.detectLanguage();
  }

  /**
   * Detect language from URL path
   * Examples: /es/deals -> 'es', /deals -> 'en'
   */
  detectLanguage() {
    const pathParts = window.location.pathname.split('/').filter(p => p);
    const supportedLangs = ['es', 'nl', 'de', 'pt'];
    if (pathParts.length > 0 && supportedLangs.includes(pathParts[0])) {
      return pathParts[0];
    }
    return 'en';
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
  getActiveExternalUrl(deal) {
    if (!deal) return '#';

    const hasVariantB = deal.website_url_2 && deal.website_url_2.trim() !== '';
    const isVariantB = hasVariantB && this.useVariantB;

    return isVariantB
      ? deal.website_url_2
      : (deal.website_url || '#');
  }

  async init() {
    console.log('🎯 Initializing Deals Manager...');
    this.showLoading();
    await this.loadDeals();
    this.renderDeals();
  }

  showLoading() {
    if (this.container) {
      const loadingText = window.i18n && window.i18n.initialized
        ? window.i18n.t('dealsPage.loading')
        : 'Loading exclusive deals...';

      this.container.innerHTML = `
        <div class="deals-loading" style="text-align: center; padding: 4rem 2rem; color: #999;">
          <div style="margin-bottom: 1rem;">${loadingText}</div>
        </div>
      `;
    }
  }

  async loadDeals() {
    try {
      console.log('📡 Fetching deals from Netlify function...');

      const response = await fetch(`/.netlify/functions/deals-get?lang=${this.currentLang}`);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.deals = data.deals || [];

      console.log(`✅ Loaded ${this.deals.length} deals`);
    } catch (error) {
      console.error('❌ Error loading deals:', error);
      this.showError(error.message);
    }
  }

  renderDeals() {
    if (!this.container) {
      console.error('❌ Deals container not found');
      return;
    }

    if (this.deals.length === 0) {
      const noDealsText = window.i18n && window.i18n.initialized
        ? window.i18n.t('dealsPage.noDeals')
        : 'No active deals at the moment';
      const checkBackText = window.i18n && window.i18n.initialized
        ? window.i18n.t('dealsPage.checkBack')
        : 'Check back soon for new exclusive offers!';

      this.container.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; color: #999;">
          <p style="font-size: 1.2rem; margin-bottom: 1rem;">🔥 ${noDealsText}</p>
          <p>${checkBackText}</p>
        </div>
      `;
      return;
    }

    // Clear container
    this.container.innerHTML = '';

    // Render each deal card
    this.deals.forEach((deal, index) => {
      const card = this.createDealCard(deal, index);
      this.container.appendChild(card);
    });

    console.log(`✅ Rendered ${this.deals.length} deal cards`);
  }

  createDealCard(deal, index) {
    const article = document.createElement('article');
    article.className = 'companion-card deal-card';
    article.setAttribute('data-companion-id', deal.id);
    article.setAttribute('data-rating', deal.rating);

    // Add staggered animation delay
    if (index > 0) {
      article.style.animationDelay = `${index * 0.2}s`;
    }

    // Generate stars (same as companion cards)
    const stars = this.generateStars(deal.rating);
    const reviewsText = window.i18n && window.i18n.initialized
      ? (deal.review_count === 1 ? window.i18n.t('companionCard.review') : window.i18n.t('companionCard.reviews'))
      : 'reviews';
    const reviewCountText = deal.review_count > 0 ? `(${deal.review_count} ${reviewsText})` : '';

    // Deal badge
    const badges = deal.deal_badge ? `
      <div class="badge-container">
        <span class="badge deal-badge">
          ${this.escapeHtml(deal.deal_badge)}
        </span>
      </div>
    ` : '';

    article.innerHTML = `
      ${badges}
      <div class="card-header">
        <img src="${this.escapeHtml(deal.logo_url)}"
             alt="${this.escapeHtml(deal.name)}"
             class="logo"
             onerror="this.src='/images/logos/default.png'">
        <div class="title-section">
          <h3><a href="/companions/${this.escapeHtml(deal.slug)}">${this.escapeHtml(deal.name)}</a></h3>
          <div class="rating-line">
            <span class="stars">${stars}</span>
            <span class="rating-score">${deal.rating}/10</span>
            ${reviewCountText ? `<span class="review-count">${reviewCountText}</span>` : ''}
          </div>
        </div>
      </div>

      ${deal.deal_description ? `
        <p class="description deal-description">${this.escapeHtml(deal.deal_description)}</p>
      ` : deal.short_description ? `
        <p class="description">${this.escapeHtml(deal.short_description)}</p>
      ` : ''}

      ${deal.best_for ? `
        <div class="best-for-section">
          <span class="best-for-label">💡 ${window.i18n && window.i18n.initialized ? window.i18n.t('dealsPage.bestFor') : 'Best For'}:</span> ${this.escapeHtml(deal.best_for)}
        </div>
      ` : ''}

      <div class="card-actions">
        <a href="${this.escapeHtml(this.getActiveExternalUrl(deal))}"
           class="btn-primary"
           target="_blank"
           rel="noopener noreferrer nofollow"
           onclick="if(typeof gtag !== 'undefined') gtag('event', 'deal_click', {'event_category': 'deals', 'event_label': '${this.escapeHtml(deal.slug)}'});">
          ${window.i18n && window.i18n.initialized ? window.i18n.t('dealsPage.tryButton') : 'Try'} ${this.escapeHtml(deal.name)}
        </a>
        <a href="${this.escapeHtml(this.getActiveExternalUrl(deal))}"
           class="btn-secondary"
           target="_blank"
           rel="noopener noreferrer nofollow"
           onclick="if(typeof gtag !== 'undefined') gtag('event', 'deal_claim', {'event_category': 'deals', 'event_label': '${this.escapeHtml(deal.slug)}'});">
          ${window.i18n && window.i18n.initialized ? window.i18n.t('dealsPage.claimDeal') : 'Claim Deal'}
        </a>
      </div>
    `;

    return article;
  }

  generateStars(rating) {
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

  escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showError(message) {
    if (this.container) {
      this.container.innerHTML = `
        <div style="text-align: center; padding: 4rem 2rem; color: #ff6b6b;">
          <p style="font-size: 1.2rem; margin-bottom: 1rem;">⚠️ Failed to load deals</p>
          <p style="color: #999;">${this.escapeHtml(message)}</p>
          <p style="color: #666; margin-top: 1rem;">Please refresh the page or try again later.</p>
        </div>
      `;
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.deals-container')) {
      const dealsManager = new DealsManager();
      dealsManager.init();

      // Expose to window for debugging
      window.dealsManager = dealsManager;
    }
  });
} else {
  if (document.querySelector('.deals-container')) {
    const dealsManager = new DealsManager();
    dealsManager.init();

    // Expose to window for debugging
    window.dealsManager = dealsManager;
  }
}
