const fs = require('fs');
const path = require('path');

// HTML to insert
const lastUpdatedHTML = `
    <!-- Last Updated -->
    <div class="last-updated">
        <p data-i18n="lastUpdated">Last updated: <span id="last-updated-date"></span></p>
    </div>
`;

// Script tag to add
const scriptTag = '<script src="/js/last-updated.js"></script>';

// Find all news HTML files
const newsDir = '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/news';
const newsFiles = fs.readdirSync(newsDir)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join('news', file));

console.log(`Found ${newsFiles.length} news articles to update\n`);

let updatedCount = 0;
let skippedCount = 0;

newsFiles.forEach(file => {
    const filePath = path.join('/Users/sebastiaansmits/Documents/AI-Companion-Reviews', file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if last-updated already exists
    if (content.includes('class="last-updated"')) {
        console.log(`⏭️  Skipped ${file} (already has last-updated)`);
        skippedCount++;
        return;
    }

    // Find the LAST occurrence of </main> (before footer and related articles)
    const mainClosings = [];
    const regex = /<\/main>/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        mainClosings.push(match.index);
    }

    if (mainClosings.length === 0) {
        console.log(`❌ Skipped ${file} (no </main> tag found)`);
        skippedCount++;
        return;
    }

    // Use the LAST </main> tag (the one after footer)
    const lastMainClosingIndex = mainClosings[mainClosings.length - 1];

    // Insert last-updated HTML before the last </main> tag
    content = content.slice(0, lastMainClosingIndex) +
              lastUpdatedHTML +
              content.slice(lastMainClosingIndex);

    // Check if script tag already exists
    if (!content.includes('src="/js/last-updated.js"')) {
        // Find </body> tag and add script before it
        const bodyCloseIndex = content.lastIndexOf('</body>');
        if (bodyCloseIndex !== -1) {
            content = content.slice(0, bodyCloseIndex) +
                      '    ' + scriptTag + '\n' +
                      content.slice(bodyCloseIndex);
        }
    }

    // Write updated content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${file}`);
    updatedCount++;
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updatedCount}`);
console.log(`   ⏭️  Skipped: ${skippedCount}`);
console.log(`   📄 Total: ${newsFiles.length}`);
