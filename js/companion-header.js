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
   * Fetch companion data from Airtable with language parameter
   */
  async fetchCompanionData(slug) {
    try {
      // Detect language from URL path (e.g., /nl/companions/secrets-ai)
      const pathParts = window.location.pathname.split('/').filter(p => p);
      const lang = (pathParts[0] === 'nl' || pathParts[0] === 'pt' || pathParts[0] === 'es' || pathParts[0] === 'de')
        ? pathParts[0]
        : (window.i18n ? window.i18n.currentLang : 'en');

      // Build API URL with language parameter
      const apiUrl = lang && lang !== 'en'
        ? `${this.apiBaseUrl}/companionguide-get?lang=${lang}`
        : `${this.apiBaseUrl}/companionguide-get`;

      const response = await fetch(apiUrl);

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
    // Rating is 0-10, convert to 0-5 stars
    const ratingOutOf5 = rating / 2;
    const fullStars = Math.floor(ratingOutOf5);
    const hasHalfStar = (ratingOutOf5 % 1) >= 0.3; // Show half star for .3 and above
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
   * Update all dynamic content from Airtable
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
    ratingElement.classList.add('dynamic-rating');

    // Update tagline
    const taglineElement = document.querySelector('.tagline');
    if (taglineElement && companion.tagline) {
      taglineElement.textContent = companion.tagline;
      console.log(`✅ Updated tagline`);
    }

    // Update logo
    const logoElement = document.querySelector('.companion-logo');
    if (logoElement && companion.logo_url) {
      logoElement.src = companion.logo_url;
      logoElement.alt = `${companion.name} logo`;
      console.log(`✅ Updated logo from Airtable: ${companion.logo_url}`);
    }

    // Update "What is X?" heading with companion name
    // Skip for NL/PT/DE pages - companion-page.js handles this
    const path = window.location.pathname;
    const isTranslatedPage = path.match(/^\/(pt|nl|de)\//);

    if (!isTranslatedPage) {
      const overviewSection = document.querySelector('.overview, section.overview');
      if (overviewSection) {
        const whatIsHeading = overviewSection.querySelector('h2[data-i18n="companion.whatIs"]');
        if (whatIsHeading) {
          const whatIsText = window.i18n ? window.i18n.t('companion.whatIs') : 'What is';
          whatIsHeading.textContent = `${whatIsText} ${companion.name}?`;
        }
      }
    }

    const overviewSection = document.querySelector('.overview, section.overview');
    if (overviewSection) {

      // Update entire body_text section (paragraphs + features grid)
      if (companion.body_text) {
        this.updateBodyText(overviewSection, companion.body_text);
      }
    }

    // Update features grid (intro-highlights)
    if (companion.features) {
      this.updateFeatures(companion.features);
    }

    // Update pros/cons
    if (companion.pros_cons) {
      this.updateProsCons(companion.pros_cons);
    }

    // Update pricing plans
    if (companion.pricing_plans) {
      this.updatePricing(companion.pricing_plans);
    }

    // Update my verdict
    if (companion.my_verdict) {
      this.updateVerdict(companion.my_verdict, rating);
    }

    // Update FAQ
    if (companion.faq) {
      this.updateFAQ(companion.faq, companion.name);
    }

    // Update benefit cards in hero section (fact-grid)
    this.updateBenefitCards(companion);

    // Update "Ready to try" CTA
    this.updateReadyToTry(companion);

    // Update review form (use nl.json if companion-specific text not available)
    this.updateReviewFormFromi18n(companion.name);

    // Update "Best For" field (legacy support)
    let bestForElement = document.querySelector('.spec-value.best-for-value');
    if (!bestForElement) {
      const bestForHeading = Array.from(document.querySelectorAll('.fact h3'))
        .find(h3 => h3.textContent.trim() === 'Best For' || h3.textContent.trim() === 'Beste voor');
      if (bestForHeading) {
        bestForElement = bestForHeading.nextElementSibling;
      }
    }
    if (bestForElement && companion.best_for) {
      bestForElement.textContent = companion.best_for;
    }

    // Update verdict section rating
    const verdictRating = document.querySelector('.dynamic-rating-verdict');
    if (verdictRating) {
      verdictRating.textContent = rating;
    }

    console.log(`✅ Updated all content for ${companion.name}`);
  }

  /**
   * Update body text (paragraphs in overview section)
   */
  updateBodyText(overviewSection, bodyText) {
    // Split body text into paragraphs
    const paragraphs = bodyText.split('\n\n').filter(p => p.trim());

    // Find all paragraphs in overview section (before intro-highlights)
    const existingParagraphs = overviewSection.querySelectorAll('p');

    // Replace existing paragraphs with new content
    paragraphs.forEach((text, index) => {
      if (existingParagraphs[index]) {
        existingParagraphs[index].textContent = text.trim();
      }
    });

    console.log(`✅ Updated body text (${paragraphs.length} paragraphs)`);
  }

  /**
   * Update features grid (intro-highlights)
   */
  updateFeatures(featuresJSON) {
    try {
      const features = typeof featuresJSON === 'string' ? JSON.parse(featuresJSON) : featuresJSON;
      const highlightsContainer = document.querySelector('.intro-highlights');

      if (!highlightsContainer || !Array.isArray(features)) return;

      const highlightsHTML = features.map(feature => `
        <div class="highlight-item">
          <strong>${feature.icon} ${feature.title}:</strong>
          <span>${feature.description}</span>
        </div>
      `).join('');

      highlightsContainer.innerHTML = highlightsHTML;
      console.log(`✅ Updated features grid (${features.length} items)`);
    } catch (error) {
      console.error('Error updating features:', error);
    }
  }

  /**
   * Update pros and cons lists
   */
  updateProsCons(prosConsJSON) {
    try {
      const prosConsData = typeof prosConsJSON === 'string' ? JSON.parse(prosConsJSON) : prosConsJSON;

      // Update pros
      if (prosConsData.pros && Array.isArray(prosConsData.pros)) {
        const prosList = document.querySelector('.pros ul, .pros-cons .pros ul');
        if (prosList) {
          prosList.innerHTML = prosConsData.pros.map(item => `<li>${item}</li>`).join('');
        }
      }

      // Update cons
      if (prosConsData.cons && Array.isArray(prosConsData.cons)) {
        const consList = document.querySelector('.cons ul, .pros-cons .cons ul');
        if (consList) {
          consList.innerHTML = prosConsData.cons.map(item => `<li>${item}</li>`).join('');
        }
      }

      console.log(`✅ Updated pros/cons`);
    } catch (error) {
      console.error('Error updating pros/cons:', error);
    }
  }

  /**
   * Update pricing plans
   */
  updatePricing(pricingJSON) {
    try {
      const plans = typeof pricingJSON === 'string' ? JSON.parse(pricingJSON) : pricingJSON;
      const pricingGrid = document.querySelector('.pricing-grid');

      // Don't update if no valid pricing data - keep static HTML
      if (!pricingGrid || !Array.isArray(plans) || plans.length === 0) return;

      const pricingHTML = plans.map(plan => {
        // Safety check for features (could be undefined or missing)
        const features = plan.features || [];

        // Format price - add $ if numeric, or use as-is if already formatted
        let formattedPrice = plan.price;
        if (typeof plan.price === 'number') {
          formattedPrice = plan.price === 0 ? 'Free' : `$${plan.price}`;
        } else if (typeof plan.price === 'string' && !isNaN(parseFloat(plan.price)) && !plan.price.includes('$')) {
          formattedPrice = `$${plan.price}`;
        }

        // Format period - skip if price is 0/Free to avoid "Free free"
        // Translate period using i18n
        let periodText = '';
        if (plan.price !== 0 && formattedPrice !== 'Free' && plan.period) {
          const periodLower = plan.period.toLowerCase();
          if (periodLower === 'monthly' || periodLower === 'month' || periodLower === '/month') {
            periodText = '<span class="period" data-i18n="pricing.perMonth">/month</span>';
          } else if (periodLower === 'yearly' || periodLower === 'year' || periodLower === '/year') {
            periodText = '<span class="period" data-i18n="pricing.perYear">/year</span>';
          } else if (periodLower === 'free') {
            periodText = '<span class="period" data-i18n="pricing.free">Free</span>';
          } else {
            periodText = `<span class="period">${plan.period}</span>`;
          }
        }

        // Add Visit Website link with i18n
        const websiteUrl = this.companionData?.affiliate_url || this.companionData?.website_url || '#';
        const visitWebsiteLink = `<a href="${websiteUrl}" class="pricing-cta" target="_blank" data-i18n="companionCard.visitWebsite">Visit Website</a>`;

        return `
          <div class="pricing-tier${plan.badge ? ' popular' : ''}">
            ${plan.badge ? `<div class="badge">${plan.badge}</div>` : ''}
            <h3>${plan.name}</h3>
            <div class="price">${formattedPrice} ${periodText}</div>
            ${plan.description ? `<p>${plan.description}</p>` : ''}
            <ul>
              ${features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            ${visitWebsiteLink}
          </div>
        `;
      }).join('');

      pricingGrid.innerHTML = pricingHTML;

      // Apply i18n translations to newly added content
      if (window.i18n && typeof window.i18n.applyTranslations === 'function') {
        window.i18n.applyTranslations();
      }

      console.log(`✅ Updated pricing (${plans.length} plans)`);
    } catch (error) {
      console.error('Error updating pricing:', error);
    }
  }

  /**
   * Update verdict section
   */
  updateVerdict(verdictText, rating) {
    const verdictSection = document.querySelector('.verdict, section.verdict');
    if (!verdictSection) return;

    // Find or create the verdict-text div
    let verdictTextDiv = verdictSection.querySelector('.verdict-text');
    if (!verdictTextDiv) {
      verdictTextDiv = document.createElement('div');
      verdictTextDiv.className = 'verdict-text';
      // Insert after the h2
      const h2 = verdictSection.querySelector('h2');
      if (h2 && h2.nextSibling) {
        verdictSection.insertBefore(verdictTextDiv, h2.nextSibling);
      } else {
        verdictSection.appendChild(verdictTextDiv);
      }
    }

    // Smart heading detection for SEO
    const paragraphs = verdictText.split('\n\n').filter(p => p.trim());
    let html = '';

    paragraphs.forEach((para, index) => {
      const trimmed = para.trim();

      // Check if it starts with markdown headers
      if (trimmed.startsWith('# ')) {
        html += `<h3>${trimmed.substring(2)}</h3>`;
      } else if (trimmed.startsWith('## ')) {
        html += `<h4>${trimmed.substring(3)}</h4>`;
      } else {
        // Split paragraph into sentences
        const sentences = trimmed.split(/(?<=[.!?])\s+/);

        if (sentences.length > 0) {
          const firstSentence = sentences[0].trim();
          const restOfParagraph = sentences.slice(1).join(' ').trim();

          // Detect if first sentence should be a heading
          const isShort = firstSentence.length < 100; // Increased from 60 to catch more headings
          const endsWithColon = firstSentence.endsWith(':');
          const hasNoPunctuation = !firstSentence.match(/[.!?]$/);
          const looksLikeHeading = /^(Best for|Who should use|Key features|Conclusion|Final thoughts|Overview|Why choose|Perfect for|Bottom line|The verdict|What makes|Innovation|Standout|Unique|Ideal for|Great for)/i.test(firstSentence);
          const isFirstParagraph = index === 0;

          // Make first sentence a H3 if it's short without punctuation OR looks like a heading OR ends with colon
          if ((isShort && (hasNoPunctuation || looksLikeHeading || endsWithColon)) || isFirstParagraph) {
            const headingText = endsWithColon ? firstSentence.slice(0, -1) : firstSentence;
            html += `<h3>${headingText}</h3>`;

            // Add the rest of the paragraph if exists
            if (restOfParagraph) {
              html += `<p>${restOfParagraph}</p>`;
            }
          } else {
            // Keep entire paragraph as one <p>
            html += `<p>${trimmed}</p>`;
          }
        }
      }
    });

    verdictTextDiv.innerHTML = html;
    console.log(`✅ Updated verdict with smart heading detection (${paragraphs.length} paragraphs)`);
  }

  /**
   * Update FAQ section
   */
  updateFAQ(faqJSON, companionName) {
    try {
      const faqs = typeof faqJSON === 'string' ? JSON.parse(faqJSON) : faqJSON;
      const faqContainer = document.querySelector('.faq-container');

      if (!faqContainer || !Array.isArray(faqs)) return;

      // Update FAQ heading with companion name
      const faqSection = document.querySelector('.faq-section, section.faq-section');
      if (faqSection) {
        const faqHeading = faqSection.querySelector('h2');
        if (faqHeading) {
          // Wait for i18n to be initialized if needed
          const updateHeading = () => {
            const faqText = (window.i18n && window.i18n.initialized)
              ? window.i18n.t('companion.faqHeading')
              : 'FAQ';
            faqHeading.textContent = `${companionName} ${faqText}`;
            console.log(`✅ Updated FAQ heading: ${faqHeading.textContent}`);
          };

          if (window.i18n && !window.i18n.initialized) {
            // Wait for i18n to initialize
            const waitForI18n = setInterval(() => {
              if (window.i18n.initialized) {
                clearInterval(waitForI18n);
                updateHeading();
              }
            }, 50);
            // Timeout after 2 seconds
            setTimeout(() => {
              clearInterval(waitForI18n);
              updateHeading();
            }, 2000);
          } else {
            updateHeading();
          }
        }
      }

      const faqHTML = faqs.map(faq => `
        <div class="faq-item" itemscope itemprop="mainEntity" itemtype="https://schema.org/Question">
          <h3 class="faq-question" itemprop="name">${faq.question}</h3>
          <div class="faq-answer" itemscope itemprop="acceptedAnswer" itemtype="https://schema.org/Answer">
            <p itemprop="text">${faq.answer}</p>
          </div>
        </div>
      `).join('');

      faqContainer.innerHTML = faqHTML;
      console.log(`✅ Updated FAQ (${faqs.length} items)`);
    } catch (error) {
      console.error('Error updating FAQ:', error);
    }
  }

  /**
   * Update benefit cards in hero section (Pricing, Best For, Platform, Content Policy)
   */
  updateBenefitCards(companion) {
    const factGrid = document.querySelector('.fact-grid');
    if (!factGrid) return;

    // Parse hero_specs JSON if available
    let heroSpecs = {};
    if (companion.hero_specs) {
      try {
        heroSpecs = typeof companion.hero_specs === 'string'
          ? JSON.parse(companion.hero_specs)
          : companion.hero_specs;
      } catch (e) {
        console.error('Error parsing hero_specs:', e);
      }
    }

    // Update all fact cards
    const facts = factGrid.querySelectorAll('.fact');
    facts.forEach(fact => {
      const h3 = fact.querySelector('h3');
      const p = fact.querySelector('p');
      if (!h3 || !p) return;

      const heading = h3.textContent.trim();

      // Update based on heading
      if ((heading.includes('Pricing') || heading.includes('Prijzen')) && heroSpecs.pricing) {
        p.textContent = heroSpecs.pricing;
      } else if ((heading.includes('Best For') || heading.includes('Beste voor')) && companion.best_for) {
        p.textContent = companion.best_for;
      } else if ((heading === 'Platform') && heroSpecs.platform) {
        p.textContent = heroSpecs.platform;
      } else if ((heading.includes('Content Policy') || heading.includes('Inhoudbeleid')) && heroSpecs.content_policy) {
        p.textContent = heroSpecs.content_policy;
      }
    });

    console.log(`✅ Updated benefit cards`);
  }

  /**
   * Update "Ready to try" CTA section
   */
  updateReadyToTry(companion) {
    if (!companion.ready_to_try) return;

    // Find the CTA section (usually has h2 "Ready to Try X?")
    const ctaSections = document.querySelectorAll('.cta-section, section.cta-section');
    ctaSections.forEach(section => {
      const h2 = section.querySelector('h2');
      if (h2 && (h2.textContent.includes('Ready to Try') || h2.textContent.includes('Klaar om'))) {
        h2.textContent = companion.ready_to_try;
      }
    });

    console.log(`✅ Updated ready to try CTA`);
  }

  /**
   * Update review form using i18n translations from nl.json
   */
  updateReviewFormFromi18n(companionName) {
    // Skip if not using i18n or not Dutch
    if (!window.i18n || window.i18n.currentLang === 'en') {
      return;
    }

    const reviewSection = document.querySelector('.user-reviews');
    if (!reviewSection) return;

    try {
      // Update section title with companion name
      const sectionHeader = reviewSection.querySelector('.section-header p');
      if (sectionHeader) {
        const sectionTitle = window.i18n.t('reviewForm.sectionTitle').replace('{companion}', companionName);
        sectionHeader.textContent = sectionTitle;
      }

      // Find the review form
      const reviewForm = document.querySelector('form[name="companion-review"]');
      if (!reviewForm) return;

      // Update form labels and placeholders
      const updates = [
        { id: 'reviewer-name', label: 'reviewForm.yourName', placeholder: 'reviewForm.yourNamePlaceholder' },
        { id: 'rating', label: 'reviewForm.rating' },
        { id: 'review-title', label: 'reviewForm.reviewTitle', placeholder: 'reviewForm.reviewTitlePlaceholder' },
        { id: 'review-text', label: 'reviewForm.yourReview', placeholder: 'reviewForm.yourReviewPlaceholder' },
        { id: 'usage-duration', label: 'reviewForm.usageDuration' }
      ];

      updates.forEach(({ id, label, placeholder }) => {
        const input = document.getElementById(id);
        const labelEl = document.querySelector(`label[for="${id}"]`);

        if (labelEl && label) {
          const hasAsterisk = labelEl.textContent.includes('*');
          const translatedLabel = window.i18n.t(label);
          labelEl.textContent = translatedLabel + (hasAsterisk ? ' *' : '');
        }

        if (input && placeholder) {
          const translatedPlaceholder = window.i18n.t(placeholder);
          input.setAttribute('placeholder', translatedPlaceholder);
        }
      });

      // Update duration select options
      const durationSelect = document.getElementById('usage-duration');
      if (durationSelect) {
        const firstOption = durationSelect.querySelector('option[value=""]');
        if (firstOption) {
          firstOption.textContent = window.i18n.t('reviewForm.durationSelect');
        }

        const optionMap = {
          'less-than-week': 'reviewForm.durationLessThanWeek',
          '1-4-weeks': 'reviewForm.duration1to4Weeks',
          '1-3-months': 'reviewForm.duration1to3Months',
          '3-6-months': 'reviewForm.duration3to6Months',
          '6-months-plus': 'reviewForm.duration6MonthsPlus'
        };

        Object.entries(optionMap).forEach(([value, key]) => {
          const option = durationSelect.querySelector(`option[value="${value}"]`);
          if (option) {
            option.textContent = window.i18n.t(key);
          }
        });
      }

      // Update submit button
      const submitBtn = reviewForm.querySelector('.submit-review-btn');
      if (submitBtn) {
        submitBtn.textContent = window.i18n.t('reviewForm.submitButton');
      }

      console.log(`✅ Updated review form from i18n`);
    } catch (error) {
      console.error('Error updating review form from i18n:', error);
    }
  }

  /**
   * Update review form with translated text (legacy - using Airtable data)
   */
  updateReviewForm(formTextJSON) {
    try {
      const formText = typeof formTextJSON === 'string' ? JSON.parse(formTextJSON) : formTextJSON;
      const reviewSection = document.querySelector('.user-reviews');

      if (!reviewSection) return;

      // Update section title
      const sectionHeader = reviewSection.querySelector('.section-header p');
      if (sectionHeader && formText.section_title) {
        sectionHeader.textContent = formText.section_title;
      }

      // Find the review form
      const reviewForm = document.querySelector('form[name="companion-review"]');
      if (!reviewForm) return;

      // Update form labels and placeholders
      const updates = [
        { id: 'reviewer-name', label: formText.your_name, placeholder: formText.your_name_placeholder },
        { id: 'rating', label: formText.rating },
        { id: 'review-title', label: formText.review_title, placeholder: formText.review_title_placeholder },
        { id: 'review-text', label: formText.your_review, placeholder: formText.your_review_placeholder },
        { id: 'usage-duration', label: formText.usage_duration }
      ];

      updates.forEach(({ id, label, placeholder }) => {
        const input = document.getElementById(id);
        const labelEl = document.querySelector(`label[for="${id}"]`);

        if (labelEl && label) {
          const hasAsterisk = labelEl.textContent.includes('*');
          labelEl.textContent = label + (hasAsterisk ? ' *' : '');
        }

        if (input && placeholder) {
          input.setAttribute('placeholder', placeholder);
        }
      });

      // Update rating select placeholder
      const ratingSelect = document.getElementById('rating');
      if (ratingSelect && formText.rating_placeholder) {
        const firstOption = ratingSelect.querySelector('option[value=""]');
        if (firstOption) firstOption.textContent = formText.rating_placeholder;
      }

      // Update duration select options
      if (formText.usage_placeholder && formText.duration_options) {
        const durationSelect = document.getElementById('usage-duration');
        if (durationSelect) {
          const firstOption = durationSelect.querySelector('option[value=""]');
          if (firstOption) firstOption.textContent = formText.usage_placeholder;

          const optionMap = {
            'less-than-week': formText.duration_options.less_than_week,
            '1-4-weeks': formText.duration_options['1_4_weeks'],
            '1-3-months': formText.duration_options['1_3_months'],
            '3-6-months': formText.duration_options['3_6_months'],
            '6-months-plus': formText.duration_options['6_months_plus']
          };

          Object.entries(optionMap).forEach(([value, text]) => {
            const option = durationSelect.querySelector(`option[value="${value}"]`);
            if (option && text) option.textContent = text;
          });
        }
      }

      // Update submit button
      const submitBtn = reviewForm.querySelector('.submit-review-btn');
      if (submitBtn && formText.submit_button) {
        submitBtn.textContent = formText.submit_button;
      }

      // Update form note
      const formNote = reviewForm.querySelector('.form-note');
      if (formNote && formText.form_note) {
        formNote.textContent = formText.form_note;
      }

      console.log(`✅ Updated review form`);
    } catch (error) {
      console.error('Error updating review form:', error);
    }
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