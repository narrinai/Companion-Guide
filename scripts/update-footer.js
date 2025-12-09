#!/usr/bin/env node
/**
 * Footer Update Script
 *
 * Updates footer navigation across all HTML pages in all languages.
 * Supports adding, removing, and updating footer navigation items.
 *
 * Usage:
 *   node scripts/update-footer.js add --item="best-for" --label="Best For" --after="categories"
 *   node scripts/update-footer.js remove --item="best-for"
 *   node scripts/update-footer.js list
 *   node scripts/update-footer.js sync-from-header  (sync footer nav with header nav)
 *
 * Options:
 *   --item      The href path (without language prefix), e.g., "best-for", "news", "deals"
 *   --label     The display text for the item
 *   --after     Insert after this item (for add command)
 *   --before    Insert before this item (for add command)
 *   --dry-run   Show what would be changed without making changes
 *   --lang      Only update specific language (en, nl, pt, de), default: all
 */

const fs = require('fs');
const path = require('path');

// Language configurations
const LANGUAGES = {
    en: { prefix: '', dir: '' },
    nl: { prefix: '/nl', dir: 'nl/' },
    pt: { prefix: '/pt', dir: 'pt/' },
    de: { prefix: '/de', dir: 'de/' }
};

// Navigation item labels per language (synced with locales/*.json)
const NAV_LABELS = {
    home: { en: 'Home', nl: 'Home', pt: 'Início', de: 'Startseite' },
    companions: { en: 'Companions', nl: 'Companions', pt: 'Companions', de: 'Companions' },
    categories: { en: 'Categories', nl: 'Categorieën', pt: 'Categorias', de: 'Kategorien' },
    'best-for': { en: 'Best For', nl: 'Beste Voor', pt: 'Melhor Para', de: 'Beste Für' },
    news: { en: 'News & Guides', nl: 'Nieuws & Gidsen', pt: 'Notícias & Guias', de: 'News & Guides' },
    'companions-az': { en: 'Companions A-Z', nl: 'Companions A-Z', pt: 'Companions A-Z', de: 'Companions A-Z' },
    deals: { en: 'Deals', nl: 'Aanbiedingen', pt: 'Ofertas', de: 'Angebote' },
    contact: { en: 'Contact', nl: 'Contact', pt: 'Contato', de: 'Kontakt' },
    'cookie-policy': { en: 'Cookie Policy', nl: 'Cookiebeleid', pt: 'Política de Cookies', de: 'Cookie-Richtlinie' },
    about: { en: 'About', nl: 'Over Ons', pt: 'Sobre', de: 'Über Uns' },
    privacy: { en: 'Privacy Policy', nl: 'Privacybeleid', pt: 'Política de Privacidade', de: 'Datenschutz' },
    terms: { en: 'Terms of Service', nl: 'Algemene Voorwaarden', pt: 'Termos de Serviço', de: 'Nutzungsbedingungen' }
};

// Parse command line arguments
function parseArgs() {
    const args = process.argv.slice(2);
    const command = args[0];
    const options = {};

    for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            options[key] = value || true;
        }
    }

    return { command, options };
}

// Recursively get HTML files from a directory
function getHtmlFilesFromDir(dir, baseDir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules' || entry.name.includes('backup')) continue;
            files.push(...getHtmlFilesFromDir(fullPath, baseDir));
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            if (entry.name.includes('backup') || entry.name.includes('_reordered')) continue;
            files.push(fullPath);
        }
    }
    return files;
}

// Get all HTML files that have footer
function getHtmlFiles(langFilter = null) {
    const baseDir = path.join(__dirname, '..');
    let allFiles = [];

    // For EN, get root html files and subdirectories
    if (!langFilter || langFilter === 'en') {
        const rootFiles = fs.readdirSync(baseDir)
            .filter(f => f.endsWith('.html') && !f.includes('backup') && !f.includes('_reordered'))
            .map(f => path.join(baseDir, f));
        allFiles.push(...rootFiles);

        ['companions', 'categories', 'news'].forEach(subdir => {
            const subdirPath = path.join(baseDir, subdir);
            if (fs.existsSync(subdirPath)) {
                allFiles.push(...getHtmlFilesFromDir(subdirPath, baseDir));
            }
        });
    }

    // For other languages
    ['nl', 'pt', 'de'].forEach(lang => {
        if (langFilter && langFilter !== lang) return;
        const langDir = path.join(baseDir, lang);
        if (fs.existsSync(langDir)) {
            allFiles.push(...getHtmlFilesFromDir(langDir, baseDir));
        }
    });

    // Filter to only files with footer
    return allFiles.filter(f => {
        try {
            const content = fs.readFileSync(f, 'utf8');
            return content.includes('<footer>');
        } catch (e) {
            return false;
        }
    });
}

// Detect language from file path
function detectLanguage(filePath) {
    if (filePath.includes('/nl/')) return 'nl';
    if (filePath.includes('/pt/')) return 'pt';
    if (filePath.includes('/de/')) return 'de';
    return 'en';
}

// Get href for item in specific language
function getHref(item, lang) {
    const prefix = LANGUAGES[lang].prefix;
    if (item === 'home') {
        return prefix ? `${prefix}/` : '/';
    }
    return `${prefix}/${item}`;
}

// Get label for item in specific language
function getLabel(item, lang, customLabel = null) {
    if (customLabel && lang === 'en') return customLabel;
    return NAV_LABELS[item]?.[lang] || customLabel || item;
}

// Find footer navigation section
function findFooterNav(content) {
    // Look for the Navigation section in footer
    const footerMatch = content.match(/<footer>([\s\S]*?)<\/footer>/);
    if (!footerMatch) return null;

    const footerContent = footerMatch[1];

    // Find the Navigation section specifically
    const navSectionMatch = footerContent.match(/<h4[^>]*>Navigation<\/h4>\s*<ul>([\s\S]*?)<\/ul>/i);
    if (!navSectionMatch) {
        // Try with data-i18n
        const navSectionMatch2 = footerContent.match(/<h4[^>]*data-i18n="footer\.navigation"[^>]*>[^<]*<\/h4>\s*<ul>([\s\S]*?)<\/ul>/i);
        if (navSectionMatch2) {
            return parseNavSection(navSectionMatch2, footerContent);
        }
        return null;
    }

    return parseNavSection(navSectionMatch, footerContent);
}

function parseNavSection(navSectionMatch, footerContent) {
    const navContent = navSectionMatch[1];
    const items = [];
    const itemRegex = /<li><a href="([^"]+)"([^>]*)>([^<]+)<\/a><\/li>/g;
    let match;

    while ((match = itemRegex.exec(navContent)) !== null) {
        const href = match[1];
        const attrs = match[2];
        const label = match[3];
        const i18nMatch = attrs.match(/data-i18n="([^"]+)"/);
        const i18nKey = i18nMatch ? i18nMatch[1] : null;

        // Extract item name from href
        const itemName = href.replace(/^\/(nl|pt|de)?\//, '/').replace(/^\//, '').replace(/\/$/, '') || 'home';

        items.push({ href, label, i18nKey, itemName, fullMatch: match[0] });
    }

    return { navContent, items, fullMatch: navSectionMatch[0], footerContent };
}

// Add footer navigation item
function addFooterNavItem(content, filePath, item, label, afterItem, beforeItem) {
    const lang = detectLanguage(filePath);
    const footerData = findFooterNav(content);

    if (!footerData) {
        console.log(`  ⚠️  No footer navigation found in ${path.basename(filePath)}`);
        return content;
    }

    // Check if item already exists
    const existingItem = footerData.items.find(i => i.itemName === item || i.href.endsWith(`/${item}`));
    if (existingItem) {
        console.log(`  ⏭️  Item "${item}" already exists in footer of ${path.basename(filePath)}`);
        return content;
    }

    // Find insertion point
    let insertIndex = -1;
    if (afterItem) {
        insertIndex = footerData.items.findIndex(i => i.itemName === afterItem || i.href.endsWith(`/${afterItem}`));
        if (insertIndex !== -1) insertIndex += 1;
    } else if (beforeItem) {
        insertIndex = footerData.items.findIndex(i => i.itemName === beforeItem || i.href.endsWith(`/${beforeItem}`));
    }

    if (insertIndex === -1) {
        console.log(`  ⚠️  Could not find insertion point in footer of ${path.basename(filePath)}`);
        return content;
    }

    // Create new item
    const href = getHref(item, lang);
    const displayLabel = getLabel(item, lang, label);
    const newItem = `<li><a href="${href}">${displayLabel}</a></li>`;

    // Find the actual position and insert
    const targetItem = afterItem
        ? footerData.items[insertIndex - 1]
        : footerData.items[insertIndex];

    if (!targetItem) {
        console.log(`  ⚠️  Target item not found in footer of ${path.basename(filePath)}`);
        return content;
    }

    // Get indentation
    const indentMatch = footerData.navContent.match(/(\s+)<li><a href/);
    const indent = indentMatch ? indentMatch[1] : '\n                        ';

    let newNavContent;
    if (afterItem) {
        newNavContent = footerData.navContent.replace(
            targetItem.fullMatch,
            targetItem.fullMatch + indent + newItem
        );
    } else {
        newNavContent = footerData.navContent.replace(
            targetItem.fullMatch,
            newItem + indent + targetItem.fullMatch
        );
    }

    const newFooterSection = footerData.fullMatch.replace(footerData.navContent, newNavContent);
    console.log(`  ✅ Added "${item}" to footer of ${path.basename(filePath)}`);

    return content.replace(footerData.fullMatch, newFooterSection);
}

// Remove footer navigation item
function removeFooterNavItem(content, filePath, item) {
    const footerData = findFooterNav(content);

    if (!footerData) {
        console.log(`  ⚠️  No footer navigation found in ${path.basename(filePath)}`);
        return content;
    }

    const existingItem = footerData.items.find(i => i.itemName === item || i.href.endsWith(`/${item}`));
    if (!existingItem) {
        console.log(`  ⏭️  Item "${item}" not found in footer of ${path.basename(filePath)}`);
        return content;
    }

    // Remove the item
    const newNavContent = footerData.navContent.replace(
        new RegExp(`\\s*${existingItem.fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
        ''
    );

    const newFooterSection = footerData.fullMatch.replace(footerData.navContent, newNavContent);
    console.log(`  ✅ Removed "${item}" from footer of ${path.basename(filePath)}`);

    return content.replace(footerData.fullMatch, newFooterSection);
}

// List footer navigation items
function listFooterNavItems(files) {
    console.log('\n📋 Footer Navigation Items by Language:\n');

    const byLang = { en: null, nl: null, pt: null, de: null };

    files.forEach(file => {
        const lang = detectLanguage(file);
        if (byLang[lang]) return;

        const content = fs.readFileSync(file, 'utf8');
        const footerData = findFooterNav(content);
        if (footerData) {
            byLang[lang] = { file, items: footerData.items };
        }
    });

    Object.entries(byLang).forEach(([lang, data]) => {
        if (!data) {
            console.log(`${lang.toUpperCase()}: No footer navigation found\n`);
            return;
        }
        console.log(`${lang.toUpperCase()} (${path.basename(data.file)}):`);
        data.items.forEach((item, idx) => {
            console.log(`  ${idx + 1}. ${item.label} → ${item.href}`);
        });
        console.log('');
    });
}

// Main execution
async function main() {
    const { command, options } = parseArgs();

    if (!command || command === 'help' || command === '--help') {
        console.log(`
Footer Update Script

Usage:
  node scripts/update-footer.js <command> [options]

Commands:
  add      Add a new footer navigation item
  remove   Remove a footer navigation item
  list     List current footer navigation items

Options:
  --item=<name>    The item name (e.g., "best-for", "news")
  --label=<text>   Display label
  --after=<item>   Insert after this item (for add)
  --before=<item>  Insert before this item (for add)
  --lang=<code>    Only update specific language (en, nl, pt, de)
  --dry-run        Preview changes without writing

Examples:
  node scripts/update-footer.js add --item="best-for" --label="Best For" --after="categories"
  node scripts/update-footer.js remove --item="best-for"
  node scripts/update-footer.js list
        `);
        return;
    }

    const files = getHtmlFiles(options.lang);
    console.log(`\n📂 Found ${files.length} HTML files with footer\n`);

    if (command === 'list') {
        listFooterNavItems(files);
        return;
    }

    if (command === 'add') {
        if (!options.item) {
            console.error('❌ Error: --item is required for add command');
            return;
        }
        if (!options.after && !options.before) {
            console.error('❌ Error: --after or --before is required for add command');
            return;
        }

        // Add to NAV_LABELS if not exists
        if (!NAV_LABELS[options.item]) {
            NAV_LABELS[options.item] = {
                en: options.label || options.item,
                nl: options.label || options.item,
                pt: options.label || options.item,
                de: options.label || options.item
            };
        }

        let updated = 0;
        files.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const newContent = addFooterNavItem(
                content, file, options.item, options.label,
                options.after, options.before
            );

            if (newContent !== content) {
                if (!options['dry-run']) {
                    fs.writeFileSync(file, newContent, 'utf8');
                }
                updated++;
            }
        });

        console.log(`\n📊 Summary: Updated ${updated} files${options['dry-run'] ? ' (dry-run)' : ''}`);
    }

    if (command === 'remove') {
        if (!options.item) {
            console.error('❌ Error: --item is required for remove command');
            return;
        }

        let updated = 0;
        files.forEach(file => {
            const content = fs.readFileSync(file, 'utf8');
            const newContent = removeFooterNavItem(content, file, options.item);

            if (newContent !== content) {
                if (!options['dry-run']) {
                    fs.writeFileSync(file, newContent, 'utf8');
                }
                updated++;
            }
        });

        console.log(`\n📊 Summary: Updated ${updated} files${options['dry-run'] ? ' (dry-run)' : ''}`);
    }
}

main().catch(console.error);
