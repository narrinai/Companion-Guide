const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, '..', 'news');

const newToggleMenuFunction = `        function toggleMenu() {
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            const overlay = document.querySelector('.nav-menu-overlay');

            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            overlay.classList.toggle('active');

            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }`;

// Get all HTML files in news directory
const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.html'));

console.log(`📝 Found ${files.length} articles\n`);

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(newsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if toggleMenu function exists
  if (content.includes('function toggleMenu')) {
    // Replace the old function with the new one
    // Match the function from start to closing brace
    const regex = /function toggleMenu\(\) \{[\s\S]*?\n        \}/;

    if (regex.test(content)) {
      content = content.replace(regex, newToggleMenuFunction);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${file}`);
      updated++;
    } else {
      console.log(`⚠️  Could not match pattern in: ${file}`);
      skipped++;
    }
  } else {
    console.log(`⏭️  Skipped: ${file} (no toggleMenu function)`);
    skipped++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updated} articles`);
console.log(`   ⏭️  Skipped: ${skipped} articles`);
console.log(`   📝 Total: ${files.length} articles`);
