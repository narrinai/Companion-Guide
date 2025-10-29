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
    this.cta = document.createElement('a');
    this.cta.href = '/companions';
    this.cta.className = 'floating-cta';
    this.cta.innerHTML = `
      <span>New Best-Rated Companions</span>
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

    // Track clicks
    this.cta.addEventListener('click', (e) => {
      if (!e.target.hasAttribute('data-close')) {
        this.trackClick();
      }
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

  trackClick() {
    // Track with Google Analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'click', {
        event_category: 'Floating CTA',
        event_label: 'News Article - Companions Link',
        value: 1
      });
    }

    // Track with Facebook Pixel if available
    if (typeof fbq !== 'undefined') {
      fbq('track', 'ViewContent', {
        content_name: 'Floating CTA Click',
        content_category: 'News Article'
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
