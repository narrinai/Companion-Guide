/**
 * CompanionGuide Language Manager
 * Handles client-side translations with URL-based language routing
 */

class LanguageManager {
    constructor() {
        this.supportedLanguages = {
            'en': { name: 'English', flag: '🇺🇸' },
            'pt': { name: 'Português (Brasil)', flag: '🇧🇷' }
        };

        this.currentLanguage = this.detectLanguage();
        this.translations = {};
        this.fallbackTranslations = {};

        this.init();
    }

    detectLanguage() {
        // Check URL path for language (e.g., /pt/companions/candy-ai)
        const pathLanguage = window.location.pathname.split('/')[1];
        if (this.supportedLanguages[pathLanguage]) {
            return pathLanguage;
        }

        // Check localStorage
        const storedLang = localStorage.getItem('companion-guide-language');
        if (storedLang && this.supportedLanguages[storedLang]) {
            return storedLang;
        }

        // Check browser language
        const browserLang = navigator.language.split('-')[0];
        if (this.supportedLanguages[browserLang]) {
            return browserLang;
        }

        return 'en'; // Default fallback
    }

    async init() {
        try {
            console.log('Language Manager: Initializing for language:', this.currentLanguage);

            // Load fallback (English) translations first
            await this.loadFallbackTranslations();
            console.log('Language Manager: Fallback translations loaded:', Object.keys(this.fallbackTranslations).length > 0);

            // Load current language translations
            if (this.currentLanguage !== 'en') {
                await this.loadTranslations(this.currentLanguage);
                console.log('Language Manager: Current language translations loaded:', Object.keys(this.translations).length > 0);
            } else {
                this.translations = this.fallbackTranslations;
            }

            this.createLanguageSelector();
            this.applyTranslations();
            this.updatePageMeta();

            console.log('Language Manager: Initialization complete');

        } catch (error) {
            console.warn('Language initialization failed:', error);
        }
    }

    async loadFallbackTranslations() {
        try {
            // Determine correct path based on current location
            const basePath = this.getBasePath();
            const response = await fetch(`${basePath}translations/en.json`);
            this.fallbackTranslations = await response.json();
        } catch (error) {
            console.error('Failed to load fallback translations:', error);
        }
    }

    async loadTranslations(language) {
        try {
            // Determine correct path based on current location
            const basePath = this.getBasePath();
            const response = await fetch(`${basePath}translations/${language}.json`);
            this.translations = await response.json();
        } catch (error) {
            console.warn(`Failed to load ${language} translations, using English fallback`);
            this.translations = this.fallbackTranslations;
        }
    }

    getBasePath() {
        // If we're in a subdirectory like /pt/, we need to go up one level
        const path = window.location.pathname;
        const pathParts = path.split('/');

        // Check if we're in a language subdirectory
        if (pathParts[1] && this.supportedLanguages[pathParts[1]]) {
            return '../'; // We're in /pt/, so go up to root
        }

        return '/'; // We're in root directory
    }

    createLanguageSelector() {
        // Find header nav
        const nav = document.querySelector('header nav .nav-menu');
        if (!nav) return;

        // Create language selector
        const langSelector = document.createElement('li');
        langSelector.className = 'language-selector-item';
        langSelector.innerHTML = `
            <div class="language-selector">
                <button class="current-language" onclick="window.languageManager.toggleLanguageMenu()">
                    <span class="flag">${this.supportedLanguages[this.currentLanguage].flag}</span>
                    <span class="lang-code">${this.currentLanguage.toUpperCase()}</span>
                    <span class="arrow">▼</span>
                </button>
                <div class="language-menu" id="languageMenu">
                    ${Object.entries(this.supportedLanguages).map(([code, info]) =>
                        `<a href="#" onclick="window.languageManager.switchLanguage('${code}'); return false;"
                           class="${code === this.currentLanguage ? 'active' : ''}">
                            <span class="flag">${info.flag}</span> ${info.name}
                        </a>`
                    ).join('')}
                </div>
            </div>
        `;

        nav.appendChild(langSelector);
    }

    applyTranslations() {
        // Translate all elements with data-translate attribute
        document.querySelectorAll('[data-translate]').forEach(element => {
            const key = element.getAttribute('data-translate');
            const translation = this.getTranslation(key);

            if (translation) {
                // Handle different element types
                if (element.tagName === 'INPUT' && element.type === 'submit') {
                    element.value = translation;
                } else if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                } else {
                    element.textContent = translation;
                }
            }
        });

        // Translate elements with data-translate-html (for HTML content)
        document.querySelectorAll('[data-translate-html]').forEach(element => {
            const key = element.getAttribute('data-translate-html');
            const translation = this.getTranslation(key);

            if (translation) {
                element.innerHTML = translation;
            }
        });
    }

    getTranslation(key) {
        // Try current language first
        let translation = this.getNestedValue(this.translations, key);

        // Fallback to English if not found
        if (!translation) {
            translation = this.getNestedValue(this.fallbackTranslations, key);
        }

        return translation;
    }

    getNestedValue(obj, key) {
        return key.split('.').reduce((current, k) => current && current[k], obj);
    }

    switchLanguage(newLanguage) {
        if (!this.supportedLanguages[newLanguage]) {
            console.warn(`Unsupported language: ${newLanguage}`);
            return;
        }

        // Save preference
        localStorage.setItem('companion-guide-language', newLanguage);

        // Update current language
        this.currentLanguage = newLanguage;

        // Construct new URL with language prefix
        let newPath = window.location.pathname;
        let currentLangPrefix = '';

        // Remove existing language prefix if present
        const pathParts = newPath.split('/');
        if (pathParts[1] && this.supportedLanguages[pathParts[1]]) {
            currentLangPrefix = '/' + pathParts[1];
            newPath = '/' + pathParts.slice(2).join('/');
        }

        // Add new language prefix (except for English)
        if (newLanguage !== 'en') {
            newPath = `/${newLanguage}${newPath}`;
        }

        // Add current query params and hash
        const search = window.location.search;
        const hash = window.location.hash;

        // Navigate to translated page
        window.location.href = newPath + search + hash;
    }

    toggleLanguageMenu() {
        const menu = document.getElementById('languageMenu');
        const isMobile = window.innerWidth <= 768;

        if (menu && isMobile) {
            // Only toggle manually on mobile - desktop uses hover
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }
    }

    updatePageMeta() {
        // Update page title with language prefix
        const currentTitle = document.title;
        if (this.currentLanguage === 'pt' && !currentTitle.includes('🇧🇷')) {
            document.title = `🇧🇷 ${currentTitle}`;
        }

        // Update meta description if available
        const metaDesc = document.querySelector('meta[name="description"]');
        const descKey = this.getPageDescriptionKey();
        if (metaDesc && descKey) {
            const translation = this.getTranslation(descKey);
            if (translation) {
                metaDesc.setAttribute('content', translation);
            }
        }

        // Update lang attribute
        document.documentElement.setAttribute('lang', this.currentLanguage === 'pt' ? 'pt-BR' : 'en');
    }

    getPageDescriptionKey() {
        const path = window.location.pathname;

        // Remove language prefix for key generation
        let cleanPath = path;
        const pathParts = path.split('/');
        if (pathParts[1] && this.supportedLanguages[pathParts[1]]) {
            cleanPath = '/' + pathParts.slice(2).join('/');
        }

        // Map paths to translation keys
        if (cleanPath === '/' || cleanPath === '') {
            return 'homepage.hero.description';
        } else if (cleanPath.startsWith('/companions/')) {
            const companionName = cleanPath.split('/')[2];
            return `companions.${companionName}.description`;
        } else if (cleanPath.startsWith('/categories/')) {
            const categoryName = cleanPath.split('/')[2];
            return `categories.${categoryName}.description`;
        }

        return null;
    }
}

// Close language menu when clicking outside
document.addEventListener('click', function(event) {
    const selector = document.querySelector('.language-selector');
    const menu = document.getElementById('languageMenu');

    if (selector && menu && !selector.contains(event.target)) {
        menu.style.display = 'none';
    }
});

// Initialize language manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    window.languageManager = new LanguageManager();
});