/**
 * Floating CTA Manager for News Articles
 * Shows a floating call-to-action button linking to /companions
 */

class FloatingCTAManager {
  constructor() {
    this.cta = null;
    this.dismissed = false;
    this.storageKey = 'floatingCTADismissed';
    this.cotmData = null;
    this.init();
  }

  async init() {
    // Check if user has dismissed the CTA
    const dismissedTimestamp = localStorage.getItem(this.storageKey);
    if (dismissedTimestamp) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTimestamp)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        this.dismissed = true;
        return;
      }
    }

    // Fetch COTM data from Airtable
    await this.fetchCOTMData();

    if (this.cotmData) {
      this.createCTA();
      this.attachEventListeners();
    }
  }

  async fetchCOTMData() {
    try {
      // Wait for companionManager to be available (with timeout)
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max wait

      while (!window.companionManager && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.companionManager) {
        console.warn('CompanionManager not available for floating CTA after timeout');
        return;
      }

      // Fetch companions data
      let allCompanions = window.companionManager.companions;

      if (!allCompanions || allCompanions.length === 0) {
        allCompanions = await window.companionManager.fetchCompanions({
          sort: 'rating'
        });
      }

      // Find companion with is_month = true
      this.cotmData = allCompanions.find(c => c.is_month === true);

      if (!this.cotmData) {
        console.warn('No Companion of the Month found');
      }
    } catch (error) {
      console.error('Error fetching COTM data for floating CTA:', error);
    }
  }

  createCTA() {
    if (!this.cotmData) return;

    // Create the floating CTA element
    this.cta = document.createElement('div');
    this.cta.className = 'floating-cta';

    // Get data from COTM
    const name = this.cotmData.name || 'Companion';
    const slug = this.cotmData.slug || '';
    const rating = this.cotmData.rating || 0;
    const logo = this.cotmData.logo || `/images/screenshots/${slug}-review.png`;
    const websiteUrl = this.cotmData.website_url || '#';

    // Generate star rating (convert 0-10 scale to 0-5 stars)
    const fullStars = Math.floor(rating / 2);
    const stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);

    this.cta.innerHTML = `
      <div class="floating-cta-header">Companion of the Month</div>
      <div class="floating-cta-content">
        <img src="${logo}" alt="${this.escapeHtml(name)}" class="floating-cta-logo">
        <div class="floating-cta-info">
          <div class="floating-cta-name">${this.escapeHtml(name)}</div>
          <div class="floating-cta-rating">
            <span class="floating-cta-stars">${stars}</span>
            <span class="floating-cta-score">${rating.toFixed(1)}</span><span class="floating-cta-score-total">/10</span>
          </div>
        </div>
      </div>
      <div class="floating-cta-buttons">
        <a href="/companions/${slug}" class="floating-cta-btn floating-cta-btn-review" data-action="review">Full Review</a>
        <a href="${websiteUrl}" target="_blank" rel="noopener noreferrer" class="floating-cta-btn floating-cta-btn-website" data-action="website">Visit Website</a>
      </div>
      <span class="floating-cta-close" data-close="true">×</span>
    `;

    document.body.appendChild(this.cta);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

    // Hide CTA when near footer
    window.addEventListener('scroll', () => this.handleScroll());

    // Track button clicks
    const buttons = this.cta.querySelectorAll('[data-action]');
    buttons.forEach(button => {
      button.addEventListener('click', (e) => {
        const action = button.getAttribute('data-action');
        this.trackClick(action);
      });
    });
  }

  handleScroll() {
    if (!this.cta || this.dismissed) return;

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

  trackClick(action) {
    const companionName = this.cotmData ? this.cotmData.name : 'Unknown';

    // Track with Google Analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'cotm_floating_cta_click', {
        event_category: 'Companion of the Month',
        event_label: companionName,
        companion_name: companionName,
        action: action,
        value: 1
      });
    }

    // Track with Facebook Pixel if available
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead', {
        content_name: `COTM Floating CTA - ${companionName} - ${action}`,
        content_category: 'Companion of the Month',
        value: 1.00,
        currency: 'USD'
      });
    }
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new FloatingCTAManager();
  });
} else {
  new FloatingCTAManager();
}
