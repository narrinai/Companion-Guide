const fs = require('fs');

const companions = JSON.parse(fs.readFileSync('./airtable_import.json', 'utf8'));

// Review counts mapping - update this with the actual review counts from screenshots
const reviewCounts = {
  'secrets-ai': 62,
  // Add more review counts as you get them from screenshots
  // 'companion-slug': count,
};

// Update companions with review counts
const companionsWithReviewCount = companions.map(comp => ({
  ...comp,
  review_count: reviewCounts[comp.slug] || 0  // Use mapped count or default to 0
}));

// Create CSV with updated review counts
const csvHeader = 'name,slug,rating,website_url,logo_url,categories,badges,featured,pricing_plans,status,review_count';

const csvRows = companionsWithReviewCount.map(comp => {
  const escapedPricing = JSON.stringify(comp.pricing_plans).replace(/"/g, '""');
  return [
    `"${comp.name}"`,
    `"${comp.slug}"`,
    comp.rating,
    `"${comp.website_url}"`,
    `"${comp.image_url}"`,
    `"${comp.categories.join(';')}"`,
    `"${comp.badges.join(';')}"`,
    comp.featured,
    `"${escapedPricing}"`,
    `"${comp.status}"`,
    comp.review_count
  ].join(',');
});

const csvContent = [csvHeader, ...csvRows].join('\n');
fs.writeFileSync('./airtable_import_final.csv', csvContent);

console.log(`CSV updated with review counts:`);
Object.entries(reviewCounts).forEach(([slug, count]) => {
  console.log(`- ${slug}: ${count} reviews`);
});
console.log(`Total companions: ${companionsWithReviewCount.length}`);