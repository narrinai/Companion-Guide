const fs = require('fs');
const path = require('path');

// The footer HTML from news.html
const newsFooter = `<footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Companion Guide</h4>
                    <p>Your trusted source for AI companion reviews and guides</p>
                </div>
                <div class="footer-section">
                    <h4>Navigation</h4>
                    <ul>
                        <li><a href="/" data-i18n="nav.home">Home</a></li>
                        <li><a href="/companions" data-i18n="nav.companions">Companions</a></li>
                        <li><a href="/categories" data-i18n="nav.categories">Categories</a></li>
                        <li><a href="/best-for" data-i18n="nav.bestFor">Best For</a></li>
                        <li><a href="/news" data-i18n="nav.news">News & Guides</a></li>
                        <li><a href="/companions-az">Companions A-Z</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Featured AI Companions</h4>
                    <ul id="featured-companions-footer">
                        <!-- Dynamic content will be loaded here -->
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Featured Guides</h4>
                    <ul>
                        <li><a href="/news/crushon-ai-alternatives-complete-guide-2025">CrushOn AI Alternatives Guide</a></li>
                        <li><a href="/news/soulkyn-ai-alternatives-complete-guide-2025">Soulkyn AI Alternatives Guide</a></li>
                        <li><a href="/news/spicychat-ai-complete-guide-2025">SpicyChat AI Complete Guide</a></li>
                        <li><a href="/news/hammer-ai-complete-review-2025">Hammer AI Complete Review</a></li>
                        <li><a href="/news/soulgen-ai-adult-image-generation-guide-2025">SoulGen AI Complete Guide</a></li>
                        <li><a href="/news/character-ai-alternatives-complete-guide-2025">Character AI Alternatives Guide</a></li>
                        <li><a href="/news/dreamgf-ai-complete-review-2025">DreamGF AI Complete Guide</a></li>
                        <li><a href="/news/replika-ai-comprehensive-review-2025">Replika AI Comprehensive Review</a></li>
                        <li><a href="/news/nomi-ai-comprehensive-review-2025">Nomi AI Comprehensive Review</a></li>
                        <li><a href="/news/candy-ai-alternatives-complete-guide-2025">Candy AI Alternatives Guide</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 CompanionGuide. All rights reserved. | <a href="/cookie-policy" style="color: #888; text-decoration: underline;">Cookies</a> | <a href="/terms" style="color: #888; text-decoration: underline;">Terms</a> | <a href="/2257-compliance" style="color: #888; text-decoration: underline;">2257</a> | <a href="/dmca" style="color: #888; text-decoration: underline;">DMCA</a></p>
                <p style="font-size: 0.75rem; color: #666; margin-top: 8px;">This site contains affiliate links. We may earn a commission at no extra cost to you.</p>
            </div>
        </div>
    </footer>`;

// Find all news HTML files
const newsDir = '/Users/sebastiaansmits/Documents/AI-Companion-Reviews/news';
const newsFiles = fs.readdirSync(newsDir)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join('news', file));

console.log(`Found ${newsFiles.length} news articles to update\n`);

let updatedCount = 0;
let skippedCount = 0;

newsFiles.forEach(file => {
    const filePath = path.join('/Users/sebastiaansmits/Documents/AI-Companion-Reviews', file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Find and replace the footer
    const footerRegex = /<footer[^>]*>[\s\S]*?<\/footer>/;
    const footerMatch = content.match(footerRegex);

    if (!footerMatch) {
        console.log(`⏭️  Skipped ${file} (no footer found)`);
        skippedCount++;
        return;
    }

    // Replace the old footer with the new one
    content = content.replace(footerRegex, newsFooter);

    // Write updated content
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated ${file}`);
    updatedCount++;
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updatedCount}`);
console.log(`   ⏭️  Skipped: ${skippedCount}`);
console.log(`   📄 Total: ${newsFiles.length}`);
