#!/usr/bin/env node

/**
 * Add ALL missing i18n attributes to index.html pages
 * This ensures every translatable element has a data-i18n attribute
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

function addI18nToIndex(filePath) {
  console.log(`\n📝 Processing: ${filePath}`);

  const html = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  let changeCount = 0;

  // Helper to add attribute if not exists
  const addAttr = (selector, attr, value) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      if (!el.hasAttribute(attr)) {
        el.setAttribute(attr, value);
        changeCount++;
      }
    });
    return elements.length;
  };

  // Hero section - check for English text and add i18n
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle && !heroTitle.hasAttribute('data-i18n')) {
    heroTitle.setAttribute('data-i18n', 'hero.title');
    changeCount++;
  }

  const heroSubtitle = document.querySelector('.hero p');
  if (heroSubtitle && !heroSubtitle.hasAttribute('data-i18n')) {
    heroSubtitle.setAttribute('data-i18n', 'hero.subtitle');
    changeCount++;
  }

  // Section headers
  const headers = document.querySelectorAll('h2');
  headers.forEach(h2 => {
    const text = h2.textContent.trim();

    if (text.includes('Best AI Chat & Companion Platforms') && !h2.hasAttribute('data-i18n')) {
      h2.setAttribute('data-i18n', 'sections.bestPlatforms');
      changeCount++;
    } else if (text.includes('Latest News & Guides') && !h2.hasAttribute('data-i18n')) {
      h2.setAttribute('data-i18n', 'sections.latestNews');
      changeCount++;
    } else if (text.includes('Companion of the Month') && !h2.hasAttribute('data-i18n')) {
      h2.setAttribute('data-i18n', 'sections.companionOfMonth');
      changeCount++;
    } else if (text.includes('Featured Guides') && !h2.hasAttribute('data-i18n')) {
      h2.setAttribute('data-i18n', 'sections.featuredGuides');
      changeCount++;
    } else if (text.includes('Ontdek AI Platforms per Categorie')) {
      h2.setAttribute('data-i18n', 'sections.explorePlatformsTitle');
      changeCount++;
    }
  });

  // Section descriptions
  const sectionDescs = document.querySelectorAll('.section-header p, .categories-overview .section-header p');
  sectionDescs.forEach(p => {
    const text = p.textContent.trim();

    if ((text.includes('Discover the most popular') || text.includes('Ontdek de meest populaire')) && !p.hasAttribute('data-i18n')) {
      p.textContent = 'Discover the most popular and highest-rated AI chat platforms and AI companions';
      p.setAttribute('data-i18n', 'sections.bestPlatformsDescription');
      changeCount++;
    } else if ((text.includes('Stay up-to-date') || text.includes('Blijf op de hoogte')) && !p.hasAttribute('data-i18n')) {
      p.textContent = 'Stay up-to-date with the latest news and insights from the AI companion industry';
      p.setAttribute('data-i18n', 'sections.latestNewsDescription');
      changeCount++;
    } else if ((text.includes('Find AI companion platforms') || text.includes('Vind AI companion platforms')) && !p.hasAttribute('data-i18n')) {
      p.textContent = 'Find AI companion platforms that match your specific needs and preferences';
      p.setAttribute('data-i18n', 'sections.explorePlatformsDescription');
      changeCount++;
    }
  });

  // Category cards descriptions
  const categoryCards = document.querySelectorAll('.category-card p');
  categoryCards.forEach(p => {
    const text = p.textContent.trim();
    const parent = p.closest('.category-card');
    const href = parent ? parent.getAttribute('href') : '';

    if (!p.hasAttribute('data-i18n')) {
      if (href.includes('roleplay')) {
        p.textContent = 'Best AI platforms for roleplay and character chat experiences';
        p.setAttribute('data-i18n', 'categoryPages.roleplay.description');
        changeCount++;
      } else if (href.includes('ai-girlfriend')) {
        p.textContent = 'Best AI platforms for virtual romantic relationships';
        p.setAttribute('data-i18n', 'categoryPages.aiGirlfriend.description');
        changeCount++;
      } else if (href.includes('ai-boyfriend')) {
        p.textContent = 'Top AI boyfriend platforms for male companions';
        p.setAttribute('data-i18n', 'categoryPages.aiBoyfriend.description');
        changeCount++;
      } else if (href.includes('whatsapp')) {
        p.textContent = 'AI companions that integrate natively into WhatsApp';
        p.setAttribute('data-i18n', 'categoryPages.whatsappOnly.description');
        changeCount++;
      } else if (href.includes('adult-image')) {
        p.textContent = 'Best AI platforms for creating NSFW art and adult visual content';
        p.setAttribute('data-i18n', 'categoryPages.adultImageGen.description');
        changeCount++;
      } else if (href.includes('video')) {
        p.textContent = 'AI companions with video chat and video generation capabilities';
        p.setAttribute('data-i18n', 'categoryPages.videoCompanions.description');
        changeCount++;
      } else if (href.includes('wellness')) {
        p.textContent = 'AI companions focused on mental health and well-being';
        p.setAttribute('data-i18n', 'categoryPages.wellness.description');
        changeCount++;
      } else if (href.includes('hentai')) {
        p.textContent = 'Specialized AI generators for anime and manga-style adult content';
        p.setAttribute('data-i18n', 'categoryPages.hentaiAI.description');
        changeCount++;
      } else if (href.includes('ai-porn')) {
        p.textContent = 'Advanced AI platforms for photorealistic adult content generation';
        p.setAttribute('data-i18n', 'categoryPages.aiPorn.description');
        changeCount++;
      } else if (href.includes('adult-content-uncensored')) {
        p.textContent = 'Explore the best uncensored NSFW AI platforms for adult content';
        p.setAttribute('data-i18n', 'categoryPages.adultContentUncensored.description');
        changeCount++;
      } else if (href.includes('learning')) {
        p.textContent = 'AI tutors and educational companions for skill development';
        p.setAttribute('data-i18n', 'categoryPages.learning.description');
        changeCount++;
      }
    }
  });

  // "Loading..." text
  const loadingTexts = document.querySelectorAll('[data-companion-index]');
  loadingTexts.forEach(el => {
    if (!el.hasAttribute('data-i18n')) {
      el.textContent = 'Loading...';
      el.setAttribute('data-i18n', 'common.loading');
      changeCount++;
    }
  });

  // Category stats "Loading..."
  const categoryStats = document.querySelectorAll('.category-stats');
  categoryStats.forEach(el => {
    if (!el.hasAttribute('data-i18n')) {
      el.textContent = 'Loading...';
      el.setAttribute('data-i18n', 'common.loading');
      changeCount++;
    }
  });

  // Contact in nav
  const contactLinks = document.querySelectorAll('a[href*="contact"]');
  contactLinks.forEach(link => {
    if (link.textContent.trim() === 'Contact' && !link.hasAttribute('data-i18n')) {
      link.setAttribute('data-i18n', 'nav.contact');
      changeCount++;
    }
  });

  // Companion card buttons
  const reviewButtons = document.querySelectorAll('.cotm-review-button, a[class*="review-button"]');
  reviewButtons.forEach(btn => {
    if (!btn.hasAttribute('data-i18n')) {
      btn.setAttribute('data-i18n', 'companionCard.readReview');
      changeCount++;
    }
  });

  const websiteButtons = document.querySelectorAll('.cotm-website-button, a[class*="website-button"]');
  websiteButtons.forEach(btn => {
    if (!btn.hasAttribute('data-i18n')) {
      btn.setAttribute('data-i18n', 'companionCard.visitWebsite');
      changeCount++;
    }
  });

  // Footer
  const footerTagline = document.querySelector('.footer-content > p');
  if (footerTagline && !footerTagline.hasAttribute('data-i18n')) {
    footerTagline.setAttribute('data-i18n', 'footer.tagline');
    changeCount++;
  }

  // Write back
  fs.writeFileSync(filePath, dom.serialize(), 'utf-8');
  console.log(`✅ Added ${changeCount} data-i18n attributes`);

  return changeCount;
}

// Process all language versions
const files = [
  path.join(__dirname, '../de/index.html'),
  path.join(__dirname, '../nl/index.html'),
  path.join(__dirname, '../pt/index.html')
];

console.log('🚀 Adding i18n attributes to index pages...');

let totalChanges = 0;
files.forEach(file => {
  if (fs.existsSync(file)) {
    totalChanges += addI18nToIndex(file);
  } else {
    console.log(`⚠️  File not found: ${file}`);
  }
});

console.log(`\n✅ Total: ${totalChanges} attributes added`);
