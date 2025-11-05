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

// New script to add (to replace the old toggleMenu function)
const newScript = `    <script>
        // Load featured companions in footer
        document.addEventListener('DOMContentLoaded', async () => {
            if (window.companionManager && window.companionManager.renderFooterFeaturedCompanions) {
                try {
                    await window.companionManager.renderFooterFeaturedCompanions('featured-companions-footer');
                } catch (error) {
                    console.error('Error loading footer companions:', error);
                }
            }
        });
    </script>`;

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

    // Remove the old embedded toggleMenu function
    const toggleMenuRegex = /\s+<script>\s+\/\/ Mobile menu toggle\s+function toggleMenu\(\) \{[\s\S]*?\}\s+<\/script>/;

    if (toggleMenuRegex.test(content)) {
        content = content.replace(toggleMenuRegex, newScript);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✅ Updated: ${file}`);
        updated++;
    } else {
        console.log(`⚠️  Warning: ${file} - couldn't find toggleMenu function to replace`);
        errors++;
    }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updated} articles`);
console.log(`   ❌ Errors: ${errors} articles`);
