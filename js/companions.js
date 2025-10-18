class CompanionManager {
  constructor() {
    this.apiBaseUrl = '/.netlify/functions/companionguide';
    this.companions = [];
  }

  async fetchCompanions(options = {}) {
    try {
      const params = new URLSearchParams();

      if (options.category) params.append('category', options.category);
      if (options.sort) params.append('sort', options.sort);
      if (options.limit) params.append('limit', options.limit);

      const url = `${this.apiBaseUrl}-get${params.toString() ? '?' + params.toString() : ''}`;
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

  async fetchCompanionById(companionId) {
    try {
      // First try to find in cached companions
      if (this.companions && this.companions.length > 0) {
        const cached = this.companions.find(c => c.id === companionId || c.slug === companionId);
        if (cached) return cached;
      }

      // If not cached, fetch all companions and search
      const allCompanions = await this.fetchCompanions();
      const companion = allCompanions.find(c => c.id === companionId || c.slug === companionId);

      return companion || null;
    } catch (error) {
      console.error(`Error fetching companion ${companionId}:`, error);
      return null;
    }
  }

  generateStarRating(rating) {
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

  generateBadges(badges) {
    if (!badges || badges.length === 0) return '';

    // Show only the highest priority badge (same logic as generateCategoryBadges)
    for (const badge of badges) {
      if (badge.toLowerCase().includes('adult') || badge.toLowerCase().includes('nsfw')) {
        return '<div class="product-badge"><svg class="icon"><use href="#icon-adult"/></svg> <span>Adult</span></div>';
      } else if (badge.toLowerCase().includes('popular')) {
        return '<div class="product-badge"><svg class="icon"><use href="#icon-popular"/></svg> <span>Popular</span></div>';
      } else if (badge.toLowerCase().includes('premium')) {
        return '<div class="product-badge"><svg class="icon"><use href="#icon-premium"/></svg> <span>Premium</span></div>';
      } else if (badge.toLowerCase().includes('new')) {
        return '<div class="product-badge"><svg class="icon"><use href="#icon-new"/></svg> <span>New</span></div>';
      } else if (badge.toLowerCase().includes('global')) {
        return '<div class="product-badge"><svg class="icon"><use href="#icon-global"/></svg> <span>Global</span></div>';
      } else if (badge.toLowerCase().includes('character')) {
        return '<div class="product-badge"><svg class="icon"><use href="#icon-characters"/></svg> <span>Characters</span></div>';
      }
    }

    // If no special badges found, show the first badge
    const firstBadge = badges[0];
    return `<div class="product-badge"><svg class="icon"><use href="#icon-new"/></svg> <span>${firstBadge}</span></div>`;
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

    // Generate star rating with half stars
    const starRating = this.generateStarRating(companion.rating);

    return `
      <article class="companion-card" data-companion-id="${companion.id}">
        ${badges}
        <div class="card-header">
          <img src="${logoUrl}" alt="${companion.name}" class="logo">
          <div class="title-section">
            <h3><a href="/companions/${slug}">${companion.name}</a></h3>
            <div class="rating-line">
              <span class="stars">${starRating}</span>
              <span class="rating-score">${companion.rating}/10</span>
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
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      // Use cached companions if available, otherwise fetch
      let allCompanions = this.companions;
      if (!allCompanions || allCompanions.length === 0) {
        allCompanions = await this.fetchCompanions({
          sort: 'rating'
        });
      }

      console.log('Total companions loaded:', allCompanions.length); // Debug
      console.log('Featured companions found:', allCompanions.filter(c => c.featured).length); // Debug

      const featuredCompanions = allCompanions
        .filter(c => c.featured === true || c.featured === 'true') // Handle both boolean and string
        .slice(0, limit); // Apply limit after filtering

      if (featuredCompanions.length === 0) {
        // Show debug info
        console.log('No featured companions found. Showing first 8 companions instead.'); // Debug

        // Fallback: show top 8 companions by rating if no featured ones
        const topCompanions = allCompanions.slice(0, limit);
        container.innerHTML = topCompanions.map(companion =>
          this.generateCompanionCard(companion)
        ).join('');
        return;
      }

      container.innerHTML = featuredCompanions.map(companion =>
        this.generateCompanionCard(companion)
      ).join('');
    } catch (error) {
      console.error('Error loading featured companions:', error);
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #666;">
          <div style="font-size: 32px; margin-bottom: 15px;">⚠️</div>
          <h3>Unable to Load Featured Companions</h3>
          <p>Error: ${error.message}</p>
        </div>
      `;
    }
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

  generateCategoryBadges(companion, index) {
    // #1 always gets Leader badge
    if (index === 0) {
      return '<div class="product-badge">#1 <svg class="icon"><use href="#icon-leader"/></svg> Leader</div>';
    }

    // For other positions, check for special badges first, otherwise use ranking
    if (companion.badges && Array.isArray(companion.badges)) {
      // Priority order: Adult > Popular > Premium > New > Global > Characters > Other
      for (const badge of companion.badges) {
        if (badge.toLowerCase().includes('adult') || badge.toLowerCase().includes('nsfw')) {
          return '<div class="product-badge"><svg class="icon"><use href="#icon-adult"/></svg> Adult</div>';
        } else if (badge.toLowerCase().includes('popular')) {
          return '<div class="product-badge"><svg class="icon"><use href="#icon-popular"/></svg> Popular</div>';
        } else if (badge.toLowerCase().includes('premium')) {
          return '<div class="product-badge"><svg class="icon"><use href="#icon-premium"/></svg> Premium</div>';
        } else if (badge.toLowerCase().includes('new')) {
          return '<div class="product-badge"><svg class="icon"><use href="#icon-new"/></svg> New</div>';
        } else if (badge.toLowerCase().includes('global')) {
          return '<div class="product-badge"><svg class="icon"><use href="#icon-global"/></svg> Global</div>';
        } else if (badge.toLowerCase().includes('character')) {
          return '<div class="product-badge"><svg class="icon"><use href="#icon-characters"/></svg> Characters</div>';
        }
      }
    }

    // Use ranking badge as fallback
    return `<div class="product-badge">#${index + 1}</div>`;
  }

  generateCategoryCompanionCard(companion, index) {
    const logoUrl = companion.logo_url || companion.image_url || '/images/logos/default.png';
    const reviewCountText = companion.review_count > 0 ? ` (${companion.review_count} reviews)` : '';
    const pricing = this.generatePricingHtml(companion.pricing_plans);

    // Use slug from Airtable, fallback to 'unknown' if not present
    const slug = companion.slug || 'unknown';

    // Generate star rating with half stars
    const starRating = this.generateStarRating(companion.rating);

    // Generate badges
    const badgeHtml = this.generateCategoryBadges(companion, index);

    // Add leader class for first item
    const cardClass = index === 0 ? 'companion-product-card leader' : 'companion-product-card';

    return `
      <article class="${cardClass}">
        ${badgeHtml}
        <div class="product-header">
          <img src="${logoUrl}" alt="${companion.name} logo" class="product-logo">
          <div class="product-title-section">
            <h3><a href="../companions/${slug}">${companion.name}</a></h3>
            <div class="product-rating">
              <span class="stars">${starRating}</span>
              <span class="rating-score">${companion.rating}/10</span>
              <span class="rating-count">${reviewCountText}</span>
            </div>
            <p class="product-tagline">${companion.short_description || 'AI companion platform'}</p>
          </div>
        </div>

        <div class="product-content">
          <p class="product-description">${companion.description || companion.short_description || 'AI companion platform'}</p>

          ${this.generateCategoryFeatureHighlights(companion.features)}

          <div class="product-pricing">
            <div class="pricing-main">${pricing.replace('<p class="price">', '').replace('</p>', '')}</div>
            <div class="pricing-sub">Premium plans available</div>
          </div>

          <div class="product-actions">
            <a href="../companions/${slug}" class="btn-primary">Read Review</a>
            <a href="${companion.website_url}" class="btn-secondary" target="_blank">Visit Website</a>
          </div>
        </div>
      </article>
    `;
  }

  generateCategoryFeatureHighlights(features) {
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

    // Limit to first 4 features for category pages
    const limitedFeatures = featureList.slice(0, 4);

    const featureItems = limitedFeatures.map(feature => `
      <div class="highlight-item">
        <span class="highlight-icon">${feature.icon || '⭐'}</span>
        <div>
          <strong>${feature.title}</strong>
          <p>${feature.description}</p>
        </div>
      </div>
    `).join('');

    return `
      <div class="product-highlights compact">
        ${featureItems}
      </div>
    `;
  }

  async renderCategoryCompanions(containerId, category, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      // Add loading skeletons
      container.innerHTML = this.generateCategorySkeletons(limit || 8);

      // Fetch all companions and filter by category
      const allCompanions = await this.fetchCompanions({
        sort: 'rating'
      });

      // Filter by category client-side
      const companions = allCompanions.filter(comp =>
        comp.categories && comp.categories.includes(category)
      ).slice(0, limit || allCompanions.length);

      if (companions.length === 0) {
        container.innerHTML = '<p>No companions found in this category.</p>';
        return;
      }

      // Render companions with proper indexing for badges
      container.innerHTML = companions.map((companion, index) =>
        this.generateCategoryCompanionCard(companion, index)
      ).join('');

    } catch (error) {
      console.error('Error loading category companions:', error);
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: #666;">
          <div style="font-size: 32px; margin-bottom: 15px;">⚠️</div>
          <h3>Unable to Load Companions</h3>
          <p>Error: ${error.message}</p>
        </div>
      `;
    }
  }

  generateCategorySkeletons(count = 8) {
    const skeleton = `
      <article class="companion-product-card" style="background: #1a1a1a; border: 1px solid #333; animation: shimmer 2s ease-in-out infinite; position: relative; overflow: hidden;">
        <div style="background: #2d2d2d; height: 30px; width: 80px; margin-bottom: 16px; border-radius: 4px;"></div>
        <div style="display: flex; gap: 16px; margin-bottom: 16px;">
          <div style="background: #2d2d2d; width: 60px; height: 60px; border-radius: 8px;"></div>
          <div style="flex: 1;">
            <div style="background: #2d2d2d; height: 20px; width: 70%; margin-bottom: 8px; border-radius: 4px;"></div>
            <div style="background: #2d2d2d; height: 16px; width: 50%; margin-bottom: 8px; border-radius: 4px;"></div>
            <div style="background: #2d2d2d; height: 14px; width: 60%; border-radius: 4px;"></div>
          </div>
        </div>
        <div style="background: #2d2d2d; height: 40px; margin-bottom: 16px; border-radius: 4px;"></div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px;">
          <div style="background: #2d2d2d; height: 60px; border-radius: 4px;"></div>
          <div style="background: #2d2d2d; height: 60px; border-radius: 4px;"></div>
          <div style="background: #2d2d2d; height: 60px; border-radius: 4px;"></div>
          <div style="background: #2d2d2d; height: 60px; border-radius: 4px;"></div>
        </div>
        <div style="display: flex; gap: 12px;">
          <div style="background: #2d2d2d; height: 36px; flex: 1; border-radius: 6px;"></div>
          <div style="background: #2d2d2d; height: 36px; flex: 1; border-radius: 6px;"></div>
        </div>
      </article>
    `;

    return Array(count).fill(skeleton).join('');
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

  async updateCategoryCounts() {
    try {
      // Use cached companions if available, otherwise fetch
      let allCompanions = this.companions;
      if (!allCompanions || allCompanions.length === 0) {
        allCompanions = await this.fetchCompanions({
          sort: 'rating'
        });
      }

      // Count companions per category (mapping category names to expected IDs)
      const categoryCounts = {
        'roleplaying': 0,
        'wellness': 0,
        'learning': 0,
        'ai-girlfriend': 0,
        'ai-boyfriend': 0,
        'whatsapp': 0,
        'image-gen': 0,
        'nsfw': 0,
        'video': 0,
        'porn': 0,
        'hentai': 0
      };

      // Map category names from Airtable to our internal category keys
      const categoryMapping = {
        'roleplay': 'roleplaying',
        'roleplay-character-chat': 'roleplaying',
        'character-chat': 'roleplaying',
        'wellness': 'wellness',
        'mental-health': 'wellness',
        'learning': 'learning',
        'education': 'learning',
        'ai-girlfriend': 'ai-girlfriend',
        'girlfriend': 'ai-girlfriend',
        'ai-boyfriend': 'ai-boyfriend',
        'boyfriend': 'ai-boyfriend',
        'whatsapp': 'whatsapp',
        'whatsapp-only': 'whatsapp',
        'image-generation': 'image-gen',
        'adult-image': 'image-gen',
        'nsfw': 'nsfw',
        'adult-content': 'nsfw',
        'uncensored': 'nsfw',
        'video': 'video',
        'video-chat': 'video',
        'porn': 'porn',
        'hentai': 'hentai'
      };

      allCompanions.forEach(companion => {
        if (companion.categories && Array.isArray(companion.categories)) {
          companion.categories.forEach(category => {
            // Use the mapping to convert category names to our internal keys
            const mappedCategory = categoryMapping[category.toLowerCase()] || category.toLowerCase();
            if (categoryCounts.hasOwnProperty(mappedCategory)) {
              categoryCounts[mappedCategory]++;
            }
          });
        }
      });

      // Update the DOM elements with counts (both categories page and index page)
      Object.keys(categoryCounts).forEach(category => {
        // Categories page
        const element = document.getElementById(`${category}-count`);
        if (element) {
          const count = categoryCounts[category];
          const platformText = count === 1 ? 'Platform' : 'Platforms';
          element.textContent = `${count} ${platformText}`;
        }

        // Index page
        const indexElement = document.getElementById(`${category}-count-index`);
        if (indexElement) {
          const count = categoryCounts[category];
          const platformText = count === 1 ? 'Platform' : 'Platforms';
          indexElement.textContent = `${count} ${platformText}`;
        }
      });

    } catch (error) {
      console.error('Error updating category counts:', error);
      // Fallback to show error state for both pages
      const categoryIds = ['roleplaying-count', 'wellness-count', 'learning-count', 'ai-girlfriend-count', 'ai-boyfriend-count', 'whatsapp-count', 'image-gen-count', 'nsfw-count', 'video-count', 'porn-count', 'hentai-count'];
      const indexCategoryIds = ['roleplaying-count-index', 'wellness-count-index', 'learning-count-index', 'ai-girlfriend-count-index', 'ai-boyfriend-count-index', 'whatsapp-count-index', 'image-gen-count-index', 'nsfw-count-index', 'video-count-index', 'porn-count-index', 'hentai-count-index'];

      categoryIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = 'N/A';
        }
      });

      indexCategoryIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
          element.textContent = 'N/A';
        }
      });
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

  async renderFooterFeaturedCompanions(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    try {
      // Use cached companions if available, otherwise fetch
      let allCompanions = this.companions;
      if (!allCompanions || allCompanions.length === 0) {
        allCompanions = await this.fetchCompanions({
          sort: 'rating'
        });
      }

      const featuredCompanions = allCompanions
        .filter(c => c.is_featured === true || c.is_featured === 'true' || c.featured === true || c.featured === 'true');

      if (featuredCompanions.length === 0) {
        console.log('No featured companions found for footer. Using fallback.');
        return; // Keep static content as fallback
      }

      // Generate simple footer links for featured companions
      const footerHTML = featuredCompanions.map(companion => {
        const companionName = companion.name || companion.title || 'Unknown';
        const companionSlug = companion.slug || companion.name?.toLowerCase().replace(/\s+/g, '-') || 'unknown';

        return `<li><a href="/companions/${companionSlug}">${companionName}</a></li>`;
      }).join('');

      container.innerHTML = footerHTML;

    } catch (error) {
      console.error('Error loading footer featured companions:', error);
      // Keep static content on error
    }
  }
}

window.companionManager = new CompanionManager();