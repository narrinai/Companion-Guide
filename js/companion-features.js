/**
 * Companion Features Dynamic Loader
 * Loads dynamic features/highlights from Airtable for individual companion pages
 */

class CompanionFeaturesManager {
  constructor() {
    this.companionData = null;
  }

  /**
   * Initialize and load features when companion data is available
   */
  async init() {
    // Wait for companion page manager to load data
    await this.waitForCompanionData();

    if (this.companionData && this.companionData.features) {
      this.updateFeatures(this.companionData.features);
    }
  }

  /**
   * Wait for companion data to be loaded by companion-page.js
   */
  async waitForCompanionData() {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (window.companionPageManager?.companionData) {
          this.companionData = window.companionPageManager.companionData;
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);

      // Timeout after 5 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        resolve();
      }, 5000);
    });
  }

  /**
   * Map icon names to SVG icon IDs
   */
  getIconId(iconEmoji) {
    const iconMap = {
      '💬': 'icon-chat',
      '🎭': 'icon-roleplay',
      '🧠': 'icon-brain',
      '🎬': 'icon-video',
      '💖': 'icon-girlfriend',
      '🎨': 'icon-character',
      '🖼️': 'icon-image',
      '🎯': 'icon-target',
      '🔊': 'icon-audio',
      '⚡': 'icon-fast',
      '🌟': 'icon-star',
      '🎮': 'icon-game',
      '📱': 'icon-mobile',
      '💎': 'icon-premium'
    };

    return iconMap[iconEmoji] || 'icon-star';
  }

  /**
   * Update the intro-highlights section with dynamic features
   */
  updateFeatures(features) {
    const highlightsContainer = document.querySelector('.intro-highlights');

    if (!highlightsContainer) {
      console.warn('No intro-highlights container found');
      return;
    }

    // Parse features if it's a JSON string
    let featureList = features;
    if (typeof features === 'string') {
      try {
        featureList = JSON.parse(features);
      } catch (e) {
        console.warn('Failed to parse features JSON:', e);
        return;
      }
    }

    // Validate features array
    if (!Array.isArray(featureList) || featureList.length === 0) {
      console.warn('Features is not a valid array');
      return;
    }

    console.log(`Loading ${featureList.length} features from Airtable`);

    // Generate HTML for each feature
    const featuresHTML = featureList.map(feature => {
      const iconId = this.getIconId(feature.icon);

      return `
        <div class="highlight-item">
          <strong><svg class="icon icon-sm"><use href="#${iconId}"/></svg> ${feature.title}:</strong>
          <span>${feature.description}</span>
        </div>
      `;
    }).join('');

    // Update the container
    highlightsContainer.innerHTML = featuresHTML;

    console.log('Features updated successfully from Airtable');
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Only initialize on companion pages
  if (window.location.pathname.includes('/companions/')) {
    const featuresManager = new CompanionFeaturesManager();
    await featuresManager.init();
  }
});

// Export for external use
window.CompanionFeaturesManager = CompanionFeaturesManager;
