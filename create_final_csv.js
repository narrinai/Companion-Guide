const fs = require('fs');

const companions = JSON.parse(fs.readFileSync('./airtable_import.json', 'utf8'));

const csvHeader = 'name,slug,rating,website_url,image_url,categories,badges,featured,pricing_plans,status';

const csvRows = companions.map(comp => {
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
    `"${comp.status}"`
  ].join(',');
});

const csvContent = [csvHeader, ...csvRows].join('\n');
fs.writeFileSync('./airtable_import_final.csv', csvContent);
console.log(`Final CSV created with ${companions.length} companions and 10 core fields`);