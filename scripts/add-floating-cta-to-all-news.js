const fs = require('fs');
const path = require('path');

const newsDir = path.join(__dirname, '..', 'news');

// Get all HTML files in news directory
const allFiles = fs.readdirSync(newsDir).filter(file => file.endsWith('.html'));

let addedCount = 0;
let skippedCount = 0;
let errorCount = 0;

allFiles.forEach(filename => {
  const filePath = path.join(newsDir, filename);

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check if floating-cta.css is already included
    if (content.includes('floating-cta.css')) {
      console.log(`⏭️  Already has floating CTA: ${filename}`);
      skippedCount++;
      return;
    }

    let modified = false;

    // Add CSS link after article-styles.css or style.css
    const cssLinkRegex = /<link rel="stylesheet" href="(\/article-styles\.css|\/style\.css)">/;
    if (cssLinkRegex.test(content)) {
      content = content.replace(
        cssLinkRegex,
        (match) => `${match}\n    <link rel="stylesheet" href="/css/floating-cta.css">`
      );
      modified = true;
    } else {
      // Try to find any stylesheet link as fallback
      const anyStyleRegex = /<link rel="stylesheet" href="[^"]*\.css">/;
      if (anyStyleRegex.test(content)) {
        content = content.replace(
          anyStyleRegex,
          (match) => `${match}\n    <link rel="stylesheet" href="/css/floating-cta.css">`
        );
        modified = true;
      }
    }

    // Add JS script before closing </body> tag
    const bodyCloseRegex = /<\/body>/;
    if (bodyCloseRegex.test(content)) {
      content = content.replace(
        bodyCloseRegex,
        '    <script src="/js/floating-cta.js"></script>\n</body>'
      );
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Added floating CTA: ${filename}`);
      addedCount++;
    } else {
      console.log(`⚠️  Could not add floating CTA (no suitable insertion point): ${filename}`);
      errorCount++;
    }
  } catch (error) {
    console.log(`❌ Error processing ${filename}: ${error.message}`);
    errorCount++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`📊 Summary:`);
console.log(`   ✅ Added: ${addedCount} articles`);
console.log(`   ⏭️  Skipped (already had): ${skippedCount} articles`);
console.log(`   ❌ Errors: ${errorCount} articles`);
console.log(`   📄 Total processed: ${allFiles.length} articles`);
console.log('='.repeat(60));
console.log('\n✨ Floating CTA deployment complete!');
