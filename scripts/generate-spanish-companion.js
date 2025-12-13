/**
 * Script to generate Spanish companion pages from NL templates
 * Uses NL as base (correct footer structure) and converts to ES
 * All dynamic content loads from Airtable via JS
 */

const fs = require('fs');
const path = require('path');

const NL_DIR = '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/nl/companions';
const ES_DIR = '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/es/companions';

// Get slug from command line or use default
const targetSlug = process.argv[2] || 'secrets-ai';

function convertNlToEs(html, slug) {
    let result = html;

    // 1. Change lang attribute
    result = result.replace(/lang="nl"/g, 'lang="es"');

    // 2. Replace all /nl/ URL paths with /es/ EXCEPT in language switcher
    // First, protect the language switcher by replacing it with a placeholder
    const langSwitcherRegex = /<div class="lang-dropdown"[\s\S]*?<\/div>/;
    const langSwitcherMatch = result.match(langSwitcherRegex);
    let originalLangSwitcher = '';

    if (langSwitcherMatch) {
        originalLangSwitcher = langSwitcherMatch[0];
        result = result.replace(langSwitcherRegex, '___LANG_SWITCHER_PLACEHOLDER___');
    }

    // Now replace all /nl/ paths with /es/
    result = result.replace(/\/nl\//g, '/es/');
    result = result.replace(/href="\/nl"/g, 'href="/es"');

    // 3. Fix the language switcher:
    // - NL should link to /nl/ and NOT be active
    // - Add ES link with /es/ and make it active
    if (originalLangSwitcher) {
        let fixedSwitcher = originalLangSwitcher;

        // Remove active class from NL
        fixedSwitcher = fixedSwitcher.replace(
            /<a href="\/nl\/companions\/([^"]*)" class="lang-option active">🇳🇱<\/a>/,
            '<a href="/nl/companions/$1" class="lang-option">🇳🇱</a>'
        );

        // Add ES option after NL (before PT)
        fixedSwitcher = fixedSwitcher.replace(
            /(<a href="\/nl\/companions\/[^"]*" class="lang-option">🇳🇱<\/a>)(\s*)(<a href="\/pt\/companions\/)/,
            `$1$2<a href="/es/companions/${slug}" class="lang-option active">🇪🇸</a>$2$3`
        );

        // If no PT link found, add ES after NL before closing div
        if (!fixedSwitcher.includes('/es/companions/')) {
            fixedSwitcher = fixedSwitcher.replace(
                /(<a href="\/nl\/companions\/[^"]*" class="lang-option">🇳🇱<\/a>)(\s*)(<\/div>)/,
                `$1$2<a href="/es/companions/${slug}" class="lang-option active">🇪🇸</a>$2$3`
            );
        }

        result = result.replace('___LANG_SWITCHER_PLACEHOLDER___', fixedSwitcher);
    }

    // 4. Update hreflang - add ES before x-default
    if (!result.includes('hreflang="es"')) {
        result = result.replace(
            /<link rel="alternate" hreflang="x-default"/,
            `<link rel="alternate" hreflang="es" href="https://companionguide.ai/es/companions/${slug}">\n    <link rel="alternate" hreflang="x-default"`
        );
    }

    // 5. Replace Dutch AND English text with Spanish equivalents
    // Dutch replacements
    result = result.replace(/Bezoek Website →/g, 'Visitar Web →');
    result = result.replace(/Bezoek Website/g, 'Visitar Web');
    result = result.replace(/Lees Review/g, 'Leer Análisis');
    result = result.replace(/Lees Volledige Verdict/g, 'Leer Opinión Completa');

    // English replacements (some templates still have English text)
    result = result.replace(/Visit Website →/g, 'Visitar Web →');
    result = result.replace(/>Visit Website</g, '>Visitar Web<');
    result = result.replace(/Read Full Verdict/g, 'Leer Opinión Completa');
    result = result.replace(/Read Review/g, 'Leer Análisis');

    return result;
}

function generateSpanishCompanion(slug) {
    console.log(`\n📝 Generating Spanish page for: ${slug}`);

    // Check if NL template exists
    const nlPath = path.join(NL_DIR, `${slug}.html`);
    if (!fs.existsSync(nlPath)) {
        console.log(`❌ NL template not found: ${nlPath}`);
        return false;
    }

    // Read NL template
    const nlHtml = fs.readFileSync(nlPath, 'utf8');
    console.log(`  Read NL template: ${nlHtml.length} chars`);

    // Convert to Spanish
    const esHtml = convertNlToEs(nlHtml, slug);

    // Write ES file
    const esPath = path.join(ES_DIR, `${slug}.html`);
    fs.writeFileSync(esPath, esHtml);

    console.log(`✅ Created: ${esPath}`);
    return true;
}

function main() {
    console.log('🇪🇸 Generating Spanish companion page(s) from NL templates\n');
    console.log('Dynamic content (pricing, verdict, features, etc.) loads from Airtable via JS\n');

    // Ensure ES directory exists
    if (!fs.existsSync(ES_DIR)) {
        fs.mkdirSync(ES_DIR, { recursive: true });
    }

    if (targetSlug === 'all') {
        // Generate all companions
        const nlFiles = fs.readdirSync(NL_DIR).filter(f => f.endsWith('.html'));
        console.log(`Found ${nlFiles.length} NL templates\n`);

        let success = 0;
        let failed = 0;

        for (const file of nlFiles) {
            const slug = file.replace('.html', '');
            try {
                const result = generateSpanishCompanion(slug);
                if (result) success++;
                else failed++;
            } catch (error) {
                console.log(`❌ Error for ${slug}: ${error.message}`);
                failed++;
            }
        }

        console.log(`\n🏁 Done! Success: ${success}, Failed: ${failed}`);
    } else {
        // Generate single companion
        generateSpanishCompanion(targetSlug);
    }
}

main();
