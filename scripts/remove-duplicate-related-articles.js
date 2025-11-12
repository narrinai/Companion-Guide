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

    // Count how many related-articles sections exist
    const relatedMatches = content.match(/<section class="related-articles">[\s\S]*?<\/section>/g);

    if (!relatedMatches || relatedMatches.length <= 1) {
        console.log(`⏭️  Skipped ${file} (has ${relatedMatches ? relatedMatches.length : 0} related-articles section(s))`);
        skippedCount++;
        return;
    }

    console.log(`🔍 ${file} has ${relatedMatches.length} related-articles sections`);

    // Remove the first N-1 related-articles sections, keeping only the last one
    const sectionsToRemove = relatedMatches.length - 1;

    for (let i = 0; i < sectionsToRemove; i++) {
        // Find and remove the first related-articles section each time
        const relatedRegex = /<section class="related-articles">[\s\S]*?<\/section>/;
        content = content.replace(relatedRegex, '');
    }

    // Write updated content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${file} (removed ${sectionsToRemove} duplicate related-articles section(s))`);
    updatedCount++;
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updatedCount}`);
console.log(`   ⏭️  Skipped: ${skippedCount}`);
console.log(`   📄 Total: ${newsFiles.length}`);
