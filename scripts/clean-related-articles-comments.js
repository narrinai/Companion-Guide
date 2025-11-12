const fs = require('fs');
const path = require('path');

// Find all news HTML files
const newsDir = '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/news';
const newsFiles = fs.readdirSync(newsDir)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join('news', file));

console.log(`Found ${newsFiles.length} news articles to clean\n`);

let updatedCount = 0;

newsFiles.forEach(file => {
    const filePath = path.join('/Users/sebastiaansmits/Documents/AI-Companion-Reviews', file);
    let content = fs.readFileSync(filePath, 'utf8');

    const originalContent = content;

    // Remove standalone <!-- Related Articles --> comments (not followed immediately by <section)
    content = content.replace(/<!-- Related Articles -->\s*(?!<section)/g, '');

    // Remove excessive whitespace (more than 2 consecutive blank lines)
    content = content.replace(/\n\n\n+/g, '\n\n');

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Cleaned ${file}`);
        updatedCount++;
    } else {
        console.log(`⏭️  Skipped ${file} (no changes needed)`);
    }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Cleaned: ${updatedCount}`);
console.log(`   📄 Total: ${newsFiles.length}`);
