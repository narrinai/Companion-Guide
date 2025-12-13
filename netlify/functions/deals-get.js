/**
 * Netlify Function: deals-get
 * Fetches active deals from Airtable with translations from Companion_Translations table
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

  // Get language from query parameter, default to 'en'
  const params = event.queryStringParameters || {};
  const lang = params.lang || 'en';
  const supportedLangs = ['en', 'es', 'nl', 'de', 'pt'];
  const validLang = supportedLangs.includes(lang) ? lang : 'en';

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
    const translationsTable = base('Companion_Translations');

    // Fetch active deals - filter by deal_active and exclude hidden
    const records = await table.select({
      filterByFormula: 'AND({deal_active} = TRUE(), {status} != "Hidden")',
      sort: [{ field: 'rating', direction: 'desc' }]
    }).all();

    // For non-English, fetch translations from Companion_Translations
    let translationsMap = {};
    if (validLang !== 'en') {
      const translationRecords = await translationsTable.select({
        filterByFormula: `{language} = '${validLang}'`
      }).all();

      // Create a map by slug for quick lookup
      translationRecords.forEach(tr => {
        const slug = tr.fields['slug (from companion)'];
        if (slug && slug[0]) {
          translationsMap[slug[0]] = tr.fields;
        }
      });
    }

    // Map records to deal objects
    const deals = records.map(record => {
      const slug = record.fields.slug || '';
      const translation = translationsMap[slug] || {};

      // For non-English, use translated description as deal_description fallback
      const dealDescription = validLang === 'en'
        ? (record.fields.deal_description || '')
        : (translation.description || record.fields.deal_description || '');

      return {
        id: record.id,
        name: record.fields.name || '',
        slug: slug,
        logo_url: record.fields.logo_url || '/images/logos/default.png',
        rating: record.fields.rating || 0,
        review_count: record.fields.review_count || 0,
        website_url: record.fields.website_url || '#',
        website_url_2: record.fields.website_url_2 || '',
        // For non-English, use translated description as deal_description
        deal_description: dealDescription,
        deal_badge: record.fields.deal_badge || 'SPECIAL OFFER',
        // These fields have translations in Companion_Translations
        short_description: translation.description || record.fields.description || '',
        tagline: translation.tagline || record.fields.tagline || '',
        best_for: translation.best_for || record.fields.best_for || ''
      };
    });

    console.log(`✅ Loaded ${deals.length} deals from Airtable (lang: ${validLang})`);

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
