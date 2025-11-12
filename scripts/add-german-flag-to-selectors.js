const fs = require('fs');
const path = require('path');

// Pages that have a German version
const pagesWithGerman = [
    'index.html',
    'deals.html',
    'contact.html',
    'news.html',
    'categories.html',
    'companions.html',
    'companions/candy-ai.html',
    'categories/adult-content-uncensored-companions.html'
];

// Find all HTML files with language selectors
function findHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules' && file !== 'scripts') {
                findHtmlFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html')) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (content.includes('lang-dropdown')) {
                fileList.push(filePath);
            }
        }
    });

    return fileList;
}

function updateLanguageSelector(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Determine the relative path from root
    const relativePath = filePath.replace(process.cwd() + '/', '');

    // Determine current language from path
    let currentLang = 'en';
    let basePath = relativePath;

    if (relativePath.startsWith('nl/')) {
        currentLang = 'nl';
        basePath = relativePath.substring(3);
    } else if (relativePath.startsWith('pt/')) {
        currentLang = 'pt';
        basePath = relativePath.substring(3);
    } else if (relativePath.startsWith('de/')) {
        currentLang = 'de';
        basePath = relativePath.substring(3);
    }

    // Check if this page has a German version
    const hasGermanVersion = pagesWithGerman.includes(basePath);

    if (!hasGermanVersion) {
        console.log(`Skipping ${relativePath} - no German version`);
        return;
    }

    // Build the German URL
    let germanUrl;
    if (basePath === 'index.html') {
        germanUrl = '/de/';
    } else {
        germanUrl = '/de/' + basePath.replace('.html', '');
    }

    // Check if German flag already exists
    if (content.includes('href="/de/') || content.includes('href="/de"')) {
        console.log(`Skipping ${relativePath} - German flag already exists`);
        return;
    }

    // Find the language dropdown section
    const langDropdownPattern = /<div class="lang-dropdown"[^>]*>([\s\S]*?)<\/div>/;
    const match = content.match(langDropdownPattern);

    if (!match) {
        console.log(`No lang-dropdown found in ${relativePath}`);
        return;
    }

    const dropdownContent = match[1];

    // Build new dropdown content based on current language
    let newDropdown;

    if (currentLang === 'en') {
        // English page
        newDropdown = `
                    <a href="/" class="lang-option active">🇬🇧</a>
                    <a href="${germanUrl}" class="lang-option">🇩🇪</a>
                    <a href="/nl/${basePath === 'index.html' ? '' : basePath.replace('.html', '')}" class="lang-option">🇳🇱</a>
                    <a href="/pt/${basePath === 'index.html' ? '' : basePath.replace('.html', '')}" class="lang-option">🇧🇷</a>`;
    } else if (currentLang === 'de') {
        // German page
        newDropdown = `
                    <a href="/${basePath === 'index.html' ? '' : basePath.replace('.html', '')}" class="lang-option">🇬🇧</a>
                    <a href="${germanUrl}" class="lang-option active">🇩🇪</a>
                    <a href="/nl/${basePath === 'index.html' ? '' : basePath.replace('.html', '')}" class="lang-option">🇳🇱</a>
                    <a href="/pt/${basePath === 'index.html' ? '' : basePath.replace('.html', '')}" class="lang-option">🇧🇷</a>`;
    } else if (currentLang === 'nl') {
        // Dutch page
        newDropdown = `
                    <a href="/${basePath === 'index.html' ? '' : basePath.replace('.html', '')}" class="lang-option">🇬🇧</a>
                    <a href="${germanUrl}" class="lang-option">🇩🇪</a>
                    <a href="/nl/${basePath === 'index.html' ? '' : basePath.replace('.html', '')}" class="lang-option active">🇳🇱</a>
                    <a href="/pt/${basePath === 'index.html' ? '' : basePath.replace('.html', '')}" class="lang-option">🇧🇷</a>`;
    } else if (currentLang === 'pt') {
        // Portuguese page
        newDropdown = `
                    <a href="/${basePath === 'index.html' ? '' : basePath.replace('.html', '')}" class="lang-option">🇬🇧</a>
                    <a href="${germanUrl}" class="lang-option">🇩🇪</a>
                    <a href="/nl/${basePath === 'index.html' ? '' : basePath.replace('.html', '')}" class="lang-option">🇳🇱</a>
                    <a href="/pt/${basePath === 'index.html' ? '' : basePath.replace('.html', '')}" class="lang-option active">🇧🇷</a>`;
    }

    // Replace the dropdown content
    const updatedContent = content.replace(
        langDropdownPattern,
        `<div class="lang-dropdown" id="lang-dropdown" style="display: none;">${newDropdown}
                </div>`
    );

    fs.writeFileSync(filePath, updatedContent, 'utf8');
    console.log(`✓ Updated ${relativePath}`);
}

// Main execution
const rootDir = process.cwd();
const htmlFiles = findHtmlFiles(rootDir);

console.log(`Found ${htmlFiles.length} HTML files with language selectors\n`);

htmlFiles.forEach(file => {
    try {
        updateLanguageSelector(file);
    } catch (error) {
        console.error(`Error updating ${file}:`, error.message);
    }
});

console.log('\n✓ Done!');
