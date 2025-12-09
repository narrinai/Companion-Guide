#!/usr/bin/env node
/**
 * Navigation Update Script
 *
 * Updates header navigation across all HTML pages in all languages.
 * Supports adding, removing, and updating navigation items.
 *
 * Usage:
 *   node scripts/update-navigation.js add --item="best-for" --label="Best For" --after="categories"
 *   node scripts/update-navigation.js remove --item="best-for"
 *   node scripts/update-navigation.js update --item="news" --label="News & Guides"
 *   node scripts/update-navigation.js list
 *
 * Options:
 *   --item      The href path (without language prefix), e.g., "best-for", "news", "deals"
 *   --label     The display text for the item (English - will use data-i18n for translations)
 *   --after     Insert after this item (for add command)
 *   --before    Insert before this item (for add command)
 *   --i18n      The data-i18n key, e.g., "nav.bestFor" (auto-generated if not provided)
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
    deals: { en: 'Deals', nl: 'Aanbiedingen', pt: 'Ofertas', de: 'Angebote' },
    contact: { en: 'Contact', nl: 'Contact', pt: 'Contato', de: 'Kontakt' },
    'companions-az': { en: 'Companions A-Z', nl: 'Companions A-Z', pt: 'Companions A-Z', de: 'Companions A-Z' },
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
            // Skip node_modules and backup directories
            if (entry.name === 'node_modules' || entry.name.includes('backup')) continue;
            files.push(...getHtmlFilesFromDir(fullPath, baseDir));
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            // Skip backup files
            if (entry.name.includes('backup') || entry.name.includes('_reordered')) continue;
            files.push(fullPath);
        }
    }
    return files;
}

// Get all HTML files that have navigation
function getHtmlFiles(langFilter = null) {
    const baseDir = path.join(__dirname, '..');
    const dirs = [];

    if (langFilter) {
        if (langFilter === 'en') {
            dirs.push(baseDir);
        } else {
            dirs.push(path.join(baseDir, langFilter));
        }
    } else {
        dirs.push(baseDir);
        dirs.push(path.join(baseDir, 'nl'));
        dirs.push(path.join(baseDir, 'pt'));
        dirs.push(path.join(baseDir, 'de'));
    }

    let allFiles = [];

    // For EN, get root html files and subdirectories
    if (!langFilter || langFilter === 'en') {
        // Get root HTML files
        const rootFiles = fs.readdirSync(baseDir)
            .filter(f => f.endsWith('.html') && !f.includes('backup') && !f.includes('_reordered'))
            .map(f => path.join(baseDir, f));
        allFiles.push(...rootFiles);

        // Get files from subdirectories
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

    // Filter to only files with nav-menu
    return allFiles.filter(f => {
        try {
            const content = fs.readFileSync(f, 'utf8');
            return content.includes('nav-menu');
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

// Generate i18n key from item name
function generateI18nKey(item) {
    // Convert "best-for" to "nav.bestFor"
    const camelCase = item.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    return `nav.${camelCase}`;
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

// Create navigation item HTML
function createNavItem(item, lang, i18nKey, customLabel = null, isActive = false) {
    const href = getHref(item, lang);
    const label = getLabel(item, lang, customLabel);
    const activeClass = isActive ? ' class="active"' : '';
    const i18nAttr = i18nKey ? ` data-i18n="${i18nKey}"` : '';

    return `<li><a href="${href}"${activeClass}${i18nAttr}>${label}</a></li>`;
}

// Find navigation items in content
function findNavItems(content) {
    const navMenuMatch = content.match(/<ul class="nav-menu">([\s\S]*?)<\/ul>/);
    if (!navMenuMatch) return null;

    const navContent = navMenuMatch[1];
    const items = [];
    const itemRegex = /<li><a href="([^"]+)"([^>]*)>([^<]+)<\/a><\/li>/g;
    let match;

    while ((match = itemRegex.exec(navContent)) !== null) {
        const href = match[1];
        const attrs = match[2];
        const label = match[3];
        const isActive = attrs.includes('class="active"');
        const i18nMatch = attrs.match(/data-i18n="([^"]+)"/);
        const i18nKey = i18nMatch ? i18nMatch[1] : null;

        // Extract item name from href
        const itemName = href.replace(/^\/(nl|pt|de)?\//, '/').replace(/^\//, '').replace(/\/$/, '') || 'home';

        items.push({ href, label, isActive, i18nKey, itemName, fullMatch: match[0] });
    }

    return { navContent, items, fullMatch: navMenuMatch[0] };
}

// Add navigation item
function addNavItem(content, filePath, item, label, i18nKey, afterItem, beforeItem) {
    const lang = detectLanguage(filePath);
    const navData = findNavItems(content);

    if (!navData) {
        console.log(`  ⚠️  No nav-menu found in ${path.basename(filePath)}`);
        return content;
    }

    // Check if item already exists
    const existingItem = navData.items.find(i => i.itemName === item || i.href.endsWith(`/${item}`));
    if (existingItem) {
        console.log(`  ⏭️  Item "${item}" already exists in ${path.basename(filePath)}`);
        return content;
    }

    // Find insertion point
    let insertIndex = -1;
    if (afterItem) {
        insertIndex = navData.items.findIndex(i => i.itemName === afterItem || i.href.endsWith(`/${afterItem}`));
        if (insertIndex !== -1) insertIndex += 1;
    } else if (beforeItem) {
        insertIndex = navData.items.findIndex(i => i.itemName === beforeItem || i.href.endsWith(`/${beforeItem}`));
    }

    if (insertIndex === -1) {
        console.log(`  ⚠️  Could not find insertion point in ${path.basename(filePath)}`);
        return content;
    }

    // Create new item
    const newItem = createNavItem(item, lang, i18nKey, label);

    // Find the actual position in navContent and insert
    const targetItem = afterItem
        ? navData.items[insertIndex - 1]
        : navData.items[insertIndex];

    if (!targetItem) {
        console.log(`  ⚠️  Target item not found in ${path.basename(filePath)}`);
        return content;
    }

    // Get indentation from existing items
    const indentMatch = navData.navContent.match(/(\s+)<li><a href/);
    const indent = indentMatch ? indentMatch[1] : '\n                ';

    let newNavContent;
    if (afterItem) {
        newNavContent = navData.navContent.replace(
            targetItem.fullMatch,
            targetItem.fullMatch + indent + newItem
        );
    } else {
        newNavContent = navData.navContent.replace(
            targetItem.fullMatch,
            newItem + indent + targetItem.fullMatch
        );
    }

    const newNavMenu = navData.fullMatch.replace(navData.navContent, newNavContent);
    console.log(`  ✅ Added "${item}" to ${path.basename(filePath)}`);

    return content.replace(navData.fullMatch, newNavMenu);
}

// Remove navigation item
function removeNavItem(content, filePath, item) {
    const navData = findNavItems(content);

    if (!navData) {
        console.log(`  ⚠️  No nav-menu found in ${path.basename(filePath)}`);
        return content;
    }

    const existingItem = navData.items.find(i => i.itemName === item || i.href.endsWith(`/${item}`));
    if (!existingItem) {
        console.log(`  ⏭️  Item "${item}" not found in ${path.basename(filePath)}`);
        return content;
    }

    // Remove the item and its surrounding whitespace
    const newNavContent = navData.navContent.replace(
        new RegExp(`\\s*${existingItem.fullMatch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
        ''
    );

    const newNavMenu = navData.fullMatch.replace(navData.navContent, newNavContent);
    console.log(`  ✅ Removed "${item}" from ${path.basename(filePath)}`);

    return content.replace(navData.fullMatch, newNavMenu);
}

// List navigation items
function listNavItems(files) {
    console.log('\n📋 Navigation Items by Language:\n');

    const byLang = { en: null, nl: null, pt: null, de: null };

    files.forEach(file => {
        const lang = detectLanguage(file);
        if (byLang[lang]) return; // Only need one example per language

        const content = fs.readFileSync(file, 'utf8');
        const navData = findNavItems(content);
        if (navData) {
            byLang[lang] = { file, items: navData.items };
        }
    });

    Object.entries(byLang).forEach(([lang, data]) => {
        if (!data) return;
        console.log(`${lang.toUpperCase()} (${path.basename(data.file)}):`);
        data.items.forEach((item, idx) => {
            const i18n = item.i18nKey ? ` [${item.i18nKey}]` : '';
            const active = item.isActive ? ' (active)' : '';
            console.log(`  ${idx + 1}. ${item.label} → ${item.href}${i18n}${active}`);
        });
        console.log('');
    });
}

// Main execution
async function main() {
    const { command, options } = parseArgs();

    if (!command || command === 'help' || command === '--help') {
        console.log(`
Navigation Update Script

Usage:
  node scripts/update-navigation.js <command> [options]

Commands:
  add      Add a new navigation item
  remove   Remove a navigation item
  list     List current navigation items

Options:
  --item=<name>    The item name (e.g., "best-for", "news")
  --label=<text>   Display label (English)
  --after=<item>   Insert after this item (for add)
  --before=<item>  Insert before this item (for add)
  --i18n=<key>     Custom i18n key (auto-generated if not provided)
  --lang=<code>    Only update specific language (en, nl, pt, de)
  --dry-run        Preview changes without writing

Examples:
  node scripts/update-navigation.js add --item="best-for" --label="Best For" --after="categories"
  node scripts/update-navigation.js remove --item="best-for"
  node scripts/update-navigation.js list
        `);
        return;
    }

    const files = getHtmlFiles(options.lang);
    console.log(`\n📂 Found ${files.length} HTML files with navigation\n`);

    if (command === 'list') {
        listNavItems(files);
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

        const i18nKey = options.i18n || generateI18nKey(options.item);

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
            const newContent = addNavItem(
                content, file, options.item, options.label,
                i18nKey, options.after, options.before
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
            const newContent = removeNavItem(content, file, options.item);

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
