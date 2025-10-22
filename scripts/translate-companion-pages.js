#!/usr/bin/env node

/**
 * AI-Powered Companion Page Translation Script
 *
 * This script:
 * 1. Reads all companion HTML files from /companions/*.html
 * 2. Extracts translatable content (text nodes, preserving HTML structure)
 * 3. Translates using Claude API (context-aware, understands AI companion terminology)
 * 4. Generates translated HTML files in /nl/companions/*.html
 * 5. Preserves all JavaScript, CSS, data attributes, and dynamic functionality
 *
 * Usage: node scripts/translate-companion-pages.js [options]
 * Options:
 *   --lang=nl          Target language (default: nl)
 *   --file=slug        Translate single file (e.g., --file=character-ai)
 *   --dry-run          Preview without writing files
 *   --force            Overwrite existing translations
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const Anthropic = require('@anthropic-ai/sdk');

// Configuration
const CONFIG = {
  sourceLang: 'en',
  targetLang: process.argv.find(arg => arg.startsWith('--lang='))?.split('=')[1] || 'nl',
  sourceDir: path.join(__dirname, '../companions'),
  targetDir: null, // Will be set based on language
  dryRun: process.argv.includes('--dry-run'),
  force: process.argv.includes('--force'),
  singleFile: process.argv.find(arg => arg.startsWith('--file='))?.split('=')[1] || null,

  // Claude API settings
  claudeModel: 'claude-3-5-sonnet-20241022',
  maxTokens: 4096,

  // Elements to skip (contain dynamic/technical content)
  skipSelectors: [
    'script',
    'style',
    'code',
    'pre',
    '[data-dynamic]',
    '[data-rating-slug]',
    '.rating-stars',
    '.rating-score',
    '.rating-count'
  ],

  // Elements that should preserve HTML structure
  preserveHtmlSelectors: [
    'a[href]',
    'strong',
    'em',
    'b',
    'i',
    'mark',
    'span[class]'
  ]
};

// Set target directory based on language
CONFIG.targetDir = path.join(__dirname, `../${CONFIG.targetLang}/companions`);

// Initialize Claude API
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Extract translatable content from HTML while preserving structure
 */
function extractTranslatableContent(dom) {
  const document = dom.window.document;
  const translations = [];

  // Find all text-containing elements
  const walker = document.createTreeWalker(
    document.body,
    dom.window.NodeFilter.SHOW_ELEMENT | dom.window.NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        // Skip elements in skipSelectors
        if (node.nodeType === 1) { // Element node
          for (const selector of CONFIG.skipSelectors) {
            if (node.matches && node.matches(selector)) {
              return dom.window.NodeFilter.FILTER_REJECT;
            }
          }
        }

        // Only accept text nodes with actual content
        if (node.nodeType === 3) { // Text node
          const text = node.textContent.trim();
          if (text.length > 0 && !/^[\s\n\r]*$/.test(text)) {
            return dom.window.NodeFilter.FILTER_ACCEPT;
          }
        }

        return dom.window.NodeFilter.FILTER_SKIP;
      }
    }
  );

  let currentNode;
  while (currentNode = walker.nextNode()) {
    if (currentNode.nodeType === 3) { // Text node
      const text = currentNode.textContent.trim();
      if (text && text.length > 0) {
        const parent = currentNode.parentElement;
        const context = parent ? parent.tagName.toLowerCase() : 'text';

        translations.push({
          original: text,
          context: context,
          selector: getUniqueSelector(parent, document)
        });
      }
    }
  }

  return translations;
}

/**
 * Generate a unique selector for an element
 */
function getUniqueSelector(element, document) {
  if (!element) return null;

  // Try ID first
  if (element.id) {
    return `#${element.id}`;
  }

  // Build path using classes and position
  const path = [];
  let current = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    // Add classes if available
    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).filter(c => c && !c.match(/^js-/));
      if (classes.length > 0) {
        selector += '.' + classes.slice(0, 2).join('.');
      }
    }

    // Add data attributes for specificity
    if (current.hasAttribute('data-i18n')) {
      selector += `[data-i18n="${current.getAttribute('data-i18n')}"]`;
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

/**
 * Translate content using Claude API with batching
 */
async function translateContent(items, sourceLang, targetLang) {
  console.log(`\n📝 Translating ${items.length} text segments...`);

  // Batch items for efficient API usage
  const batchSize = 50;
  const batches = [];

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  const results = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`   Batch ${i + 1}/${batches.length} (${batch.length} items)...`);

    // Create translation prompt
    const prompt = createTranslationPrompt(batch, sourceLang, targetLang);

    try {
      const message = await anthropic.messages.create({
        model: CONFIG.claudeModel,
        max_tokens: CONFIG.maxTokens,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const translatedText = message.content[0].text;
      const translations = parseTranslationResponse(translatedText, batch.length);
      results.push(...translations);

      // Small delay between batches to respect rate limits
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`   ❌ Error translating batch ${i + 1}:`, error.message);
      // Return originals on error
      results.push(...batch.map(item => item.original));
    }
  }

  return results;
}

/**
 * Create translation prompt for Claude
 */
function createTranslationPrompt(items, sourceLang, targetLang) {
  const languageNames = {
    en: 'English',
    nl: 'Dutch (Nederlands)',
    de: 'German (Deutsch)',
    fr: 'French (Français)',
    es: 'Spanish (Español)'
  };

  return `You are a professional translator specializing in AI companion and chat platform content.

Translate the following text segments from ${languageNames[sourceLang]} to ${languageNames[targetLang]}.

IMPORTANT RULES:
1. Preserve the EXACT meaning and tone
2. Maintain technical terms related to AI, chat platforms, and companions
3. Keep brand names unchanged (e.g., "Character.AI", "Replika", "ChatGPT")
4. Preserve any HTML entities or special characters
5. Keep the same formality level
6. Don't add explanations, only provide translations
7. Number each translation to match the input

Context: These texts are from AI companion platform review pages, including features, pros/cons, pricing, and user interface elements.

INPUT (${items.length} segments):
${items.map((item, idx) => `${idx + 1}. [${item.context}] ${item.original}`).join('\n')}

OUTPUT FORMAT:
Return ONLY the numbered translations, one per line:
1. [translated text]
2. [translated text]
...`;
}

/**
 * Parse Claude's translation response
 */
function parseTranslationResponse(response, expectedCount) {
  const lines = response.trim().split('\n');
  const translations = [];

  for (const line of lines) {
    const match = line.match(/^\d+\.\s*(.+)$/);
    if (match) {
      translations.push(match[1].trim());
    }
  }

  // Validate count
  if (translations.length !== expectedCount) {
    console.warn(`   ⚠️  Expected ${expectedCount} translations, got ${translations.length}`);
  }

  return translations;
}

/**
 * Apply translations to DOM
 */
function applyTranslations(dom, items, translations) {
  const document = dom.window.document;

  items.forEach((item, idx) => {
    if (!translations[idx]) return;

    try {
      const element = document.querySelector(item.selector);
      if (element) {
        // Find and replace the text node
        const walker = document.createTreeWalker(
          element,
          dom.window.NodeFilter.SHOW_TEXT,
          null
        );

        let textNode;
        while (textNode = walker.nextNode()) {
          if (textNode.textContent.trim() === item.original) {
            textNode.textContent = translations[idx];
            break;
          }
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Could not apply translation for: ${item.original.substring(0, 50)}...`);
    }
  });
}

/**
 * Update HTML metadata for target language
 */
function updateMetadata(dom, targetLang, slug) {
  const document = dom.window.document;

  // Update html lang attribute
  document.documentElement.setAttribute('lang', targetLang);

  // Update canonical and alternate links
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', `https://companionguide.ai/${targetLang}/companions/${slug}`);
  }

  // Add/update hreflang links
  let alternateEn = document.querySelector('link[rel="alternate"][hreflang="en"]');
  if (!alternateEn) {
    alternateEn = document.createElement('link');
    alternateEn.setAttribute('rel', 'alternate');
    alternateEn.setAttribute('hreflang', 'en');
    document.head.appendChild(alternateEn);
  }
  alternateEn.setAttribute('href', `https://companionguide.ai/companions/${slug}`);

  let alternateTarget = document.querySelector(`link[rel="alternate"][hreflang="${targetLang}"]`);
  if (!alternateTarget) {
    alternateTarget = document.createElement('link');
    alternateTarget.setAttribute('rel', 'alternate');
    alternateTarget.setAttribute('hreflang', targetLang);
    document.head.appendChild(alternateTarget);
  }
  alternateTarget.setAttribute('href', `https://companionguide.ai/${targetLang}/companions/${slug}`);

  // Update navigation links to point to Dutch versions
  document.querySelectorAll('nav a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('/') && !href.startsWith(`/${targetLang}`)) {
      // Add language prefix for internal links
      if (href === '/') {
        link.setAttribute('href', `/${targetLang}/`);
      } else if (!href.match(/\/(companions|categories|news|deals|contact)/)) {
        // Skip certain paths that should be language-prefixed
      } else {
        link.setAttribute('href', `/${targetLang}${href}`);
      }
    }
  });
}

/**
 * Process a single companion HTML file
 */
async function processCompanionFile(filename) {
  const slug = path.basename(filename, '.html');
  const sourcePath = path.join(CONFIG.sourceDir, filename);
  const targetPath = path.join(CONFIG.targetDir, filename);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing: ${slug}`);
  console.log(`${'='.repeat(60)}`);

  // Check if target already exists (unless force)
  if (!CONFIG.force && fs.existsSync(targetPath)) {
    console.log(`⏭️  Skipping (already exists, use --force to overwrite)`);
    return { slug, status: 'skipped' };
  }

  // Read source file
  const html = fs.readFileSync(sourcePath, 'utf-8');
  const dom = new JSDOM(html);

  // Extract translatable content
  console.log('📋 Extracting translatable content...');
  const items = extractTranslatableContent(dom);
  console.log(`   Found ${items.length} translatable segments`);

  if (CONFIG.dryRun) {
    console.log('\n🔍 DRY RUN - Sample content:');
    items.slice(0, 5).forEach((item, idx) => {
      console.log(`   ${idx + 1}. [${item.context}] ${item.original.substring(0, 60)}...`);
    });
    return { slug, status: 'dry-run', items: items.length };
  }

  // Translate content
  const translations = await translateContent(items, CONFIG.sourceLang, CONFIG.targetLang);

  // Apply translations to DOM
  console.log('✏️  Applying translations...');
  applyTranslations(dom, items, translations);

  // Update metadata
  console.log('🔧 Updating metadata...');
  updateMetadata(dom, CONFIG.targetLang, slug);

  // Write output file
  console.log('💾 Writing translated file...');

  // Ensure target directory exists
  if (!fs.existsSync(CONFIG.targetDir)) {
    fs.mkdirSync(CONFIG.targetDir, { recursive: true });
  }

  const translatedHtml = dom.serialize();
  fs.writeFileSync(targetPath, translatedHtml, 'utf-8');

  console.log(`✅ Successfully created: ${targetPath}`);

  return { slug, status: 'success', items: items.length, translations: translations.length };
}

/**
 * Main execution
 */
async function main() {
  console.log('\n🌍 AI-Powered Companion Page Translation');
  console.log(`   Source: ${CONFIG.sourceLang} → Target: ${CONFIG.targetLang}`);
  console.log(`   Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE'}`);

  // Check API key
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('\n❌ Error: ANTHROPIC_API_KEY environment variable not set');
    console.error('   Get your API key from: https://console.anthropic.com/');
    process.exit(1);
  }

  // Get list of companion files
  let files;
  if (CONFIG.singleFile) {
    files = [`${CONFIG.singleFile}.html`];
    console.log(`   Processing single file: ${CONFIG.singleFile}`);
  } else {
    files = fs.readdirSync(CONFIG.sourceDir)
      .filter(f => f.endsWith('.html'));
    console.log(`   Found ${files.length} companion pages`);
  }

  // Process each file
  const results = [];

  for (const file of files) {
    try {
      const result = await processCompanionFile(file);
      results.push(result);
    } catch (error) {
      console.error(`\n❌ Error processing ${file}:`, error.message);
      results.push({ slug: file, status: 'error', error: error.message });
    }
  }

  // Summary
  console.log('\n\n' + '='.repeat(60));
  console.log('📊 TRANSLATION SUMMARY');
  console.log('='.repeat(60));

  const successful = results.filter(r => r.status === 'success').length;
  const skipped = results.filter(r => r.status === 'skipped').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log(`✅ Successful: ${successful}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);

  if (CONFIG.dryRun) {
    console.log('\n💡 This was a dry run. Run without --dry-run to create files.');
  }

  console.log('\n✨ Done!\n');
}

// Run script
main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
