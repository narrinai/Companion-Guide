#!/usr/bin/env node

/**
 * Limit news articles to first 10 on all index pages
 */

const fs = require('fs');
const path = require('path');

const indexFiles = [
  'index.html',
  'nl/index.html',
  'pt/index.html',
  'de/index.html'
];

indexFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  Skipping ${file} - file not found`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Find the news-grid section
  const newsGridStart = content.indexOf('<div class="news-grid">');
  if (newsGridStart === -1) {
    console.log(`⚠️  No news-grid found in ${file}`);
    return;
  }

  // Find the closing </div> for news-grid
  const newsGridEnd = content.indexOf('</div>', newsGridStart + '<div class="news-grid">'.length);
  if (newsGridEnd === -1) {
    console.log(`⚠️  No closing tag found for news-grid in ${file}`);
    return;
  }

  // Extract the news-grid content
  const newsGridContent = content.substring(newsGridStart, newsGridEnd + 6);

  // Find all article tags
  const articlePattern = /<article class="news-card[^>]*>[\s\S]*?<\/article>/g;
  const articles = newsGridContent.match(articlePattern) || [];

  console.log(`📰 Found ${articles.length} articles in ${file}`);

  if (articles.length <= 10) {
    console.log(`✅ ${file} already has 10 or fewer articles`);
    return;
  }

  // Keep only first 10 articles
  const first10Articles = articles.slice(0, 10);

  // Reconstruct news-grid with only 10 articles
  const newNewsGrid = `<div class="news-grid">
${first10Articles.join('\n\n')}
            </div>`;

  // Replace the old news-grid with the new one
  const before = content.substring(0, newsGridStart);
  const after = content.substring(newsGridEnd + 6);
  const newContent = before + newNewsGrid + after;

  // Write back
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log(`✅ Limited ${file} to 10 articles (removed ${articles.length - 10})`);
});

console.log('\n✨ Done! All index pages now show maximum 10 news articles.');
