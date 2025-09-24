const fs = require('fs');

const companions = JSON.parse(fs.readFileSync('./airtable_import.json', 'utf8'));

const csvHeader = 'name,slug,rating,website_url,logo_url,categories,badges,featured,pricing_plans,status';

const csvRows = companions.map(comp => {
  const escapedPricing = JSON.stringify(comp.pricing_plans).replace(/"/g, '""');
  return [
    `"${comp.name}"`,
    `"${comp.slug}"`,
    comp.rating,
    `"${comp.website_url}"`,
    `"${comp.image_url}"`, // This will be the logo_url column
    `"${comp.categories.join(';')}"`,
    `"${comp.badges.join(';')}"`,
    comp.featured,
    `"${escapedPricing}"`,
    `"${comp.status}"`
  ].join(',');
});

const csvContent = [csvHeader, ...csvRows].join('\n');
fs.writeFileSync('./airtable_import_final.csv', csvContent);
console.log(`Final CSV updated with logo_url field - ${companions.length} companions`);