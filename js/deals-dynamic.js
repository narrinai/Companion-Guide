/**
 * Deals Page Dynamic URL Loader
 * Updates deal card external links with website_url from Airtable
 */

class DealsManager {
  constructor() {
    this.apiBaseUrl = '/.netlify/functions/companionguide-get';
  }

  async init() {
    try {
      const companions = await this.fetchCompanions();
      this.updateDealLinks(companions);
    } catch (error) {
      console.error('Error initializing deals manager:', error);
    }
  }

  async fetchCompanions() {
    try {
      const response = await fetch(this.apiBaseUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data.companions || [];
    } catch (error) {
      console.error('Error fetching companions:', error);
      return [];
    }
  }

  updateDealLinks(companions) {
    // Find all deal cards with data-deal-id attribute
    const dealCards = document.querySelectorAll('.deal-card[data-deal-id]');

    dealCards.forEach(card => {
      const dealId = card.getAttribute('data-deal-id');

      // Find companion with matching slug
      const companion = companions.find(c => c.slug === dealId);

      if (companion && companion.website_url) {
        // Update the external CTA button (not the "Read Review" button)
        const externalButton = card.querySelector('.deal-cta a[target="_blank"]:not(.btn-secondary)');

        if (externalButton) {
          externalButton.href = companion.website_url;
          console.log(`Updated ${dealId} deal link to: ${companion.website_url}`);
        }

        // Also update rating display if available
        const ratingContainer = card.querySelector(`[data-rating-slug="${dealId}"]`);
        if (ratingContainer && companion.rating) {
          const ratingScore = ratingContainer.querySelector('.rating-score');
          const ratingStars = ratingContainer.querySelector('.rating-stars');

          if (ratingScore) {
            ratingScore.textContent = `${companion.rating}/10`;
          }

          // Update stars based on rating (0-10 scale)
          if (ratingStars) {
            const stars = Math.round(companion.rating / 2); // Convert to 5-star scale
            const fullStars = Math.min(5, stars);
            const emptyStars = 5 - fullStars;
            ratingStars.textContent = '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
          }
        }
      }
    });
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const dealsManager = new DealsManager();
  dealsManager.init();
});
