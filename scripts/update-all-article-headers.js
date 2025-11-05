const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, '..', 'news');

const newHeader = `    <header>
        <nav class="container">
            <h1><a href="/"><img src="/images/logo.svg" alt="CompanionGuide.ai" width="32" height="32">CompanionGuide.ai</a></h1>

            <ul class="nav-menu">
                <div class="mobile-menu-logo">
                    <img src="/images/logo.svg" alt="CompanionGuide.ai" width="48" height="48">
                    <span>CompanionGuide.ai</span>
                </div>
                <li><a href="/">Home</a></li>
                <li><a href="/companions">Companions</a></li>
                <li><a href="/categories">Categories</a></li>
                <li><a href="/news" class="active">News & Guides</a></li>
                <li><a href="/deals">Deals</a></li>
                <li><a href="/contact">Contact</a></li>
            </ul>

            <!-- Language Switcher -->
            <div class="language-switcher">
                <button id="lang-toggle" class="lang-current"></button>
                <div class="lang-dropdown" id="lang-dropdown" style="display: none;">
                    <a href="#" class="lang-option active">🇬🇧</a>
                    <a href="#" class="lang-option">🇳🇱</a>
                    <a href="#" class="lang-option">🇧🇷</a>
                </div>
            </div>

            <div class="hamburger" onclick="toggleMenu()">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
        <div class="nav-menu-overlay" onclick="toggleMenu()"></div>
    </header>`;

// Get all HTML files in news directory
const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.html'));

console.log(`📝 Found ${files.length} articles\n`);

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(newsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace header (from <header> to </header>)
  const headerRegex = /<header>[\s\S]*?<\/header>/;
  if (headerRegex.test(content)) {
    content = content.replace(headerRegex, newHeader);

    // Remove embedded toggleMenu function
    const toggleMenuRegex = /\/\/ Mobile menu toggle\s+function toggleMenu\(\) \{[\s\S]*?\}\s+\/\/ Reading progress indicator/;
    if (toggleMenuRegex.test(content)) {
      content = content.replace(toggleMenuRegex, '// Reading progress indicator');
    }

    // Add scripts before </body> if not already present
    if (!content.includes('<script src="/js/i18n.js"></script>')) {
      content = content.replace(
        '<script src="/js/floating-cta.js"></script>',
        '<script src="/js/i18n.js"></script>\n    <script src="/js/floating-cta.js"></script>\n    <script src="/script.js"></script>'
      );
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${file}`);
    updated++;
  } else {
    console.log(`⚠️  Warning: ${file} has no <header> tag`);
    skipped++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updated} articles`);
console.log(`   ⏭️  Skipped: ${skipped} articles`);
console.log(`   📝 Total: ${files.length} articles`);
