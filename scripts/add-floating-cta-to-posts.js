const fs = require('fs');
const path = require('path');

const blogPosts = [
  'replika-ai-comprehensive-review-2025.html',
  'character-ai-complete-guide-2025.html',
  'ai-sex-chat-comprehensive-guide-2025.html',
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

  // Check if floating-cta.css is already included
  if (content.includes('floating-cta.css')) {
    console.log(`✅ Already has floating CTA: ${filename}`);
    return;
  }

  // Add CSS link after article-styles.css or style.css
  const cssLinkRegex = /<link rel="stylesheet" href="(\/article-styles\.css|\/style\.css)">/;
  if (cssLinkRegex.test(content)) {
    content = content.replace(
      cssLinkRegex,
      (match) => `${match}\n    <link rel="stylesheet" href="/css/floating-cta.css">`
    );
  } else {
    console.log(`⚠️  Could not find style.css link in: ${filename}`);
  }

  // Add JS script before closing </body> tag
  const bodyCloseRegex = /<\/body>/;
  if (bodyCloseRegex.test(content)) {
    content = content.replace(
      bodyCloseRegex,
      '    <script src="/js/floating-cta.js"></script>\n</body>'
    );
  } else {
    console.log(`⚠️  Could not find </body> tag in: ${filename}`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ Updated: ${filename}`);
});

console.log('\n✨ Floating CTA added to all blog posts!');
