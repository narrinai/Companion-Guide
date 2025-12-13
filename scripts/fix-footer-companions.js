#!/usr/bin/env node
/**
 * Fix footer issues in companion pages:
 * 1. Remove "Visit Website" links from footer (inside <footer> tag)
 * 2. Add id="featured-companions-footer" to Featured AI Companions section
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const DIRS = [
    path.join(BASE_DIR, 'companions'),
    path.join(BASE_DIR, 'de', 'companions'),
    path.join(BASE_DIR, 'nl', 'companions'),
    path.join(BASE_DIR, 'pt', 'companions'),
    path.join(BASE_DIR, 'es', 'companions')
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Find the footer section
    const footerStart = content.indexOf('<footer>');
    const footerEnd = content.indexOf('</footer>');

    if (footerStart === -1 || footerEnd === -1) {
        return false;
    }

    const beforeFooter = content.substring(0, footerStart);
    let footerContent = content.substring(footerStart, footerEnd + '</footer>'.length);
    const afterFooter = content.substring(footerEnd + '</footer>'.length);

    // 1. Remove "Visit Website" links from footer
    // Match: <a href="..." class="pricing-cta" target="_blank" ...>Visit Website</a>
    const visitWebsiteRegex = /\s*<a href="[^"]*" class="pricing-cta" target="_blank"[^>]*>Visit Website<\/a>/g;
    const newFooter = footerContent.replace(visitWebsiteRegex, '');

    if (newFooter !== footerContent) {
        footerContent = newFooter;
        modified = true;
    }

    // 2. Add id="featured-companions-footer" to Featured AI Companions section
    // Only if it doesn't already have the id
    if (!footerContent.includes('id="featured-companions-footer"')) {
        // Find the Featured AI Companions section and add the ul with id
        const featuredRegex = /(<h4>Featured AI Companions<\/h4>)\s*\n(\s*)<!-- Dynamic content will be loaded here -->/;
        if (featuredRegex.test(footerContent)) {
            footerContent = footerContent.replace(
                featuredRegex,
                '$1\n$2<ul id="featured-companions-footer">\n$2    <!-- Dynamic content will be loaded here -->\n$2</ul>'
            );
            modified = true;
        }
    }

    if (modified) {
        content = beforeFooter + footerContent + afterFooter;
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    }
    return false;
}

function main() {
    console.log('Fixing footer issues in companion pages...\n');

    let totalFixed = 0;
    let totalProcessed = 0;

    for (const dir of DIRS) {
        if (!fs.existsSync(dir)) {
            console.log(`Skipping ${dir} (not found)`);
            continue;
        }

        const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
        console.log(`Processing ${files.length} files in ${path.relative(BASE_DIR, dir)}/`);

        for (const file of files) {
            const filePath = path.join(dir, file);
            totalProcessed++;
            try {
                if (processFile(filePath)) {
                    totalFixed++;
                    process.stdout.write('.');
                }
            } catch (error) {
                console.error(`\nError processing ${file}: ${error.message}`);
            }
        }
        console.log('');
    }

    console.log(`\nDone! Fixed ${totalFixed} of ${totalProcessed} files.`);
}

main();
