/**
 * Netlify Function: deals-get
 * Fetches active deals from Airtable Companion_Translations table
 */

const Airtable = require('airtable');

exports.handler = async function(event, context) {
  // Set up CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // Check environment variables
    if (!process.env.AIRTABLE_TOKEN_CG) {
      throw new Error('AIRTABLE_TOKEN_CG environment variable is not set');
    }
    if (!process.env.AIRTABLE_BASE_ID_CG) {
      throw new Error('AIRTABLE_BASE_ID_CG environment variable is not set');
    }
    if (!process.env.AIRTABLE_TABLE_ID_CG) {
      throw new Error('AIRTABLE_TABLE_ID_CG environment variable is not set');
    }

    // Initialize Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_TOKEN_CG
    }).base(process.env.AIRTABLE_BASE_ID_CG);

    // Use the base Companions table (where deal_active field lives)
    const table = base(process.env.AIRTABLE_TABLE_ID_CG);

    // Fetch active deals - filter by deal_active and exclude hidden
    const records = await table.select({
      filterByFormula: 'AND({deal_active} = TRUE(), {status} != "Hidden")',
      sort: [{ field: 'rating', direction: 'desc' }]
    }).all();

    // Map records to deal objects
    const deals = records.map(record => ({
      id: record.id,
      name: record.fields.name || '',
      slug: record.fields.slug || '',
      logo_url: record.fields.logo_url || '/images/logos/default.png',
      rating: record.fields.rating || 0,
      review_count: record.fields.review_count || 0,
      website_url: record.fields.website_url || '#',
      deal_description: record.fields.deal_description || '',
      deal_badge: record.fields.deal_badge || 'SPECIAL OFFER',
      short_description: record.fields.short_description || '',
      tagline: record.fields.tagline || '',
      best_for: record.fields.best_for || ''
    }));

    console.log(`✅ Loaded ${deals.length} deals from Airtable`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ deals })
    };

  } catch (error) {
    console.error('❌ Error fetching deals:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to fetch deals',
        message: error.message
      })
    };
  }
};
