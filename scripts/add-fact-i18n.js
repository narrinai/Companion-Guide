#!/usr/bin/env node

/**
 * Add data-i18n attributes to quick-facts section headers
 * in all companion pages (EN, PT, NL)
 */

const fs = require('fs');
const path = require('path');

function findCompanionHtmlFiles(dirs) {
    let files = [];
    for (const dir of dirs) {
        const dirPath = path.join(process.cwd(), dir);
        if (!fs.existsSync(dirPath)) continue;

        const dirFiles = fs.readdirSync(dirPath)
            .filter(f => f.endsWith('.html'))
            .map(f => path.join(dirPath, f));

        files = files.concat(dirFiles);
    }
    return files;
}

const dirs = ['companions', 'pt/companions', 'nl/companions'];
const companionFiles = findCompanionHtmlFiles(dirs);

let filesUpdated = 0;
let filesSkipped = 0;

console.log(`\n🔍 Found ${companionFiles.length} companion files to check\n`);

for (const filePath of companionFiles) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let updated = false;

    // Update "Best For" header
    const bestForRegex = /<h3>Best For<\/h3>/g;
    if (content.match(bestForRegex)) {
        content = content.replace(bestForRegex, '<h3 data-i18n="companion.bestForLabel">Best For</h3>');
        updated = true;
    }

    // Update "Platform" header
    const platformRegex = /<h3>Platform<\/h3>/g;
    if (content.match(platformRegex)) {
        content = content.replace(platformRegex, '<h3 data-i18n="companion.platformLabel">Platform</h3>');
        updated = true;
    }

    // Update "Content Policy" header
    const contentPolicyRegex = /<h3>Content Policy<\/h3>/g;
    if (content.match(contentPolicyRegex)) {
        content = content.replace(contentPolicyRegex, '<h3 data-i18n="companion.contentPolicyLabel">Content Policy</h3>');
        updated = true;
    }

    // Update "Pricing" header if it doesn't have data-i18n yet
    const pricingRegex = /<h3>Pricing<\/h3>/g;
    if (content.match(pricingRegex)) {
        content = content.replace(pricingRegex, '<h3 data-i18n="companion.pricingLabel">Pricing</h3>');
        updated = true;
    }

    if (updated) {
        fs.writeFileSync(filePath, content, 'utf-8');
        filesUpdated++;
        console.log(`  ✅ ${path.relative(process.cwd(), filePath)}`);
    } else {
        filesSkipped++;
    }
}

console.log(`\n📊 Summary:`);
console.log(`  ✅ Updated: ${filesUpdated}`);
console.log(`  ⏭️  Skipped: ${filesSkipped}`);
console.log(`  📦 Total: ${companionFiles.length}`);
console.log(`\n✨ Added data-i18n attributes to quick-facts headers\n`);
