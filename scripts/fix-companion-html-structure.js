#!/usr/bin/env node
/**
 * Fix companion HTML structure for non-EN pages
 *
 * This script removes hardcoded content that should come from Airtable:
 * 1. Empties verdict-text div (content loaded from Airtable via JS)
 * 2. Removes personal-experience section (shouldn't exist on non-EN pages)
 *
 * The EN pages have the correct structure - this script makes NL/DE/PT match.
 */

const fs = require('fs');
const path = require('path');

const LANGUAGES = ['nl', 'de', 'pt'];
const BASE_DIR = path.join(__dirname, '..');

function fixCompanionFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // 1. Empty the verdict-text div (keep the div, remove content)
    // Match: <div class="verdict-text">...content...</div> followed by whitespace and </section>
    const verdictRegex = /(<div class="verdict-text">)([\s\S]*?)(<\/div>\s*<\/section>)/;
    const verdictMatch = content.match(verdictRegex);

    if (verdictMatch && verdictMatch[2].trim() !== '<!-- Content loaded from Airtable via JavaScript -->') {
        content = content.replace(verdictRegex, '$1\n                    <!-- Content loaded from Airtable via JavaScript -->\n                $3');
        modified = true;
        console.log(`  ✓ Fixed verdict-text div`);
    }

    // 2. Remove personal-experience section entirely
    const personalExpRegex = /<section class="personal-experience">[\s\S]*?<\/section>\s*(?=<!--\s*User Reviews Section|<section class="user-reviews">)/;
    if (personalExpRegex.test(content)) {
        content = content.replace(personalExpRegex, '');
        modified = true;
        console.log(`  ✓ Removed personal-experience section`);
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }

    return false;
}

function main() {
    console.log('🔧 Fixing companion HTML structure for non-EN pages\n');

    let totalFixed = 0;
    let totalChecked = 0;

    for (const lang of LANGUAGES) {
        const companionsDir = path.join(BASE_DIR, lang, 'companions');

        if (!fs.existsSync(companionsDir)) {
            console.log(`⚠️  Directory not found: ${companionsDir}`);
            continue;
        }

        const files = fs.readdirSync(companionsDir).filter(f => f.endsWith('.html'));
        console.log(`\n📁 Processing ${lang.toUpperCase()} (${files.length} files):`);

        for (const file of files) {
            const filePath = path.join(companionsDir, file);
            totalChecked++;

            console.log(`\n  Processing: ${file}`);
            const wasFixed = fixCompanionFile(filePath);

            if (wasFixed) {
                totalFixed++;
            } else {
                console.log(`  ✓ Already correct`);
            }
        }
    }

    console.log(`\n\n🏁 Done!`);
    console.log(`   Checked: ${totalChecked} files`);
    console.log(`   Fixed: ${totalFixed} files`);
}

main();
