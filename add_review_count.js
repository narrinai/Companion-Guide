const fs = require('fs');

const companions = JSON.parse(fs.readFileSync('./airtable_import.json', 'utf8'));

// Add review_count field (set to 0 as default since no counts are shown in rating displays)
const companionsWithReviewCount = companions.map(comp => ({
  ...comp,
  review_count: 0  // Default to 0 since no review counts are shown on the site
}));

// Create CSV with review_count field
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

console.log(`Final CSV updated with review_count field - ${companionsWithReviewCount.length} companions`);
console.log(`Added review_count field (default: 0) - you can update these values in Airtable later`);