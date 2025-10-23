#!/usr/bin/env node

/**
 * AI-Powered Companion Page Translation Script (OpenAI version)
 *
 * Uses OpenAI GPT-4 for translations instead of Claude
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const OpenAI = require('openai');

// Configuration
const CONFIG = {
  sourceLang: 'en',
  targetLang: process.argv.find(arg => arg.startsWith('--lang='))?.split('=')[1] || 'nl',
  sourceDir: path.join(__dirname, '../companions'),
  targetDir: null,
  dryRun: process.argv.includes('--dry-run'),
  force: process.argv.includes('--force'),
  singleFile: process.argv.find(arg => arg.startsWith('--file='))?.split('=')[1] || null,

  // OpenAI API settings
  openaiModel: 'gpt-4-turbo-preview',
  maxTokens: 4096,
  retryAttempts: 3,
  retryDelay: 2000,

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
  ]
};

CONFIG.targetDir = path.join(__dirname, `../${CONFIG.targetLang}/companions`);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_COMPANIONGUIDE || process.env.OPENAI_API_KEY
});

// Reuse same helper functions from Claude version
function extractTranslatableContent(dom) {
  const document = dom.window.document;
  const translations = [];

  const walker = document.createTreeWalker(
    document.body,
    dom.window.NodeFilter.SHOW_ELEMENT | dom.window.NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        if (node.nodeType === 1) {
          for (const selector of CONFIG.skipSelectors) {
            if (node.matches && node.matches(selector)) {
              return dom.window.NodeFilter.FILTER_REJECT;
            }
          }
        }

        if (node.nodeType === 3) {
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
    if (currentNode.nodeType === 3) {
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

function getUniqueSelector(element, document) {
  if (!element) return null;

  if (element.id) {
    return `#${element.id}`;
  }

  const path = [];
  let current = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).filter(c => c && !c.match(/^js-/));
      if (classes.length > 0) {
        selector += '.' + classes.slice(0, 2).join('.');
      }
    }

    if (current.hasAttribute('data-i18n')) {
      selector += `[data-i18n="${current.getAttribute('data-i18n')}"]`;
    }

    path.unshift(selector);
    current = current.parentElement;
  }

  return path.join(' > ');
}

async function translateContent(items, sourceLang, targetLang) {
  console.log(`\n📝 Translating ${items.length} text segments with OpenAI GPT-4...`);

  const batchSize = 50;
  const batches = [];

  for (let i = 0; i < items.length; i += batchSize) {
    batches.push(items.slice(i, i + batchSize));
  }

  const results = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    console.log(`   Batch ${i + 1}/${batches.length} (${batch.length} items)...`);

    const prompt = createTranslationPrompt(batch, sourceLang, targetLang);

    let success = false;
    let attempt = 0;

    while (!success && attempt < CONFIG.retryAttempts) {
      try {
        attempt++;

        const completion = await openai.chat.completions.create({
          model: CONFIG.openaiModel,
          messages: [
            {
              role: 'system',
              content: 'You are a professional translator specializing in AI companion and chat platform content. Provide accurate, context-aware translations while preserving technical terms and brand names.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: CONFIG.maxTokens
        });

        const translatedText = completion.choices[0].message.content;
        const translations = parseTranslationResponse(translatedText, batch.length);
        results.push(...translations);
        success = true;

        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      } catch (error) {
        const errorMsg = error.message || JSON.stringify(error);

        if (attempt < CONFIG.retryAttempts) {
          console.log(`   ⏳ Retry ${attempt}/${CONFIG.retryAttempts} after ${CONFIG.retryDelay}ms...`);
          await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay));
        } else {
          console.error(`   ❌ Error translating batch ${i + 1} after ${CONFIG.retryAttempts} attempts:`, errorMsg);
          results.push(...batch.map(item => item.original));
        }
      }
    }
  }

  return results;
}

function createTranslationPrompt(items, sourceLang, targetLang) {
  const languageNames = {
    en: 'English',
    nl: 'Dutch (Nederlands)',
    de: 'German (Deutsch)',
    fr: 'French (Français)',
    es: 'Spanish (Español)'
  };

  return `Translate the following text segments from ${languageNames[sourceLang]} to ${languageNames[targetLang]}.

IMPORTANT RULES:
1. Preserve the EXACT meaning and tone
2. Keep technical terms related to AI, chat platforms, and companions unchanged
3. Keep brand names unchanged (e.g., "Character.AI", "Replika", "ChatGPT")
4. Preserve any HTML entities or special characters
5. Keep the same formality level
6. Don't add explanations, only provide translations
7. Number each translation to match the input

Context: These texts are from AI companion platform review pages.

INPUT (${items.length} segments):
${items.map((item, idx) => `${idx + 1}. [${item.context}] ${item.original}`).join('\n')}

OUTPUT FORMAT:
Return ONLY the numbered translations, one per line:
1. [translated text]
2. [translated text]
...`;
}

function parseTranslationResponse(response, expectedCount) {
  const lines = response.trim().split('\n');
  const translations = [];

  for (const line of lines) {
    const match = line.match(/^\d+\.\s*(.+)$/);
    if (match) {
      translations.push(match[1].trim());
    }
  }

  if (translations.length !== expectedCount) {
    console.warn(`   ⚠️  Expected ${expectedCount} translations, got ${translations.length}`);
  }

  return translations;
}

function applyTranslations(dom, items, translations) {
  const document = dom.window.document;

  items.forEach((item, idx) => {
    if (!translations[idx]) return;

    try {
      const element = document.querySelector(item.selector);
      if (element) {
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

function updateMetadata(dom, targetLang, slug) {
  const document = dom.window.document;

  document.documentElement.setAttribute('lang', targetLang);

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    canonical.setAttribute('href', `https://companionguide.ai/${targetLang}/companions/${slug}`);
  }

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

  document.querySelectorAll('nav a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('/') && !href.startsWith(`/${targetLang}`)) {
      if (href === '/') {
        link.setAttribute('href', `/${targetLang}/`);
      }
    }
  });
}

async function processCompanionFile(filename) {
  const slug = path.basename(filename, '.html');
  const sourcePath = path.join(CONFIG.sourceDir, filename);
  const targetPath = path.join(CONFIG.targetDir, filename);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Processing: ${slug}`);
  console.log(`${'='.repeat(60)}`);

  if (!CONFIG.force && fs.existsSync(targetPath)) {
    console.log(`⏭️  Skipping (already exists, use --force to overwrite)`);
    return { slug, status: 'skipped' };
  }

  const html = fs.readFileSync(sourcePath, 'utf-8');
  const dom = new JSDOM(html);

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

  const translations = await translateContent(items, CONFIG.sourceLang, CONFIG.targetLang);

  console.log('✏️  Applying translations...');
  applyTranslations(dom, items, translations);

  console.log('🔧 Updating metadata...');
  updateMetadata(dom, CONFIG.targetLang, slug);

  console.log('💾 Writing translated file...');

  if (!fs.existsSync(CONFIG.targetDir)) {
    fs.mkdirSync(CONFIG.targetDir, { recursive: true });
  }

  const translatedHtml = dom.serialize();
  fs.writeFileSync(targetPath, translatedHtml, 'utf-8');

  console.log(`✅ Successfully created: ${targetPath}`);

  return { slug, status: 'success', items: items.length, translations: translations.length };
}

async function main() {
  console.log('\n🌍 AI-Powered Companion Page Translation (OpenAI GPT-4)');
  console.log(`   Source: ${CONFIG.sourceLang} → Target: ${CONFIG.targetLang}`);
  console.log(`   Mode: ${CONFIG.dryRun ? 'DRY RUN' : 'LIVE'}`);

  if (!process.env.OPENAI_API_KEY_COMPANIONGUIDE && !process.env.OPENAI_API_KEY) {
    console.error('\n❌ Error: OPENAI_API_KEY environment variable not set');
    console.error('   Add to .env file: OPENAI_API_KEY_COMPANIONGUIDE=sk-...');
    process.exit(1);
  }

  let files;
  if (CONFIG.singleFile) {
    files = [`${CONFIG.singleFile}.html`];
    console.log(`   Processing single file: ${CONFIG.singleFile}`);
  } else {
    files = fs.readdirSync(CONFIG.sourceDir)
      .filter(f => f.endsWith('.html'));
    console.log(`   Found ${files.length} companion pages`);
  }

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

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
