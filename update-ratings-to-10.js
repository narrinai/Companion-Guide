const fs = require('fs').promises;
const path = require('path');

async function updateRatingsInFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf-8');
    let modified = false;

    // Pattern 1: Update "bestRating": "5" to "bestRating": "10"
    if (content.includes('"bestRating": "5"')) {
      content = content.replace(/"bestRating":\s*"5"/g, '"bestRating": "10"');
      modified = true;
      console.log(`✓ Updated bestRating in ${path.basename(filePath)}`);
    }

    // Pattern 2: Update ratingValue (double the value)
    // Example: "ratingValue": "4.8" → "ratingValue": "9.6"
    const ratingValueRegex = /"ratingValue":\s*"(\d+\.?\d*)"/g;
    content = content.replace(ratingValueRegex, (match, rating) => {
      const oldRating = parseFloat(rating);
      const newRating = (oldRating * 2).toFixed(1);
      modified = true;
      console.log(`  → Rating ${oldRating}/5 → ${newRating}/10`);
      return `"ratingValue": "${newRating}"`;
    });

    // Pattern 3: Update static rating displays like "4.8/5" or "★★★★★ 4.8/5"
    const staticRatingRegex = /(★+\s*)?(\d+\.?\d*)\/5/g;
    content = content.replace(staticRatingRegex, (match, stars, rating) => {
      const oldRating = parseFloat(rating);
      const newRating = (oldRating * 2).toFixed(1);
      modified = true;
      return `${stars || ''}${newRating}/10`;
    });

    // Pattern 4: Update meta descriptions with ratings
    const metaRatingRegex = /(rating[s]?:\s*)(\d+\.?\d*)\s*\/\s*5/gi;
    content = content.replace(metaRatingRegex, (match, prefix, rating) => {
      const oldRating = parseFloat(rating);
      const newRating = (oldRating * 2).toFixed(1);
      modified = true;
      return `${prefix}${newRating}/10`;
    });

    if (modified) {
      await fs.writeFile(filePath, content, 'utf-8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

async function updateAllPages() {
  try {
    // Update companion pages
    const companionsDir = path.join(__dirname, 'companions');
    const files = await fs.readdir(companionsDir);
    const htmlFiles = files.filter(f => f.endsWith('.html'));

    console.log(`\n🔄 Updating ${htmlFiles.length} companion pages...\n`);

    let updatedCount = 0;
    for (const file of htmlFiles) {
      const filePath = path.join(companionsDir, file);
      const updated = await updateRatingsInFile(filePath);
      if (updated) updatedCount++;
    }

    console.log(`\n✅ Updated ${updatedCount} companion pages`);

    // Update main pages
    console.log(`\n🔄 Updating main pages...\n`);
    const mainPages = ['index.html', 'deals.html', 'companions.html'];
    let mainPagesCount = 0;

    for (const file of mainPages) {
      const filePath = path.join(__dirname, file);
      const updated = await updateRatingsInFile(filePath);
      if (updated) mainPagesCount++;
    }

    console.log(`\n✅ Updated ${mainPagesCount} main pages`);
    console.log(`\n⚠️  Note: You still need to manually update ratings in Airtable (multiply by 2)`);
    console.log(`\n🎯 Total updated: ${updatedCount + mainPagesCount} files`);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the update
updateAllPages();
