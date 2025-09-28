#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Companion name to URL mapping
const companionLinks = {
    'Character.AI': '/companions/character-ai',
    'Replika': '/companions/replika',
    'Candy AI': '/companions/candy-ai',
    'FantasyGF': '/companions/fantasygf-ai',
    'DreamGF AI': '/companions/dreamgf-ai',
    'Secrets AI': '/companions/secrets-ai',
    'Hammer AI': '/companions/hammer-ai',
    'Narrin.AI': '/companions/narrin-ai',
    'Narrin AI': '/companions/narrin-ai',
    'Simone': '/companions/simone',
    'Soulkyn AI': '/companions/soulkyn-ai',
    'GirlfriendGPT': '/companions/girlfriend-gpt',
    'SpicyChat AI': '/companions/spicychat-ai',
    'Janitor AI': '/companions/janitor-ai',
    'Kajiwoto': '/companions/kajiwoto-ai',
    'Chai AI': '/companions/chai-ai',
    'SoulGen AI': '/companions/soulgen-ai',
    'Nectar.AI': '/companions/nectar-ai',
    'Selira.ai': '/companions/selira-ai',
    'JOI AI': '/companions/joi-ai',
    'ThotChat AI': '/companions/thotchat-ai',
    'Lovescape': '/companions/lovescape',
    'Muah AI': '/companions/muah-ai',
    'Nomi AI': '/companions/nomi-ai',
    'Joyland AI': '/companions/joyland-ai',
    'Promptchan AI': '/companions/promptchan-ai',
    'Cuties AI': '/companions/cuties-ai',
    'Stories AI': '/companions/stories-ai',
    'Sakura AI': '/companions/sakura-ai',
    'Swipey AI': '/companions/swipey-ai',
    'Kupid AI': '/companions/kupid-ai',
    'Junipero AI': '/companions/junipero-ai',
    'OurDream AI': '/companions/ourdream-ai',
    'CaveDuck': '/companions/caveduck'
};

function addLinksToFAQAnswers(content) {
    // Find all FAQ answer sections
    let updatedContent = content;

    // Add links to companion names in FAQ answers
    Object.entries(companionLinks).forEach(([name, url]) => {
        // Create regex to find companion names that aren't already linked
        const regex = new RegExp(`(?<!<a[^>]*>)\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![^<]*<\/a>)`, 'g');

        // Replace with linked version, but only in FAQ answer sections
        updatedContent = updatedContent.replace(
            /<div class="faq-answer"[^>]*>(.*?)<\/div>/gs,
            (match) => {
                return match.replace(regex, `<a href="${url}">${name}</a>`);
            }
        );
    });

    return updatedContent;
}

function updateFileWithLinks(filePath) {
    try {
        console.log(`Processing: ${filePath}`);

        let content = fs.readFileSync(filePath, 'utf8');

        // Skip if no FAQ section
        if (!content.includes('faq-answer')) {
            console.log(`⚠️  No FAQ section found in ${filePath}`);
            return;
        }

        const updatedContent = addLinksToFAQAnswers(content);

        if (updatedContent !== content) {
            fs.writeFileSync(filePath, updatedContent, 'utf8');
            console.log(`✅ Updated links in: ${filePath}`);
        } else {
            console.log(`📝 No changes needed in: ${filePath}`);
        }

    } catch (error) {
        console.error(`❌ Error updating ${filePath}:`, error.message);
    }
}

function updateAllFAQLinks() {
    console.log('🔗 Adding companion links to FAQ answers...\n');

    // Get all HTML files with FAQs
    const allFiles = [];

    // Main pages
    ['index.html', 'categories.html', 'companions.html'].forEach(file => {
        const filePath = path.join(__dirname, file);
        if (fs.existsSync(filePath)) {
            allFiles.push(filePath);
        }
    });

    // Category pages
    const categoriesDir = path.join(__dirname, 'categories');
    if (fs.existsSync(categoriesDir)) {
        fs.readdirSync(categoriesDir)
            .filter(file => file.endsWith('.html'))
            .forEach(file => {
                allFiles.push(path.join(categoriesDir, file));
            });
    }

    // Companion pages
    const companionsDir = path.join(__dirname, 'companions');
    if (fs.existsSync(companionsDir)) {
        fs.readdirSync(companionsDir)
            .filter(file => file.endsWith('.html'))
            .forEach(file => {
                allFiles.push(path.join(companionsDir, file));
            });
    }

    // Update all files
    allFiles.forEach(updateFileWithLinks);

    console.log('\n✅ FAQ link updates completed!');
}

// Run if called directly
if (require.main === module) {
    updateAllFAQLinks();
}

module.exports = {
    addLinksToFAQAnswers,
    updateFileWithLinks,
    updateAllFAQLinks
};