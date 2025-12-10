const fs = require('fs');
const path = require('path');

// Banner HTML template
const bannerHTML = `
        <!-- Companion Spotlight Banner -->
        <section class="companion-card-banner" id="companion-spotlight-banner" data-slug="joi-ai">
            <span class="banner-spotlight-badge">Companion Spotlight</span>

            <div class="banner-main-row">
                <div class="banner-left">
                    <img src="" alt="" class="banner-logo" id="banner-logo">
                    <div class="banner-title-section">
                        <h3><a href="" id="banner-name-link"></a></h3>
                        <div class="banner-rating-line">
                            <span class="banner-stars" id="banner-stars"></span>
                            <span class="banner-rating-score" id="banner-rating"></span>
                        </div>
                    </div>
                </div>

                <div class="banner-images-container" id="banner-images">
                    <!-- Images loaded dynamically -->
                </div>

                <div class="banner-actions">
                    <a href="" class="banner-btn-primary" target="_blank" rel="noopener" id="banner-btn-primary">Try</a>
                    <a href="" class="banner-btn-secondary" target="_blank" rel="noopener" id="banner-btn-secondary">Visit Website</a>
                </div>
            </div>
        </section>

`;

// CSS link to add
const cssLink = '    <link rel="stylesheet" href="/css/companion-spotlight-banner.css">';

// JS script to add
const jsScript = '    <script src="/js/companion-spotlight-banner.js"></script>';

// Find all category HTML files
function findCategoryFiles(dir) {
    const files = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory() && item === 'categories') {
            const categoryFiles = fs.readdirSync(fullPath);
            for (const file of categoryFiles) {
                if (file.endsWith('.html') && !file.includes('backup') && !file.includes('test-')) {
                    files.push(path.join(fullPath, file));
                }
            }
        } else if (stat.isDirectory() && ['de', 'nl', 'pt'].includes(item)) {
            const langFiles = findCategoryFiles(fullPath);
            files.push(...langFiles);
        }
    }

    return files;
}

// Determine language from file path
function getLangFromPath(filePath) {
    if (filePath.includes('/de/')) return 'de';
    if (filePath.includes('/nl/')) return 'nl';
    if (filePath.includes('/pt/')) return 'pt';
    return 'en';
}

// Update a single category file
function updateCategoryFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    const lang = getLangFromPath(filePath);

    // Skip if already has the new banner
    if (content.includes('companion-spotlight-banner')) {
        console.log(`Skipping (already updated): ${filePath}`);
        return false;
    }

    // Add CSS link if not present
    if (!content.includes('companion-spotlight-banner.css')) {
        content = content.replace(
            /<link rel="stylesheet" href="\/faq-styles\.css">/,
            `<link rel="stylesheet" href="/faq-styles.css">\n${cssLink}`
        );
    }

    // Remove old promo-banner
    const promoBannerRegex = /\s*<!-- Promo Banner -->[\s\S]*?<\/div>\s*<\/div>\s*(?=<header>)/;
    content = content.replace(promoBannerRegex, '\n    ');

    // Also try alternative pattern
    const altPromoBannerRegex = /<div class="promo-banner"[\s\S]*?<\/div>\s*<\/div>\s*(?=<header>)/;
    content = content.replace(altPromoBannerRegex, '');

    // Add banner after <main class="container">
    const bannerWithLang = bannerHTML.replace('data-slug="joi-ai"', `data-slug="joi-ai" data-lang="${lang}"`);
    content = content.replace(
        /<main class="container">\s*(?=<!-- Category Hero -->|<section class="category-hero)/,
        `<main class="container">\n${bannerWithLang}`
    );

    // Add JS script if not present
    if (!content.includes('companion-spotlight-banner.js')) {
        // Add before </body>
        content = content.replace(
            /<\/body>/,
            `${jsScript}\n</body>`
        );
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
    return true;
}

// Main
const baseDir = path.join(__dirname, '..');
const categoryFiles = findCategoryFiles(baseDir);

console.log(`Found ${categoryFiles.length} category files`);
console.log('');

let updated = 0;
let skipped = 0;

for (const file of categoryFiles) {
    if (updateCategoryFile(file)) {
        updated++;
    } else {
        skipped++;
    }
}

console.log('');
console.log(`Done! Updated: ${updated}, Skipped: ${skipped}`);
