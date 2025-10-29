const fs = require('fs');
const path = require('path');

const blogPosts = [
  'hammer-ai-complete-review-2025.html',
  'dreamgf-ai-complete-review-2025.html',
  'fantasygf-ai-complete-guide-2025.html',
  'soulgen-ai-adult-image-generation-guide-2025.html'
];

const newsDir = path.join(__dirname, '..', 'news');

blogPosts.forEach(filename => {
  const filePath = path.join(newsDir, filename);

  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filename}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if blog-post-manager.js is already included
  if (content.includes('blog-post-manager.js')) {
    console.log(`✅ Already updated: ${filename}`);
    return;
  }

  // Find the companions.js script tag and add blog-post-manager.js after it
  const companionsScriptRegex = /<script src="(\.\.\/|\/)js\/companions\.js"><\/script>/;

  if (companionsScriptRegex.test(content)) {
    content = content.replace(
      companionsScriptRegex,
      '<script src="$1js/companions.js"></script>\n    <script src="$1js/blog-post-manager.js"></script>'
    );

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${filename}`);
  } else {
    console.log(`⚠️  Could not find companions.js script tag in: ${filename}`);
  }
});

console.log('\n✨ Done!');
