const fs = require('fs');
const path = require('path');

const directories = [
    './categories',
    './de/categories',
    './nl/categories',
    './pt/categories'
];

let updated = 0;
let skipped = 0;

directories.forEach(dir => {
    const fullDir = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullDir)) return;
    
    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.html'));
    
    files.forEach(file => {
        const filePath = path.join(fullDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Check if banner exists and review count is not already added
        if (content.includes('banner-rating-score') && !content.includes('banner-review-count')) {
            // Add review count span after rating score
            content = content.replace(
                /<span class="banner-rating-score" id="banner-rating"><\/span>/g,
                '<span class="banner-rating-score" id="banner-rating"></span>\n                            <span class="banner-review-count" id="banner-review-count"></span>'
            );
            
            fs.writeFileSync(filePath, content);
            updated++;
            console.log('Updated:', filePath);
        } else {
            skipped++;
        }
    });
});

console.log(`\nUpdated: ${updated}, Skipped: ${skipped}`);
