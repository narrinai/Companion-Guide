class CompanionManager {
  constructor() {
    this.apiBaseUrl = '/.netlify/functions';
    this.companions = [];
  }

  async fetchCompanions(options = {}) {
    try {
      const params = new URLSearchParams();

      if (options.category) params.append('category', options.category);
      if (options.sort) params.append('sort', options.sort);
      if (options.limit) params.append('limit', options.limit);

      const url = `${this.apiBaseUrl}/get-companions${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.companions = data.companions || [];
      return this.companions;
    } catch (error) {
      console.error('Error fetching companions:', error);
      return [];
    }
  }

  generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let starsHtml = '';

    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<span class="star filled">★</span>';
    }

    if (hasHalfStar) {
      starsHtml += '<span class="star half">☆</span>';
    }

    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<span class="star">☆</span>';
    }

    return starsHtml;
  }

  generateBadges(badges) {
    if (!badges || badges.length === 0) return '';

    return badges.map(badge => {
      const badgeClass = badge.toLowerCase().replace(' ', '-');
      return `<span class="companion-badge ${badgeClass}">${badge}</span>`;
    }).join('');
  }

  generatePricingHtml(pricingPlans) {
    if (!pricingPlans) {
      return '<p class="price">Free</p>';
    }

    // Handle if pricingPlans is a string (JSON)
    let plans = pricingPlans;
    if (typeof pricingPlans === 'string') {
      try {
        plans = JSON.parse(pricingPlans);
      } catch (e) {
        return '<p class="price">Free</p>';
      }
    }

    // Ensure plans is an array and has items
    if (!Array.isArray(plans) || plans.length === 0) {
      return '<p class="price">Free</p>';
    }

    const lowestPrice = Math.min(...plans.map(plan => parseFloat(plan.price || 0)));
    return `<p class="price">From $${lowestPrice}/month</p>`;
  }

  generateCompanionCard(companion) {
    const starRating = this.generateStarRating(companion.rating);
    const badges = this.generateBadges(companion.badges);
    const pricing = this.generatePricingHtml(companion.pricing_plans);
    const logoUrl = companion.logo_url || companion.image_url; // Use logo_url or fallback to image_url
    const reviewCountText = companion.review_count > 0 ? ` (${companion.review_count} reviews)` : '';

    return `
      <div class="companion-card" data-companion-id="${companion.id}">
        <div class="companion-image">
          <img src="${logoUrl}" alt="${companion.name}" loading="lazy">
          ${badges}
        </div>
        <div class="companion-info">
          <h3><a href="/companions/${companion.slug}">${companion.name}</a></h3>
          <div class="rating">
            ${starRating}
            <span class="rating-value">${companion.rating}/5${reviewCountText}</span>
          </div>
          <p class="description">${companion.short_description || 'AI companion platform'}</p>
          ${pricing}
          <div class="companion-actions">
            <a href="${companion.website_url}" class="btn btn-primary" target="_blank" rel="noopener">Try ${companion.name}</a>
            <a href="/companions/${companion.slug}" class="btn btn-secondary">Full Review</a>
          </div>
        </div>
      </div>
    `;
  }

  async renderFeaturedCompanions(containerId, limit = 6) {
    const companions = await this.fetchCompanions({
      sort: 'rating',
      limit: limit
    });

    const featuredCompanions = companions.filter(c => c.featured);

    const container = document.getElementById(containerId);
    if (!container) return;

    if (featuredCompanions.length === 0) {
      container.innerHTML = '<p>No featured companions available.</p>';
      return;
    }

    container.innerHTML = featuredCompanions.map(companion =>
      this.generateCompanionCard(companion)
    ).join('');
  }

  async renderCompanionsByCategory(containerId, category, limit = null) {
    // Fetch all companions and filter client-side temporarily
    const allCompanions = await this.fetchCompanions({
      sort: 'rating'
    });

    // Filter by category client-side
    const companions = allCompanions.filter(comp =>
      comp.categories && comp.categories.includes(category)
    ).slice(0, limit || allCompanions.length);

    const container = document.getElementById(containerId);
    if (!container) return;

    if (companions.length === 0) {
      container.innerHTML = '<p>No companions found in this category.</p>';
      return;
    }

    container.innerHTML = companions.map(companion =>
      this.generateCompanionCard(companion)
    ).join('');
  }

  async renderAllCompanions(containerId, sortBy = 'rating') {
    const companions = await this.fetchCompanions({
      sort: sortBy
    });

    const container = document.getElementById(containerId);
    if (!container) return;

    if (companions.length === 0) {
      container.innerHTML = '<p>No companions available.</p>';
      return;
    }

    container.innerHTML = companions.map(companion =>
      this.generateCompanionCard(companion)
    ).join('');
  }

  initializeFilters() {
    const sortSelect = document.getElementById('companion-sort');
    const categoryFilter = document.getElementById('category-filter');

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.renderAllCompanions('companions-container', e.target.value);
      });
    }

    if (categoryFilter) {
      categoryFilter.addEventListener('change', (e) => {
        const category = e.target.value;
        if (category === 'all') {
          this.renderAllCompanions('companions-container');
        } else {
          this.renderCompanionsByCategory('companions-container', category);
        }
      });
    }
  }
}

window.companionManager = new CompanionManager();