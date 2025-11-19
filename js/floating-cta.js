/**
 * Floating CTA Manager for News Articles
 * Shows a floating call-to-action button linking to /companions
 */

class FloatingCTAManager {
  constructor() {
    this.cta = null;
    this.dismissed = false;
    this.storageKey = 'floatingCTADismissed';
    this.init();
  }

  init() {
    // Check if user has dismissed the CTA
    const dismissedTimestamp = localStorage.getItem(this.storageKey);
    if (dismissedTimestamp) {
      const hoursSinceDismissed = (Date.now() - parseInt(dismissedTimestamp)) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        this.dismissed = true;
        return;
      }
    }

    this.createCTA();
    this.attachEventListeners();
  }

  createCTA() {
    // Create the floating CTA element
    this.cta = document.createElement('div');
    this.cta.className = 'floating-cta';
    this.cta.innerHTML = `
      <div class="floating-cta-header">Companion of the Month</div>
      <div class="floating-cta-content">
        <img src="/images/screenshots/soulkyn-ai-review.png" alt="Soulkyn AI" class="floating-cta-logo">
        <div class="floating-cta-info">
          <div class="floating-cta-name">Soulkyn</div>
          <div class="floating-cta-rating">
            <span class="floating-cta-stars">★★★★★</span>
            <span class="floating-cta-score">9.6</span><span class="floating-cta-score-total">/10</span>
          </div>
        </div>
      </div>
      <div class="floating-cta-buttons">
        <a href="/companions/soulkyn-ai" class="floating-cta-btn floating-cta-btn-review" data-action="review">Full Review</a>
        <a href="https://soulkyn.ai" target="_blank" rel="noopener noreferrer" class="floating-cta-btn floating-cta-btn-website" data-action="website">Visit Website</a>
      </div>
      <span class="floating-cta-close" data-close="true">×</span>
    `;

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
    // Track with Google Analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'cotm_floating_cta_click', {
        event_category: 'Companion of the Month',
        event_label: 'Soulkyn AI',
        companion_name: 'Soulkyn AI',
        action: action,
        value: 1
      });
    }

    // Track with Facebook Pixel if available
    if (typeof fbq !== 'undefined') {
      fbq('track', 'Lead', {
        content_name: `COTM Floating CTA - Soulkyn AI - ${action}`,
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
