#!/usr/bin/env node

/**
 * Create complete German pages from Dutch pages
 * NL pages have ALL i18n attributes, so we:
 * 1. Copy NL HTML structure (keeps all data-i18n attributes)
 * 2. Replace Dutch text with English text (as fallback before JS loads)
 * 3. Update lang, URLs, and meta tags for German
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const NL_DIR = path.join(__dirname, '../nl');
const DE_DIR = path.join(__dirname, '../de');

const FILES = [
  'index.html',
  'companions.html',
  'categories.html',
  'news.html',
  'deals.html',
  'contact.html'
];

// Common Dutch to English text replacements (fallback text before i18n loads)
const TEXT_REPLACEMENTS = {
  // Navigation
  'Home': 'Home',
  'Companions': 'Companions',
  'Categorieën': 'Categories',
  'Nieuws & Gidsen': 'News & Guides',
  'Deals': 'Deals',
  'Over': 'About',
  'Contact': 'Contact',

  // Common words
  'Laden...': 'Loading...',
  'Lees Review': 'Read Review',
  'Bezoek Website': 'Visit Website',
  'Vanaf': 'From',
  'per maand': 'per month',
  '/maand': '/month',

  // Hero
  'Vind je Perfecte AI Companion': 'Find Your Perfect AI Companion',
  'Uitgebreide reviews en vergelijkingen van AI chat platforms, AI girlfriends en character companions': 'Comprehensive reviews and comparisons of AI chat platforms, AI girlfriends, and character companions',

  // Sections
  'Beste AI Chat & Companion Platforms': 'Best AI Chat & Companion Platforms',
  'Ontdek de meest populaire en best beoordeelde AI chat platforms en AI companions': 'Discover the most popular and highest-rated AI chat platforms and AI companions',
  'Ontdek AI Platforms per Categorie': 'Discover AI Platforms by Category',
  'Vind AI companion platforms die passen bij jouw specifieke behoeften': 'Find AI companion platforms that match your specific needs and preferences',
  'Laatste Nieuws & Gidsen': 'Latest News & Guides',
  'Blijf op de hoogte van het laatste nieuws en inzichten uit de AI companion industrie': 'Stay up-to-date with the latest news and insights from the AI companion industry',

  // Categories
  'Roleplay & Character Chat': 'Roleplay & Character Chat',
  'AI Girlfriend': 'AI Girlfriend',
  'AI Boyfriend': 'AI Boyfriend',
  'WhatsApp-Native AI Companions': 'WhatsApp-Native AI Companions',
  'Video AI Companions': 'Video AI Companions',
  'Adult Content & Ongecensureerde Companions': 'Adult Content & Uncensored Companions',
  'AI Adult Image Generation Platforms': 'AI Adult Image Generation Platforms',
  'AI Wellness Companions': 'AI Wellness Companions',
  'Hentai AI Platforms': 'Hentai AI Platforms',
  'AI Porn Platforms': 'AI Porn Platforms',
  'AI Tutors & Educatieve Companions': 'AI Tutors & Educational Companions',

  // Category descriptions
  'Beste AI platforms voor roleplay en character chat ervaringen': 'Best AI platforms for roleplay and character chat experiences',
  'Beste AI platforms voor virtuele romantische relaties': 'Best AI platforms for virtual romantic relationships',
  'Top AI boyfriend platforms voor mannelijke companions': 'Top AI boyfriend platforms for male companions',
  'AI companions die native integreren in WhatsApp - geen aparte apps nodig': 'AI companions that integrate natively into WhatsApp - no separate apps needed',
  'AI companions met videochat en video generation mogelijkheden voor meeslepende ervaringen': 'AI companions with video chat and video generation capabilities for immersive experiences',
  'Ontdek de beste ongecensureerde NSFW AI platforms voor adult content': 'Explore the best uncensored NSFW AI platforms for adult content',
  'Beste AI platforms voor het maken van NSFW art en adult visuele content': 'Best AI platforms for creating NSFW art and adult visual content',
  'AI companions gericht op mental health, emotioneel welzijn en persoonlijke ondersteuning': 'AI companions focused on mental health, emotional well-being, and personal support',
  'Gespecialiseerde AI generators voor anime en manga-stijl adult content': 'Specialized AI generators for anime and manga-style adult content',
  'Geavanceerde AI platforms voor fotorealistische adult content generation': 'Advanced AI platforms for photorealistic adult content generation',
  'AI tutors en educatieve companions voor vaardigheidsontwikkeling': 'AI tutors and educational companions for skill development',

  // Footer
  'Je betrouwbare gids voor AI companions en chat platforms': 'Your trusted guide to AI companions and chat platforms',
  'Alle rechten voorbehouden': 'All rights reserved'
};

function replaceText(text) {
  let result = text;
  for (const [nl, en] of Object.entries(TEXT_REPLACEMENTS)) {
    result = result.replace(new RegExp(nl, 'g'), en);
  }
  return result;
}

function createDEPage(filename) {
  const sourcePath = path.join(NL_DIR, filename);
  const destPath = path.join(DE_DIR, filename);

  if (!fs.existsSync(sourcePath)) {
    console.log(`⚠️  Source not found: ${filename}`);
    return;
  }

  console.log(`\n📄 Processing: ${filename}`);

  const html = fs.readFileSync(sourcePath, 'utf-8');
  const dom = new JSDOM(html);
  const document = dom.window.document;

  // 1. Update lang attribute
  const htmlEl = document.querySelector('html');
  if (htmlEl) {
    htmlEl.setAttribute('lang', 'de');
  }

  // 2. Update all text nodes (but keep data-i18n attributes!)
  function replaceTextNodes(node) {
    if (node.nodeType === 3) { // Text node
      const trimmed = node.textContent.trim();
      if (trimmed && trimmed !== '' && !trimmed.match(/^[0-9.]+$/)) {
        node.textContent = replaceText(node.textContent);
      }
    } else if (node.nodeType === 1) { // Element node
      // Don't process script or style tags
      if (node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE') {
        Array.from(node.childNodes).forEach(replaceTextNodes);
      }
    }
  }

  replaceTextNodes(document.body);

  // 3. Update URLs from /nl/ to /de/
  document.querySelectorAll('a[href*="/nl"]').forEach(link => {
    const href = link.getAttribute('href');
    link.setAttribute('href', href.replace(/\/nl(\/|$)/g, '/de$1'));
  });

  // 4. Update canonical
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    const href = canonical.getAttribute('href');
    canonical.setAttribute('href', href.replace('/nl', '/de'));
  }

  // 5. Update hreflang tags
  document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(link => link.remove());

  const page = filename === 'index.html' ? '' : filename.replace('.html', '');
  const basePath = page ? `/${page}` : '';

  const hreflangs = [
    { lang: 'en', url: `https://companionguide.ai${basePath}` },
    { lang: 'nl', url: `https://companionguide.ai/nl${basePath}` },
    { lang: 'pt', url: `https://companionguide.ai/pt${basePath}` },
    { lang: 'de', url: `https://companionguide.ai/de${basePath}` },
    { lang: 'x-default', url: `https://companionguide.ai${basePath}` }
  ];

  hreflangs.forEach(({ lang, url }) => {
    const link = document.createElement('link');
    link.setAttribute('rel', 'alternate');
    link.setAttribute('hreflang', lang);
    link.setAttribute('href', url);
    document.head.appendChild(link);
  });

  // 6. Update OG locale
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  if (ogLocale) {
    ogLocale.setAttribute('content', 'de_DE');
  }

  // Update OG and Twitter URLs
  ['og:url', 'twitter:url'].forEach(prop => {
    const meta = document.querySelector(`meta[property="${prop}"]`);
    if (meta) {
      const content = meta.getAttribute('content');
      meta.setAttribute('content', content.replace('/nl', '/de'));
    }
  });

  // Write file
  fs.writeFileSync(destPath, dom.serialize(), 'utf-8');
  console.log(`✅ Created ${filename} with all i18n attributes`);

  // Count i18n attributes
  const i18nCount = (dom.serialize().match(/data-i18n=/g) || []).length;
  console.log(`   → ${i18nCount} data-i18n attributes preserved`);
}

console.log('🚀 Creating German pages from Dutch templates...');
console.log('   (Preserving ALL data-i18n attributes)\n');

FILES.forEach(file => {
  try {
    createDEPage(file);
  } catch (error) {
    console.error(`❌ Error processing ${file}:`, error.message);
  }
});

console.log('\n✅ All German pages created with complete i18n support!');
