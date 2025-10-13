/**
 * Companion Header Dynamic Rating Loader
 * Loads dynamic review scores from Airtable for individual companion pages
 */

class CompanionHeaderManager {
  constructor() {
    this.apiBaseUrl = '/.netlify/functions';
  }

  /**
   * Get the companion slug from the current page URL
   */
  getCurrentCompanionSlug() {
    const path = window.location.pathname;
    const segments = path.split('/');
    const companionsIndex = segments.indexOf('companions');

    if (companionsIndex !== -1 && segments[companionsIndex + 1]) {
      return segments[companionsIndex + 1].replace('.html', '');
    }

    return null;
  }

  /**
   * Fetch companion data from Airtable
   */
  async fetchCompanionData(slug) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/get-companions`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const companions = data.companions || [];

      // Find companion by slug
      const companion = companions.find(comp => comp.slug === slug);

      return companion;
    } catch (error) {
      console.error('Error fetching companion data:', error);
      return null;
    }
  }

  /**
   * Generate star rating HTML with half stars
   */
  generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.3; // Show half star for .3 and above
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = '';

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<span class="star-filled">★</span>';
    }

    // Half star
    if (hasHalfStar) {
      starsHtml += '<span class="star-half">★</span>';
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<span class="star-empty">☆</span>';
    }

    return starsHtml;
  }

  /**
   * Update the rating display in the page header
   */
  updateRatingDisplay(companion) {
    const ratingElement = document.querySelector('.rating');

    if (!ratingElement || !companion) {
      return;
    }

    const stars = this.generateStarRating(companion.rating);
    const rating = parseFloat(companion.rating).toFixed(1);

    // Update the rating display
    ratingElement.innerHTML = `${stars} ${rating}/10`;

    // Add a class to indicate it was dynamically loaded
    ratingElement.classList.add('dynamic-rating');

    // Also update verdict section rating if it exists
    const verdictRating = document.querySelector('.dynamic-rating-verdict');
    if (verdictRating) {
      verdictRating.textContent = rating;
      console.log(`Updated verdict rating to ${rating}/10`);
    }

    console.log(`Updated rating for ${companion.name}: ${rating}/10`);
  }

  /**
   * Update structured data with dynamic rating
   */
  updateStructuredData(companion) {
    const structuredDataScript = document.querySelector('script[type="application/ld+json"]');

    if (!structuredDataScript || !companion) {
      return;
    }

    try {
      const structuredData = JSON.parse(structuredDataScript.textContent);

      // Update the rating in structured data
      if (structuredData.reviewRating) {
        structuredData.reviewRating.ratingValue = companion.rating.toString();
      }

      // Update the script content
      structuredDataScript.textContent = JSON.stringify(structuredData, null, 2);

      console.log(`Updated structured data rating for ${companion.name}`);
    } catch (error) {
      console.error('Error updating structured data:', error);
    }
  }

  /**
   * Initialize dynamic rating loading for the current page
   */
  async init() {
    const slug = this.getCurrentCompanionSlug();

    if (!slug) {
      console.log('No companion slug found in URL');
      return;
    }

    console.log(`Loading dynamic rating for companion: ${slug}`);

    try {
      const companion = await this.fetchCompanionData(slug);

      if (companion) {
        this.updateRatingDisplay(companion);
        this.updateStructuredData(companion);
      } else {
        console.warn(`No companion data found for slug: ${slug}`);
      }
    } catch (error) {
      console.error('Error initializing companion header:', error);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const headerManager = new CompanionHeaderManager();
  headerManager.init();
});

// Export for potential use in other scripts
window.CompanionHeaderManager = CompanionHeaderManager;