const fs = require('fs');
const path = require('path');

// Find all news HTML files
const newsDir = '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/news';
const newsFiles = fs.readdirSync(newsDir)
    .filter(file => file.endsWith('.html'))
    .sort();

console.log(`Checking ${newsFiles.length} news articles...\n`);

let allGood = 0;
let issues = 0;

newsFiles.forEach(file => {
    const filePath = path.join(newsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const footerCount = (content.match(/<footer/g) || []).length;
    const relatedCount = (content.match(/class="related-articles"/g) || []).length;
    const lastUpdatedCount = (content.match(/class="last-updated"/g) || []).length;

    const hasIssues = footerCount !== 1 || relatedCount > 1 || lastUpdatedCount !== 1;

    if (hasIssues) {
        console.log(`❌ ${file}: footer=${footerCount}, related=${relatedCount}, last-updated=${lastUpdatedCount}`);
        issues++;
    } else {
        allGood++;
    }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ All good: ${allGood}`);
console.log(`   ❌ Issues: ${issues}`);
console.log(`   📄 Total: ${newsFiles.length}`);

if (allGood === newsFiles.length) {
    console.log(`\n🎉 All news articles have correct structure!`);
}
