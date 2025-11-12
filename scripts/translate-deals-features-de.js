const fs = require('fs');
const path = require('path');

const dealsFile = 'de/deals.html';
const filePath = path.join('/Users/sebastiaansmits/Documents/AI-Companion-Reviews', dealsFile);

console.log(`Translating features in ${dealsFile}\n`);

let content = fs.readFileSync(filePath, 'utf8');

// Replace feature titles with data-i18n attributes
const replacements = [
    {
        from: /<div class="deal-feature-title">Character Creation<\/div>/g,
        to: '<div class="deal-feature-title" data-i18n="features.characterCreation">Charaktererstellung</div>'
    },
    {
        from: /<div class="deal-feature-title">Unlimited Chat<\/div>/g,
        to: '<div class="deal-feature-title" data-i18n="features.unlimitedChat">Unbegrenzter Chat</div>'
    },
    {
        from: /<div class="deal-feature-title">Image & Video<\/div>/g,
        to: '<div class="deal-feature-title" data-i18n="features.imageAndVideo">Bilder & Videos</div>'
    },
    {
        from: /<div class="deal-feature-title">Discreet Billing<\/div>/g,
        to: '<div class="deal-feature-title" data-i18n="features.discreetBilling">Diskrete Abrechnung</div>'
    }
];

let changesMade = 0;

replacements.forEach(replacement => {
    const matches = content.match(replacement.from);
    if (matches) {
        console.log(`Found ${matches.length} occurrence(s) of: ${replacement.from.source.slice(0, 50)}...`);
        content = content.replace(replacement.from, replacement.to);
        changesMade += matches.length;
    }
});

fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n✅ Updated ${dealsFile} with ${changesMade} translations`);
