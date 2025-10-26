#!/usr/bin/env node

/**
 * Update all navigation links from "News & Insights" to "News & Guides"
 * Applies to all HTML files across the site
 */

const fs = require('fs');
const path = require('path');

// Recursively find HTML files
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            // Skip node_modules, .git, dist
            if (!['node_modules', '.git', 'dist'].includes(file)) {
                findHtmlFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    }

    return fileList;
}

const htmlFiles = findHtmlFiles('.');

let filesUpdated = 0;
let filesSkipped = 0;

console.log(`\n🔍 Found ${htmlFiles.length} HTML files to check\n`);

for (const file of htmlFiles) {
    const filePath = path.join(process.cwd(), file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Check if file contains "News & Insights"
    if (!content.includes('News & Insights')) {
        filesSkipped++;
        continue;
    }

    // Replace all occurrences
    let newContent = content;

    // Replace in navigation links (both desktop and mobile)
    newContent = newContent.replace(
        /<a href="([^"]*\/news)"([^>]*)>News & Insights<\/a>/g,
        '<a href="$1"$2>News & Guides</a>'
    );

    // Replace in any other contexts
    newContent = newContent.replace(/News & Insights/g, 'News & Guides');

    if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf-8');
        filesUpdated++;
        console.log(`  ✅ ${file}`);
    } else {
        filesSkipped++;
    }
}

console.log(`\n📊 Summary:`);
console.log(`  ✅ Updated: ${filesUpdated}`);
console.log(`  ⏭️  Skipped: ${filesSkipped}`);
console.log(`  📦 Total: ${htmlFiles.length}`);
console.log(`\n✨ All "News & Insights" labels updated to "News & Guides"\n`);
