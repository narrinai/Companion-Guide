#!/usr/bin/env node
/**
 * Update footer-bottom section on all pages
 * Adds Cookie Policy, Terms links, and affiliate disclosure
 */

const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');

// New footer-bottom content
const newFooterBottom = `<div class="footer-bottom">
                <p>&copy; 2025 CompanionGuide. All rights reserved. | <a href="/cookie-policy" style="color: #888; text-decoration: underline;">Cookies</a> | <a href="/terms" style="color: #888; text-decoration: underline;">Terms</a> | <a href="/2257-compliance" style="color: #888; text-decoration: underline;">2257</a> | <a href="/dmca" style="color: #888; text-decoration: underline;">DMCA</a></p>
                <p style="font-size: 0.75rem; color: #666; margin-top: 8px;">This site contains affiliate links. We may earn a commission at no extra cost to you.</p>
            </div>`;

// Recursively get all HTML files
function getHtmlFiles(dir) {
    const files = [];
    if (!fs.existsSync(dir)) return files;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            if (entry.name === 'node_modules') continue;
            files.push(...getHtmlFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            files.push(fullPath);
        }
    }
    return files;
}

// Get all HTML files
const allFiles = getHtmlFiles(baseDir);
console.log(`Found ${allFiles.length} HTML files\n`);

let updated = 0;
let skipped = 0;
let noFooter = 0;

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');

    // Check if file has footer-bottom
    if (!content.includes('footer-bottom')) {
        noFooter++;
        return;
    }

    // Skip if already updated (has both cookie-policy and affiliate text)
    if (content.includes('/cookie-policy') && content.includes('affiliate links')) {
        skipped++;
        return;
    }

    // Replace footer-bottom section
    // Match various patterns of footer-bottom
    const patterns = [
        // Pattern 1: Standard with compliance links
        /<div class="footer-bottom">\s*<p>&copy; 2025 CompanionGuide\. All rights reserved\.\s*\|\s*<a href="\/2257-compliance"[^>]*>Compliance Statement<\/a>\s*\|\s*<a href="\/dmca"[^>]*>DMCA & Copyright<\/a><\/p>\s*<\/div>/g,
        // Pattern 2: Just copyright
        /<div class="footer-bottom">\s*<p>&copy; 2025 CompanionGuide\. All rights reserved\.<\/p>\s*<\/div>/g,
        // Pattern 3: With extra whitespace
        /<div class="footer-bottom">\s*<p>&copy; 2025 CompanionGuide\.[^<]*<\/p>\s*<\/div>/g,
    ];

    let replaced = false;
    for (const pattern of patterns) {
        if (pattern.test(content)) {
            content = content.replace(pattern, newFooterBottom);
            replaced = true;
            break;
        }
    }

    if (replaced) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`✅ Updated: ${path.relative(baseDir, file)}`);
        updated++;
    } else {
        // Try a more generic replacement
        const genericPattern = /<div class="footer-bottom">[\s\S]*?<\/div>/;
        if (genericPattern.test(content) && !content.includes('affiliate links')) {
            content = content.replace(genericPattern, newFooterBottom);
            fs.writeFileSync(file, content, 'utf8');
            console.log(`✅ Updated (generic): ${path.relative(baseDir, file)}`);
            updated++;
        } else {
            console.log(`⚠️  Skipped (pattern mismatch): ${path.relative(baseDir, file)}`);
            skipped++;
        }
    }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updated}`);
console.log(`   ⏭️  Skipped (already done): ${skipped}`);
console.log(`   📭 No footer: ${noFooter}`);
