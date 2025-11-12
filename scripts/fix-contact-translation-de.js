const fs = require('fs');
const path = require('path');

// Find all German HTML files
const deFiles = [
    'de/index.html',
    'de/news.html',
    'de/contact.html',
    'de/companions.html',
    'de/deals.html',
    'de/categories.html'
];

console.log(`Found ${deFiles.length} German pages to update\n`);

let updatedCount = 0;

deFiles.forEach(file => {
    const filePath = path.join('/Users/sebastiaansmits/Documents/AI-Companion-Reviews', file);

    if (!fs.existsSync(filePath)) {
        console.log(`⏭️  Skipped ${file} (file does not exist)`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    const originalContent = content;

    // Replace all occurrences of Contact links without data-i18n
    // Pattern: <a href="/de/contact">Contact</a>
    content = content.replace(
        /<a href="\/de\/contact">Contact<\/a>/g,
        '<a href="/de/contact" data-i18n="nav.contact">Kontakt</a>'
    );

    // Also handle cases where it might be on a new line or with extra spaces
    content = content.replace(
        /<a href="\/de\/contact"\s*>Contact<\/a>/g,
        '<a href="/de/contact" data-i18n="nav.contact">Kontakt</a>'
    );

    // Also replace Contact that is already there but needs the data-i18n attribute
    content = content.replace(
        /<a href="\/de\/contact"\s*>Kontakt<\/a>/g,
        '<a href="/de/contact" data-i18n="nav.contact">Kontakt</a>'
    );

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated ${file}`);
        updatedCount++;
    } else {
        console.log(`⏭️  No changes needed for ${file}`);
    }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updatedCount}`);
console.log(`   📄 Total: ${deFiles.length}`);
