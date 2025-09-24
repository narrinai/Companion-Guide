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
      // Map badge types to the original styling
      let badgeHtml = '';
      if (badge.toLowerCase().includes('adult') || badge.toLowerCase().includes('nsfw')) {
        badgeHtml = '<div class="product-badge">🔞 <span>Adult</span></div>';
      } else if (badge.toLowerCase().includes('popular')) {
        badgeHtml = '<div class="product-badge">🔥 <span>Popular</span></div>';
      } else if (badge.toLowerCase().includes('new')) {
        badgeHtml = '<div class="product-badge">✨ <span>New</span></div>';
      } else {
        badgeHtml = `<div class="product-badge">⭐ <span>${badge}</span></div>`;
      }
      return badgeHtml;
    }).join('');
  }

  generateFeatureHighlights(features) {
    if (!features || features.length === 0) return '';

    // Handle if features is a string (JSON)
    let featureList = features;
    if (typeof features === 'string') {
      try {
        featureList = JSON.parse(features);
      } catch (e) {
        return '';
      }
    }

    // Ensure featureList is an array and has items
    if (!Array.isArray(featureList) || featureList.length === 0) {
      return '';
    }

    const featureItems = featureList.map(feature => `
      <div class="feature-item">
        <div class="feature-icon">${feature.icon || '⭐'}</div>
        <div class="feature-title">${feature.title}</div>
        <div class="feature-desc">${feature.description}</div>
      </div>
    `).join('');

    return `
      <div class="feature-highlights">
        ${featureItems}
      </div>
    `;
  }

  generatePricingHtml(pricingPlans) {
    if (!pricingPlans) {
      return 'Free trial';
    }

    // Handle if pricingPlans is a string (JSON)
    let plans = pricingPlans;
    if (typeof pricingPlans === 'string') {
      try {
        plans = JSON.parse(pricingPlans);
      } catch (e) {
        return 'Free trial';
      }
    }

    // Ensure plans is an array and has items
    if (!Array.isArray(plans) || plans.length === 0) {
      return 'Free trial';
    }

    const lowestPrice = Math.min(...plans.map(plan => parseFloat(plan.price || 0)));

    // Show "Free trial" if lowest price is 0, otherwise show "From $X/month"
    if (lowestPrice === 0) {
      return 'Free trial';
    } else {
      return `From $${lowestPrice}/month`;
    }
  }

  generateCompanionCard(companion) {
    const logoUrl = companion.logo_url || companion.image_url || '/images/logos/default.png';
    const reviewCountText = companion.review_count > 0 ? ` (${companion.review_count} reviews)` : '';
    const badges = this.generateBadges(companion.badges);
    const pricing = this.generatePricingHtml(companion.pricing_plans);

    // Use slug from Airtable, fallback to 'unknown' if not present
    const slug = companion.slug || 'unknown';

    // Generate star rating using filled stars
    const fullStars = Math.floor(companion.rating);
    const starRating = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);

    return `
      <article class="companion-card" data-companion-id="${companion.id}">
        ${badges}
        <div class="card-header">
          <img src="${logoUrl}" alt="${companion.name}" class="logo">
          <div class="title-section">
            <h3><a href="/companions/${slug}">${companion.name}</a></h3>
            <div class="rating-line">
              <span class="stars">${starRating}</span>
              <span class="rating-score">${companion.rating}/5</span>
              <span class="review-count">${reviewCountText}</span>
            </div>
          </div>
        </div>
        <p class="description">${companion.description || companion.short_description || 'AI companion platform'}</p>

        ${this.generateFeatureHighlights(companion.features)}

        <div class="pricing-section">
          <div class="price-main">${pricing.replace('<p class="price">', '').replace('</p>', '')}</div>
        </div>

        <div class="card-actions">
          <a href="/companions/${slug}" class="btn-primary">Read Review</a>
          <a href="${companion.website_url}" class="btn-secondary" target="_blank" rel="noopener">Visit Website</a>
        </div>
      </article>
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
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      // First load: Get first 12 companions for fast initial render
      console.log('Loading initial 12 companions...'); // Debug
      const initialCompanions = await this.fetchCompanions({
        sort: sortBy,
        limit: 12
      });

      console.log('Loaded initial companions:', initialCompanions.length); // Debug

      if (initialCompanions.length === 0) {
        container.innerHTML = '<p>No companions available.</p>';
        return;
      }

      // Render initial companions immediately
      container.innerHTML = initialCompanions.map(companion =>
        this.generateCompanionCard(companion)
      ).join('');

      console.log('Rendered initial companions'); // Debug

      // Add loading indicator for remaining companions
      const loadingIndicator = document.createElement('div');
      loadingIndicator.id = 'loading-more';
      loadingIndicator.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #666;">
          <div style="font-size: 24px; margin-bottom: 10px;">⏳</div>
          <p>Loading more companions...</p>
        </div>
      `;
      container.appendChild(loadingIndicator);

      // Load remaining companions
      setTimeout(async () => {
        try {
          const allCompanions = await this.fetchCompanions({
            sort: sortBy
          });

          const remainingCompanions = allCompanions.slice(12);

          if (remainingCompanions.length > 0) {
            const remainingHtml = remainingCompanions.map(companion =>
              this.generateCompanionCard(companion)
            ).join('');

            // Remove loading indicator and add remaining companions
            loadingIndicator.remove();
            container.insertAdjacentHTML('beforeend', remainingHtml);
          } else {
            loadingIndicator.remove();
          }
        } catch (error) {
          console.error('Error loading remaining companions:', error);
          loadingIndicator.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #999;">
              <p>Some companions could not be loaded.</p>
            </div>
          `;
        }
      }, 500); // Small delay to show the first batch loading

    } catch (error) {
      console.error('Error loading initial companions:', error);
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: #666;">
          <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
          <h3>Unable to Load Companions</h3>
          <p>There was an error loading the companion data. Please try again later.</p>
        </div>
      `;
    }
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