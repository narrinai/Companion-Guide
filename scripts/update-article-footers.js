const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, '..', 'news');

const newFooter = `    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h4>Companion Guide</h4>
                    <p>Your trusted source for AI companion reviews and guides</p>
                </div>
                <div class="footer-section">
                    <h4>Navigation</h4>
                    <ul>
                        <li><a href="/">Home</a></li>
                        <li><a href="/companions">Companions</a></li>
                        <li><a href="/categories">Categories</a></li>
                        <li><a href="/news">News & Guides</a></li>
                        <li><a href="/companions-az">Companions A-Z</a></li>
                        <li><a href="/contact">Contact</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Featured AI Companions</h4>
                    <ul id="featured-companions-footer">
                        <!-- Dynamic content will be loaded here -->
                        <li><a href="/companions/hammer-ai">Hammer AI</a></li>
                        <li><a href="/companions/narrin-ai">Narrin AI</a></li>
                        <li><a href="/companions/ourdream-ai">Ourdream AI</a></li>
                        <li><a href="/companions/fantasygf-ai">FantasyGF</a></li>
                        <li><a href="/companions/dreamgf-ai">DreamGF</a></li>
                        <li><a href="/companions/secrets-ai">Secrets AI</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Featured Guides</h4>
                    <ul>
                        <li><a href="/news/best-ai-girlfriend-companions-2025">Best AI Girlfriend Companions 2025</a></li>
                        <li><a href="/news/dreamgf-ai-alternatives-complete-guide-2025">DreamGF AI Alternatives Guide</a></li>
                        <li><a href="/news/crushon-ai-alternatives-complete-guide-2025">Crushon AI Alternatives Guide</a></li>
                        <li><a href="/news/spicychat-ai-alternatives-complete-guide-2025">Spicychat AI Alternatives Guide</a></li>
                        <li><a href="/news/soulkyn-ai-alternatives-complete-guide-2025">Soulkyn AI Alternatives Guide</a></li>
                        <li><a href="/news/hammer-ai-complete-review-2025">Hammer AI Complete Review</a></li>
                        <li><a href="/news/character-ai-alternatives-complete-guide-2025">Character AI Alternatives Guide</a></li>
                        <li><a href="/news/dreamgf-ai-complete-review-2025">DreamGF AI Complete Guide</a></li>
                        <li><a href="/news/replika-ai-comprehensive-review-2025">Replika AI Comprehensive Review</a></li>
                        <li><a href="/news/candy-ai-alternatives-complete-guide-2025">Candy AI Alternatives Guide</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>&copy; 2025 Companion Guide. All rights reserved.</p>
            </div>
        </div>
    </footer>`;

// Get all HTML files in news directory
const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.html'));

console.log(`📝 Found ${files.length} articles\n`);

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(newsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace footer (from <footer> to </footer>)
  const footerRegex = /<footer>[\s\S]*?<\/footer>/;
  if (footerRegex.test(content)) {
    // Replace footer tag and content
    content = content.replace(footerRegex, newFooter.replace('    <!-- Footer -->\n', ''));
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${file}`);
    updated++;
  } else {
    console.log(`⚠️  Warning: ${file} has no footer section`);
    skipped++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updated} articles`);
console.log(`   ⏭️  Skipped: ${skipped} articles`);
console.log(`   📝 Total: ${files.length} articles`);
