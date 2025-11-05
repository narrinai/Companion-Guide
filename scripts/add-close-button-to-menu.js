const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, '..', 'news');

const closeButton = `                <button class="menu-close" onclick="toggleMenu()" aria-label="Close menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
`;

// Get all HTML files in news directory
const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.html'));

console.log(`📝 Found ${files.length} articles\n`);

let updated = 0;
let skipped = 0;

files.forEach(file => {
  const filePath = path.join(newsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if close button already exists
  if (content.includes('menu-close')) {
    console.log(`⏭️  Skipped: ${file} (already has close button)`);
    skipped++;
    return;
  }

  // Add close button right after <ul class="nav-menu">
  if (content.includes('<ul class="nav-menu">')) {
    content = content.replace(
      '<ul class="nav-menu">',
      `<ul class="nav-menu">\n${closeButton}`
    );
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${file}`);
    updated++;
  } else {
    console.log(`⚠️  Warning: ${file} has no <ul class="nav-menu">`);
    skipped++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updated} articles`);
console.log(`   ⏭️  Skipped: ${skipped} articles`);
console.log(`   📝 Total: ${files.length} articles`);
