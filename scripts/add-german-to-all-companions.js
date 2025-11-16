#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Add German flag to language switcher in all companion pages
 */

function updateLanguageSelector(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Determine the relative path from root
    const relativePath = filePath.replace(process.cwd() + '/', '');

    // Determine current language from path
    let currentLang = 'en';
    let companionSlug = '';

    if (relativePath.startsWith('nl/companions/')) {
        currentLang = 'nl';
        companionSlug = relativePath.replace('nl/companions/', '').replace('.html', '');
    } else if (relativePath.startsWith('pt/companions/')) {
        currentLang = 'pt';
        companionSlug = relativePath.replace('pt/companions/', '').replace('.html', '');
    } else if (relativePath.startsWith('de/companions/')) {
        currentLang = 'de';
        companionSlug = relativePath.replace('de/companions/', '').replace('.html', '');
    } else if (relativePath.startsWith('companions/')) {
        currentLang = 'en';
        companionSlug = relativePath.replace('companions/', '').replace('.html', '');
    }

    // Check if German flag already exists
    if (content.includes('🇩🇪')) {
        console.log(`✓ ${relativePath} - German flag already exists`);
        return;
    }

    // Find the language dropdown section
    const langDropdownPattern = /<div class="lang-dropdown"[^>]*>([\s\S]*?)<\/div>/;
    const match = content.match(langDropdownPattern);

    if (!match) {
        console.log(`⚠️  No lang-dropdown found in ${relativePath}`);
        return;
    }

    // Build new dropdown content based on current language
    let newDropdown;

    if (currentLang === 'en') {
        newDropdown = `
                    <a href="/companions/${companionSlug}" class="lang-option active">🇬🇧</a>
                    <a href="/de/companions/${companionSlug}" class="lang-option">🇩🇪</a>
                    <a href="/nl/companions/${companionSlug}" class="lang-option">🇳🇱</a>
                    <a href="/pt/companions/${companionSlug}" class="lang-option">🇧🇷</a>`;
    } else if (currentLang === 'de') {
        newDropdown = `
                    <a href="/companions/${companionSlug}" class="lang-option">🇬🇧</a>
                    <a href="/de/companions/${companionSlug}" class="lang-option active">🇩🇪</a>
                    <a href="/nl/companions/${companionSlug}" class="lang-option">🇳🇱</a>
                    <a href="/pt/companions/${companionSlug}" class="lang-option">🇧🇷</a>`;
    } else if (currentLang === 'nl') {
        newDropdown = `
                    <a href="/companions/${companionSlug}" class="lang-option">🇬🇧</a>
                    <a href="/de/companions/${companionSlug}" class="lang-option">🇩🇪</a>
                    <a href="/nl/companions/${companionSlug}" class="lang-option active">🇳🇱</a>
                    <a href="/pt/companions/${companionSlug}" class="lang-option">🇧🇷</a>`;
    } else if (currentLang === 'pt') {
        newDropdown = `
                    <a href="/companions/${companionSlug}" class="lang-option">🇬🇧</a>
                    <a href="/de/companions/${companionSlug}" class="lang-option">🇩🇪</a>
                    <a href="/nl/companions/${companionSlug}" class="lang-option">🇳🇱</a>
                    <a href="/pt/companions/${companionSlug}" class="lang-option active">🇧🇷</a>`;
    }

    // Replace the dropdown content
    const updatedContent = content.replace(
        langDropdownPattern,
        `<div class="lang-dropdown" id="lang-dropdown" style="display: none;">${newDropdown}
                </div>`
    );

    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✅ Updated ${relativePath}`);
}

// Process all companion directories
const companionDirs = [
    'companions',
    'nl/companions',
    'pt/companions',
    'de/companions'
];

console.log('🚀 Adding German flag to all companion pages...\n');

let totalUpdated = 0;

companionDirs.forEach(dir => {
    const dirPath = path.join(process.cwd(), dir);

    if (!fs.existsSync(dirPath)) {
        console.log(`⚠️  Directory not found: ${dir}`);
        return;
    }

    const files = fs.readdirSync(dirPath).filter(file => file.endsWith('.html'));

    console.log(`Processing ${dir}/ (${files.length} files):`);

    files.forEach(file => {
        try {
            updateLanguageSelector(path.join(dirPath, file));
            totalUpdated++;
        } catch (error) {
            console.error(`❌ Error updating ${file}:`, error.message);
        }
    });

    console.log('');
});

console.log(`\n✅ Done! Updated ${totalUpdated} companion pages`);
