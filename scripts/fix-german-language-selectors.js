const fs = require('fs');
const path = require('path');

// Find all German HTML files
function findGermanHtmlFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules' && file !== 'scripts') {
                findGermanHtmlFiles(filePath, fileList);
            }
        } else if (file.endsWith('.html')) {
            fileList.push(filePath);
        }
    });

    return fileList;
}

function fixGermanLanguageSelector(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if it has a lang-dropdown
    if (!content.includes('lang-dropdown')) {
        return;
    }

    const relativePath = filePath.replace(process.cwd() + '/de/', '');

    // Determine the URL path
    let urlPath;
    if (relativePath === 'index.html') {
        urlPath = '';
    } else {
        urlPath = relativePath.replace('.html', '');
    }

    // Create the correct language selector for German pages
    const correctDropdown = `<div class="lang-dropdown" id="lang-dropdown" style="display: none;">
                    <a href="/${urlPath}" class="lang-option">🇬🇧</a>
                    <a href="/de/${urlPath}" class="lang-option active">🇩🇪</a>
                    <a href="/nl/${urlPath}" class="lang-option">🇳🇱</a>
                    <a href="/pt/${urlPath}" class="lang-option">🇧🇷</a>
                </div>`;

    // Replace the old dropdown with the new one
    const langDropdownPattern = /<div class="lang-dropdown"[^>]*>[\s\S]*?<\/div>/;

    if (langDropdownPattern.test(content)) {
        const updatedContent = content.replace(langDropdownPattern, correctDropdown);
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        console.log(`✓ Fixed ${filePath.replace(process.cwd() + '/', '')}`);
    }
}

// Main execution
const deDir = path.join(process.cwd(), 'de');
const germanFiles = findGermanHtmlFiles(deDir);

console.log(`Found ${germanFiles.length} German HTML files\n`);

germanFiles.forEach(file => {
    try {
        fixGermanLanguageSelector(file);
    } catch (error) {
        console.error(`Error fixing ${file}:`, error.message);
    }
});

console.log('\n✓ Done!');
