/**
 * i18n (Internationalization) Engine for CompanionGuide.ai
 * Handles multi-language support with URL-based language detection
 */

class I18n {
  constructor() {
    this.currentLang = 'en';
    this.translations = {};
    this.fallbackLang = 'en';
    this.supportedLanguages = ['en', 'nl', 'es', 'de', 'fr', 'it', 'pt', 'pl'];
    this.initialized = false;
  }

  /**
   * Detect language from URL path
   * Examples:
   *   /nl/companions/secrets-ai -> 'nl'
   *   /companions/secrets-ai -> 'en' (default)
   *   /es/categories/ai-girlfriends -> 'es'
   */
  detectLanguage() {
    const pathParts = window.location.pathname.split('/').filter(p => p);

    // Check if first part of URL is a supported language code
    if (pathParts.length > 0 && this.supportedLanguages.includes(pathParts[0])) {
      return pathParts[0];
    }

    return this.fallbackLang; // Default to English
  }

  /**
   * Load translation file for current language
   */
  async loadTranslations(lang = null) {
    const targetLang = lang || this.currentLang;

    try {
      const response = await fetch(`/locales/${targetLang}.json`);

      if (!response.ok) {
        throw new Error(`Failed to load ${targetLang} translations`);
      }

      this.translations = await response.json();
      this.currentLang = targetLang;
      this.initialized = true;

      console.log(`✅ Loaded ${targetLang} translations`);
      return this.translations;

    } catch (error) {
      console.error(`❌ Error loading ${targetLang} translations:`, error);

      // Fallback to English if current language fails
      if (targetLang !== this.fallbackLang) {
        console.log(`⚠️ Falling back to ${this.fallbackLang}`);
        return this.loadTranslations(this.fallbackLang);
      }

      throw error;
    }
  }

  /**
   * Initialize i18n system
   */
  async init() {
    this.currentLang = this.detectLanguage();
    await this.loadTranslations();
    return this;
  }

  /**
   * Get translation by key
   * @param {string} key - Dot-notation key (e.g., "companionCard.readReview")
   * @param {object} params - Optional parameters for interpolation
   * @returns {string} Translated string
   *
   * Examples:
   *   t('companionCard.readReview') -> "Read Review" or "Lees Review"
   *   t('companionCard.reviews', {count: 5}) -> "5 reviews"
   */
  t(key, params = {}) {
    if (!this.initialized) {
      console.warn('i18n not initialized yet, call init() first');
      return key;
    }

    // Navigate through nested object using dot notation
    const keys = key.split('.');
    let value = this.translations;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) break;
    }

    // Return key if translation not found (helpful for debugging)
    if (value === undefined) {
      console.warn(`Translation missing for key: ${key} (${this.currentLang})`);
      return key;
    }

    // Simple parameter interpolation
    // Example: "You have {count} items" with {count: 5} -> "You have 5 items"
    if (typeof value === 'string' && Object.keys(params).length > 0) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
      });
    }

    return value;
  }

  /**
   * Get companion URL with proper language prefix
   * @param {string} slug - Companion slug (e.g., "secrets-ai")
   * @returns {string} Full URL with language prefix if needed
   */
  getCompanionUrl(slug) {
    if (this.currentLang === 'en') {
      return `/companions/${slug}`;
    }
    return `/${this.currentLang}/companions/${slug}`;
  }

  /**
   * Get category URL with proper language prefix
   */
  getCategoryUrl(slug) {
    if (this.currentLang === 'en') {
      return `/categories/${slug}`;
    }
    return `/${this.currentLang}/categories/${slug}`;
  }

  /**
   * Get news article URL with proper language prefix
   */
  getNewsUrl(slug) {
    if (this.currentLang === 'en') {
      return `/news/${slug}`;
    }
    return `/${this.currentLang}/news/${slug}`;
  }

  /**
   * Get home URL with language prefix
   */
  getHomeUrl() {
    if (this.currentLang === 'en') {
      return '/';
    }
    return `/${this.currentLang}`;
  }

  /**
   * Get all available languages with their names
   */
  getAvailableLanguages() {
    return [
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'fr', name: 'Français', flag: '🇫🇷' },
      { code: 'it', name: 'Italiano', flag: '🇮🇹' },
      { code: 'pt', name: 'Português', flag: '🇵🇹' },
      { code: 'pl', name: 'Polski', flag: '🇵🇱' }
    ];
  }

  /**
   * Generate language switcher URLs for current page
   */
  getLanguageSwitcherUrls() {
    const currentPath = window.location.pathname;
    const langs = this.getAvailableLanguages();

    // Remove current language prefix from path
    let basePath = currentPath;
    if (this.currentLang !== 'en') {
      basePath = currentPath.replace(new RegExp(`^/${this.currentLang}`), '');
    }

    // Ensure basePath starts with /
    if (!basePath.startsWith('/')) {
      basePath = '/' + basePath;
    }

    // Generate URLs for all languages
    return langs.map(lang => ({
      ...lang,
      url: lang.code === 'en' ? basePath : `/${lang.code}${basePath}`,
      active: lang.code === this.currentLang
    }));
  }

  /**
   * Apply translations to DOM elements with data-i18n attribute
   * Usage: <button data-i18n="companionCard.readReview">Read Review</button>
   */
  applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);

      // Replace text content but preserve child elements
      if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
        el.textContent = translation;
      } else {
        // For elements with child nodes, only replace text nodes
        el.childNodes.forEach(node => {
          if (node.nodeType === 3) { // Text node
            node.textContent = translation;
          }
        });
      }
    });

    console.log(`✅ Applied translations to ${elements.length} elements`);
  }

  /**
   * Get current language metadata
   */
  getCurrentLanguage() {
    return this.getAvailableLanguages().find(lang => lang.code === this.currentLang);
  }

  /**
   * Check if a language is supported
   */
  isLanguageSupported(langCode) {
    return this.supportedLanguages.includes(langCode);
  }
}

// Create global instance
window.i18n = new I18n();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await window.i18n.init();
    window.i18n.applyTranslations();
  });
} else {
  // DOM already loaded
  window.i18n.init().then(() => {
    window.i18n.applyTranslations();
  });
}
