const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, '..', 'news');

// Articles to fix
const targetFiles = [
    'crushon-ai-alternatives-complete-guide-2025.html',
    'dreamgf-ai-alternatives-complete-guide-2025.html',
    'soulkyn-ai-alternatives-complete-guide-2025.html',
    'spicychat-ai-alternatives-complete-guide-2025.html'
];

console.log(`📝 Processing ${targetFiles.length} articles\n`);

let updated = 0;
let errors = 0;

targetFiles.forEach(file => {
    const filePath = path.join(newsDir, file);

    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${file}`);
        errors++;
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if already has companions.js
    if (content.includes('/js/companions.js')) {
        console.log(`✓ Already has companions.js: ${file}`);
        return;
    }

    // Add companions.js after article-companion-data.js
    const pattern = /(<script src="\/js\/article-companion-data\.js"><\/script>)/;

    if (pattern.test(content)) {
        content = content.replace(
            pattern,
            '$1\n    <script src="/js/companions.js"></script>'
        );
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${file}`);
        updated++;
    } else {
        console.log(`⚠️  Warning: ${file} - couldn't find article-companion-data.js to insert after`);
        errors++;
    }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updated} articles`);
console.log(`   ❌ Errors: ${errors} articles`);
