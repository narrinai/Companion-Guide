/**
 * Blog Post Manager
 * Manages dynamic content injection for blog posts from Airtable data
 */

class BlogPostManager {
  constructor() {
    this.companionManager = null;
    this.companions = {};
  }

  async initialize() {
    if (typeof window.companionManager === "undefined") {
      window.companionManager = new CompanionManager();
    }
    this.companionManager = window.companionManager;

    // Fetch all companions data once
    const allCompanions = await this.companionManager.fetchCompanions();

    // Create a lookup object by slug for easy access
    allCompanions.forEach(companion => {
      if (companion.slug) {
        this.companions[companion.slug] = companion;
      }
    });

    return this;
  }

  /**
   * Get companion data by slug
   */
  getCompanion(slug) {
    return this.companions[slug] || null;
  }

  /**
   * Get multiple companions by slugs
   */
  getCompanions(slugs) {
    return slugs.map(slug => this.getCompanion(slug)).filter(c => c !== null);
  }

  /**
   * Replace companion name in text
   * Handles formats like: <span data-companion="replika" data-field="name"></span>
   */
  injectCompanionName(element, companionSlug) {
    const companion = this.getCompanion(companionSlug);
    if (companion && companion.name) {
      element.textContent = companion.name;
    }
  }

  /**
   * Replace companion rating in text
   * Handles formats like: <span data-companion="replika" data-field="rating"></span>
   */
  injectCompanionRating(element, companionSlug) {
    const companion = this.getCompanion(companionSlug);
    if (companion && companion.rating) {
      element.textContent = companion.rating;
    }
  }

  /**
   * Replace companion link href
   * Handles formats like: <a data-companion="replika" data-field="page_url">...</a>
   */
  injectCompanionPageLink(element, companionSlug) {
    const companion = this.getCompanion(companionSlug);
    if (companion && companion.slug) {
      element.href = `/companions/${companion.slug}`;
    }
  }

  /**
   * Replace companion website URL
   * Handles formats like: <a data-companion="replika" data-field="website_url">...</a>
   */
  injectCompanionWebsiteLink(element, companionSlug) {
    const companion = this.getCompanion(companionSlug);
    if (companion && companion.website_url) {
      element.href = companion.website_url;
      // Add target="_blank" for external links
      if (!element.hasAttribute('target')) {
        element.setAttribute('target', '_blank');
      }
    }
  }

  /**
   * Replace pricing text
   * Handles formats like: <span data-companion="replika" data-field="pricing"></span>
   */
  injectCompanionPricing(element, companionSlug) {
    const companion = this.getCompanion(companionSlug);
    if (companion && companion.pricing_simple) {
      element.textContent = companion.pricing_simple;
    }
  }

  /**
   * Replace logo URL in img element
   * Handles formats like: <img data-companion="replika" data-field="logo_url" alt="...">
   */
  injectCompanionLogo(element, companionSlug) {
    const companion = this.getCompanion(companionSlug);
    if (companion && companion.logo_url) {
      element.src = companion.logo_url;
    }
  }

  /**
   * Inject features into a container
   * Handles formats like: <div data-companion="soulkyn-ai" data-field="features"></div>
   */
  injectCompanionFeatures(element, companionSlug) {
    const companion = this.getCompanion(companionSlug);
    if (!companion || !companion.features) {
      console.warn(`No features found for ${companionSlug}`);
      return;
    }

    let features = companion.features;

    // Parse if string
    if (typeof features === 'string') {
      try {
        features = JSON.parse(features);
      } catch (e) {
        console.error(`Failed to parse features for ${companionSlug}:`, e);
        return;
      }
    }

    if (!Array.isArray(features)) {
      console.warn(`Features for ${companionSlug} is not an array`);
      return;
    }

    // Generate HTML for features
    const featuresHtml = features.map(feature => `
      <div class="deal-feature-item">
        <div class="deal-feature-icon">${feature.icon || ''}</div>
        <div class="deal-feature-title">${feature.title || ''}</div>
        <div class="deal-feature-desc">${feature.description || ''}</div>
      </div>
    `).join('');

    element.innerHTML = featuresHtml;
    console.log(`✅ Injected ${features.length} features for ${companionSlug}`);
  }

  /**
   * Populate a comparison table
   * Table should have data-table="comparison" and data-companions="replika,character-ai,hammer-ai"
   */
  populateComparisonTable(table) {
    const companionSlugs = table.getAttribute('data-companions');
    if (!companionSlugs) return;

    const slugs = companionSlugs.split(',').map(s => s.trim());
    const companions = this.getCompanions(slugs);

    if (companions.length === 0) return;

    // Find tbody or create one
    let tbody = table.querySelector('tbody');
    if (!tbody) {
      tbody = table.querySelector('table tbody') || table.querySelector('tbody');
    }

    if (!tbody) {
      console.warn('No tbody found in comparison table');
      return;
    }

    // Clear existing dynamic rows (keep static content)
    const existingRows = tbody.querySelectorAll('tr[data-dynamic="true"]');
    existingRows.forEach(row => row.remove());

    // Add companion rows
    companions.forEach(companion => {
      const row = document.createElement('tr');
      row.setAttribute('data-dynamic', 'true');

      row.innerHTML = `
        <td style="padding: 10px; border: 1px solid var(--border-color);">
          <strong><a href="/companions/${companion.slug}">${companion.name}</a></strong>
        </td>
        <td style="padding: 10px; border: 1px solid var(--border-color);">${companion.rating || 'N/A'}</td>
        <td style="padding: 10px; border: 1px solid var(--border-color);">${companion.pricing_simple || 'N/A'}</td>
        <td style="padding: 10px; border: 1px solid var(--border-color);">${companion.best_for || 'N/A'}</td>
        <td style="padding: 10px; border: 1px solid var(--border-color);">${companion.content_policy || 'N/A'}</td>
        <td style="padding: 10px; border: 1px solid var(--border-color);">${companion.voice_chat ? '✅' : '❌'}</td>
      `;

      tbody.appendChild(row);
    });
  }

  /**
   * Process all dynamic elements on the page
   */
  async processDynamicElements() {
    await this.initialize();

    // Process all elements with data-companion attribute
    const elements = document.querySelectorAll('[data-companion]');

    elements.forEach(element => {
      const companionSlug = element.getAttribute('data-companion');
      const field = element.getAttribute('data-field');

      if (!companionSlug || !field) return;

      switch (field) {
        case 'name':
          this.injectCompanionName(element, companionSlug);
          break;
        case 'rating':
          this.injectCompanionRating(element, companionSlug);
          break;
        case 'page_url':
          this.injectCompanionPageLink(element, companionSlug);
          break;
        case 'website_url':
          this.injectCompanionWebsiteLink(element, companionSlug);
          break;
        case 'pricing':
          this.injectCompanionPricing(element, companionSlug);
          break;
        case 'logo_url':
          this.injectCompanionLogo(element, companionSlug);
          break;
        case 'features':
          this.injectCompanionFeatures(element, companionSlug);
          break;
      }
    });

    // Process comparison tables
    const comparisonTables = document.querySelectorAll('[data-table="comparison"]');
    comparisonTables.forEach(table => {
      this.populateComparisonTable(table);
    });
  }

  /**
   * Create a companion card for blog posts
   */
  createCompanionCard(companion, options = {}) {
    const {
      showRating = true,
      showPricing = true,
      showWebsiteLink = true
    } = options;

    return `
      <div class="companion-card" style="background: var(--bg-surface); padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid var(--border-secondary);">
        <div style="display: flex; align-items: center; gap: 20px;">
          ${companion.logo_url ? `<img src="${companion.logo_url}" alt="${companion.name} logo" style="width: 80px; height: 80px; object-fit: contain; border-radius: 8px;">` : ''}
          <div style="flex: 1;">
            <h3 style="margin: 0 0 10px 0;">
              <a href="/companions/${companion.slug}" style="color: var(--text-primary); text-decoration: none;">${companion.name}</a>
            </h3>
            ${showRating && companion.rating ? `<div class="rating" style="margin-bottom: 8px;">★★★★★ ${companion.rating}/10</div>` : ''}
            ${companion.tagline ? `<p style="margin: 0; color: var(--text-secondary);">${companion.tagline}</p>` : ''}
            ${showPricing && companion.pricing_simple ? `<p style="margin: 8px 0 0 0; font-weight: 600;"><strong>Pricing:</strong> ${companion.pricing_simple}</p>` : ''}
          </div>
          ${showWebsiteLink && companion.website_url ? `
            <a href="${companion.website_url}" target="_blank" class="platform-btn" style="white-space: nowrap;">
              Visit Website
            </a>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Replace a placeholder element with a companion card
   * Usage: <div data-companion-card="replika"></div>
   */
  injectCompanionCards() {
    const cardPlaceholders = document.querySelectorAll('[data-companion-card]');

    cardPlaceholders.forEach(placeholder => {
      const companionSlug = placeholder.getAttribute('data-companion-card');
      const companion = this.getCompanion(companionSlug);

      if (companion) {
        const options = {
          showRating: placeholder.getAttribute('data-show-rating') !== 'false',
          showPricing: placeholder.getAttribute('data-show-pricing') !== 'false',
          showWebsiteLink: placeholder.getAttribute('data-show-website') !== 'false'
        };

        placeholder.outerHTML = this.createCompanionCard(companion, options);
      }
    });
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    if (typeof window.blogPostManager === "undefined") {
      window.blogPostManager = new BlogPostManager();
      await window.blogPostManager.processDynamicElements();
      window.blogPostManager.injectCompanionCards();
    }
  });
} else {
  // DOM already loaded
  if (typeof window.blogPostManager === "undefined") {
    window.blogPostManager = new BlogPostManager();
    window.blogPostManager.processDynamicElements().then(() => {
      window.blogPostManager.injectCompanionCards();
    });
  }
}
