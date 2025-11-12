const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, '..', 'news');

const toggleMenuScript = `
    <script>
        // Mobile menu toggle
        function toggleMenu() {
            const navMenu = document.querySelector('.nav-menu');
            const overlay = document.querySelector('.nav-menu-overlay');
            navMenu.classList.toggle('active');
            overlay.classList.toggle('active');
        }
    </script>`;

// Get all HTML files in news directory
const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.html'));

console.log(`📝 Found ${files.length} articles\n`);

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(newsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if toggleMenu function already exists
  if (content.includes('function toggleMenu')) {
    console.log(`⏭️  Skipped: ${file} (already has toggleMenu)`);
    skipped++;
    return;
  }

  // Find the closing </body> tag and add script before it
  if (content.includes('</body>')) {
    content = content.replace('</body>', `${toggleMenuScript}\n</body>`);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${file}`);
    updated++;
  } else {
    console.log(`⚠️  Warning: ${file} has no </body> tag`);
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updated} articles`);
console.log(`   ⏭️  Skipped: ${skipped} articles`);
console.log(`   📝 Total: ${files.length} articles`);
