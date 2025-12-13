#!/usr/bin/env node
/**
 * Generate Spanish companion pages from English templates
 *
 * This script:
 * 1. Reads each EN companion HTML file
 * 2. Changes lang="en" to lang="es"
 * 3. Updates URL paths from root to /es/
 * 4. Adds Spanish to language switcher
 * 5. Updates hreflang tags
 * 6. Does NOT change any content - all dynamic content loads from Airtable via JS
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const EN_COMPANIONS_DIR = path.join(BASE_DIR, 'companions');
const ES_COMPANIONS_DIR = path.join(BASE_DIR, 'es', 'companions');

// Create ES companions directory if it doesn't exist
if (!fs.existsSync(ES_COMPANIONS_DIR)) {
    fs.mkdirSync(ES_COMPANIONS_DIR, { recursive: true });
}

function processFile(filename) {
    const enPath = path.join(EN_COMPANIONS_DIR, filename);
    const esPath = path.join(ES_COMPANIONS_DIR, filename);
    const slug = filename.replace('.html', '');

    let content = fs.readFileSync(enPath, 'utf8');

    // 1. Change lang="en" to lang="es"
    content = content.replace(/(<html[^>]*) lang="en"/i, '$1 lang="es"');

    // 2. Update canonical URL to include /es/
    content = content.replace(
        /<link rel="canonical" href="https:\/\/companionguide\.ai\/companions\/[^"]+"/,
        `<link rel="canonical" href="https://companionguide.ai/es/companions/${slug}"`
    );

    // 3. Add Spanish hreflang before x-default
    if (!content.includes('hreflang="es"')) {
        content = content.replace(
            /(<link rel="alternate" hreflang="x-default")/,
            `<link rel="alternate" hreflang="es" href="https://companionguide.ai/es/companions/${slug}">\n    $1`
        );
    }

    // 4. Fix the language switcher FIRST (before any other replacements)
    // Extract the lang-dropdown section
    const langDropdownRegex = /(<div class="lang-dropdown"[^>]*>)([\s\S]*?)(<\/div>\s*<\/div>\s*<\/nav>)/;
    content = content.replace(langDropdownRegex, (match, start, options, end) => {
        // Build new language options with ES active
        const newOptions = `
                    <a href="/companions/${slug}" class="lang-option">🇬🇧</a>
                    <a href="/de/companions/${slug}" class="lang-option">🇩🇪</a>
                    <a href="/nl/companions/${slug}" class="lang-option">🇳🇱</a>
                    <a href="/es/companions/${slug}" class="lang-option active">🇪🇸</a>
                    <a href="/pt/companions/${slug}" class="lang-option">🇧🇷</a>
                `;
        return start + newOptions + end;
    });

    // 5. Update internal links from /companions/ to /es/companions/ (but NOT in lang-dropdown)
    // Use a more targeted approach - only for links that are clearly content links
    content = content.replace(
        /href="\/companions\/([^"]+)"(?![^<]*lang-option)/g,
        (match, linkSlug) => `href="/es/companions/${linkSlug}"`
    );

    // 6. Update category links to /es/categories/
    content = content.replace(/href="\/categories\//g, 'href="/es/categories/');

    // 7. Update news links to /es/news/
    content = content.replace(/href="\/news\//g, 'href="/es/news/');

    // 8. Update root index link
    content = content.replace(/href="\/index\.html"/g, 'href="/es/index.html"');
    content = content.replace(/href="\/"(?=[^>]*>(?:Home|Inicio))/g, 'href="/es/"');

    // 9. Update footer links
    content = content.replace(/href="\/deals\.html"/g, 'href="/es/deals.html"');
    content = content.replace(/href="\/categories\.html"/g, 'href="/es/categories.html"');
    content = content.replace(/href="\/companions\.html"/g, 'href="/es/companions.html"');

    // 10. Update asset version for cache busting
    content = content.replace(/companion-page\.js\?v=\d+/g, 'companion-page.js?v=20251213');
    content = content.replace(/companion-header\.js\?v=\d+/g, 'companion-header.js?v=20251213');
    content = content.replace(/companions\.js\?v=\d+/g, 'companions.js?v=20251213');

    // 11. Convert relative paths to absolute paths (../js/ -> /js/, ../style.css -> /style.css)
    // This is needed because ES pages are in /es/companions/ but assets are in root
    content = content.replace(/src="\.\.\/js\//g, 'src="/js/');
    content = content.replace(/href="\.\.\/style\.css"/g, 'href="/style.css"');
    content = content.replace(/src="\.\.\/images\//g, 'src="/images/');
    content = content.replace(/src="\.\.\/script\.js/g, 'src="/script.js');

    // Write the Spanish file
    fs.writeFileSync(esPath, content, 'utf8');

    return true;
}

function main() {
    console.log('🇪🇸 Generating Spanish companion pages from EN templates\n');

    const files = fs.readdirSync(EN_COMPANIONS_DIR).filter(f => f.endsWith('.html'));
    console.log(`Found ${files.length} EN companion pages\n`);

    let success = 0;
    let failed = 0;

    for (const file of files) {
        try {
            process.stdout.write(`Processing: ${file}... `);
            processFile(file);
            console.log('✓');
            success++;
        } catch (error) {
            console.log(`✗ ${error.message}`);
            failed++;
        }
    }

    console.log(`\n🏁 Done!`);
    console.log(`   Success: ${success}`);
    console.log(`   Failed: ${failed}`);
}

main();
