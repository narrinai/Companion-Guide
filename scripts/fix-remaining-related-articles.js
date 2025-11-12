const fs = require('fs');
const path = require('path');

const problemFiles = [
    'news/ai-sex-chat-comprehensive-guide-2025.html',
    'news/soulgen-ai-adult-image-generation-guide-2025.html'
];

console.log(`Fixing ${problemFiles.length} files with remaining issues\n`);

problemFiles.forEach(file => {
    const filePath = path.join('/Users/sebastiaansmits/Documents/AI-Companion-Reviews', file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove any <div class="related-articles"> sections (content divs, not actual sections)
    // This regex removes div with class related-articles and its content until closing div
    const divRelatedRegex = /<div class="related-articles">[\s\S]*?<\/div>/g;
    const matches = content.match(divRelatedRegex);

    if (matches) {
        console.log(`Found ${matches.length} div.related-articles in ${file}`);
        // Remove all div.related-articles
        content = content.replace(divRelatedRegex, '');
    }

    // Keep only <section class="related-articles">
    const sectionMatches = content.match(/<section class="related-articles">[\s\S]*?<\/section>/g);

    if (sectionMatches && sectionMatches.length > 1) {
        console.log(`Found ${sectionMatches.length} section.related-articles in ${file}`);
        // Remove all but the last section
        for (let i = 0; i < sectionMatches.length - 1; i++) {
            const regex = /<section class="related-articles">[\s\S]*?<\/section>/;
            content = content.replace(regex, '');
        }
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed ${file}\n`);
});

console.log('Done!');
