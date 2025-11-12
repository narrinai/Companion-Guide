const fs = require('fs');
const path = require('path');

// Find all news HTML files
const newsDir = '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/news';
const newsFiles = fs.readdirSync(newsDir)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join('news', file));

console.log(`Found ${newsFiles.length} news articles to check\n`);

let updatedCount = 0;
let skippedCount = 0;

newsFiles.forEach(file => {
    const filePath = path.join('/Users/sebastiaansmits/Documents/AI-Companion-Reviews', file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Count how many footers exist
    const footerMatches = content.match(/<footer[^>]*>[\s\S]*?<\/footer>/g);

    if (!footerMatches || footerMatches.length <= 1) {
        console.log(`⏭️  Skipped ${file} (has ${footerMatches ? footerMatches.length : 0} footer(s))`);
        skippedCount++;
        return;
    }

    console.log(`🔍 ${file} has ${footerMatches.length} footers`);

    // Remove the first N-1 footers, keeping only the last one
    const footersToRemove = footerMatches.length - 1;

    for (let i = 0; i < footersToRemove; i++) {
        // Find and remove the first footer each time
        const footerRegex = /<footer[^>]*>[\s\S]*?<\/footer>/;
        content = content.replace(footerRegex, '');
    }

    // Write updated content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${file} (removed ${footersToRemove} duplicate footer(s))`);
    updatedCount++;
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updatedCount}`);
console.log(`   ⏭️  Skipped: ${skippedCount}`);
console.log(`   📄 Total: ${newsFiles.length}`);
