const fs = require('fs');
const path = require('path');

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

    // Find and extract the last-updated section
    const lastUpdatedRegex = /\s*<!-- Last Updated -->\s*<div class="last-updated">[\s\S]*?<\/div>/;
    const lastUpdatedMatch = content.match(lastUpdatedRegex);

    if (!lastUpdatedMatch) {
        console.log(`⏭️  Skipped ${file} (no last-updated section found)`);
        skippedCount++;
        return;
    }

    const lastUpdatedHTML = lastUpdatedMatch[0];

    // Remove the last-updated section from its current position
    content = content.replace(lastUpdatedRegex, '');

    // Find the closing tag of the related-articles section
    const relatedArticlesRegex = /<section class="related-articles">[\s\S]*?<\/section>/;
    const relatedMatch = content.match(relatedArticlesRegex);

    if (!relatedMatch) {
        console.log(`⏭️  Skipped ${file} (no related-articles section found)`);
        skippedCount++;
        return;
    }

    // Find the position after the related-articles closing tag
    const relatedEndIndex = content.indexOf('</section>', content.indexOf('class="related-articles"')) + '</section>'.length;

    // Insert last-updated section after related-articles
    content = content.slice(0, relatedEndIndex) +
              '\n' + lastUpdatedHTML +
              content.slice(relatedEndIndex);

    // Write updated content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${file}`);
    updatedCount++;
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updatedCount}`);
console.log(`   ⏭️  Skipped: ${skippedCount}`);
console.log(`   📄 Total: ${newsFiles.length}`);
