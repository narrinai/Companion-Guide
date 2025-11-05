const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, '..', 'news');

// Code to add before the catch block
const footerRenderingCode = `
                // Load featured companions in footer
                await window.companionManager.renderFooterFeaturedCompanions('featured-companions-footer');
`;

// Get all HTML files in news directory
const files = fs.readdirSync(newsDir).filter(f => f.endsWith('.html'));

console.log(`📝 Found ${files.length} articles\n`);

let updated = 0;
let skipped = 0;
let alreadyHas = 0;

files.forEach(file => {
  const filePath = path.join(newsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Check if already has the footer rendering code
  if (content.includes('renderFooterFeaturedCompanions')) {
    console.log(`✓ Already has footer rendering: ${file}`);
    alreadyHas++;
    return;
  }

  // Find the pattern: closing brace followed by catch block for companion data loading
  // We want to insert before "            } catch (error) {"
  const catchPattern = /(\n\s+)\} catch \(error\) \{\s+console\.error\('Error loading companion data:'/;

  if (catchPattern.test(content)) {
    // Insert the footer rendering code before the catch block
    content = content.replace(
      catchPattern,
      `${footerRenderingCode}$1} catch (error) {\n                console.error('Error loading companion data:'`
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${file}`);
    updated++;
  } else {
    console.log(`⚠️  Warning: ${file} - couldn't find insertion point`);
    skipped++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Updated: ${updated} articles`);
console.log(`   ✓ Already had code: ${alreadyHas} articles`);
console.log(`   ⏭️  Skipped: ${skipped} articles`);
console.log(`   📝 Total: ${files.length} articles`);
