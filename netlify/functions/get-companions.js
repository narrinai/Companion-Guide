const Airtable = require('airtable');

exports.handler = async (event, context) => {
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

    console.log('Initializing Airtable connection...');
    const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
      .base(process.env.AIRTABLE_BASE_ID_CG);

    const { filter, category, sort, limit, order } = event.queryStringParameters || {};
    console.log('Query parameters:', { filter, category, sort, limit, order });

    let filterByFormula = '{status} = "Active"';

    if (category) {
      // Simple category filtering - let client side handle filtering for now
      console.log('Category filtering requested for:', category);
      // Remove category from server-side filtering temporarily to debug
      // filterByFormula += ` AND FIND("${category}", {categories}) > 0`;
    }

    const selectOptions = {
      filterByFormula,
      sort: [
        { field: sort || 'rating', direction: 'desc' }
      ]
    };

    console.log('Filter formula:', filterByFormula);
    console.log('Select options:', selectOptions);

    if (limit) {
      selectOptions.maxRecords = parseInt(limit);
    }

    const records = await base(process.env.AIRTABLE_TABLE_ID_CG)
      .select(selectOptions)
      .all();

    const companions = records.map(record => {
      const fields = record.fields;
      let pricingPlans = [];

      try {
        pricingPlans = fields.pricing_plans ? JSON.parse(fields.pricing_plans) : [];
      } catch (e) {
        console.error('Error parsing pricing plans for', fields.name, ':', e);
        pricingPlans = [];
      }

      // Handle categories - can be array (multiselect) or string (semicolon separated)
      let categories = [];
      if (fields.categories) {
        if (Array.isArray(fields.categories)) {
          categories = fields.categories;
        } else if (typeof fields.categories === 'string') {
          categories = fields.categories.split(';').filter(cat => cat.trim());
        }
      }

      // Handle badges - can be array (multiselect) or string (semicolon separated)
      let badges = [];
      if (fields.badges) {
        if (Array.isArray(fields.badges)) {
          badges = fields.badges;
        } else if (typeof fields.badges === 'string') {
          badges = fields.badges.split(';').filter(badge => badge.trim());
        }
      }

      // Handle features - can be JSON string or array
      let features = [];
      if (fields.features) {
        if (typeof fields.features === 'string') {
          try {
            features = JSON.parse(fields.features);
          } catch (e) {
            console.error('Error parsing features for', fields.name, ':', e);
            features = [];
          }
        } else if (Array.isArray(fields.features)) {
          features = fields.features;
        }
      }

      return {
        id: record.id,
        name: fields.name || 'Unknown',
        slug: fields.slug || 'unknown',
        rating: fields.rating || 0,
        description: fields.description || '',
        short_description: fields.short_description || '',
        website_url: fields.website_url || '',
        affiliate_url: fields.affiliate_url || fields.website_url || '',
        logo_url: fields.logo_url || fields.image_url || '/images/logos/default.png',
        image_url: fields.image_url || fields.logo_url || '/images/logos/default.png',
        categories: categories,
        badges: badges,
        features: features,
        pricing_plans: pricingPlans,
        featured: !!fields.is_featured, // Convert checkbox to boolean
        status: fields.status || 'active',
        review_count: parseInt(fields.review_count) || 0
      };
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      },
      body: JSON.stringify({
        companions,
        total: companions.length
      })
    };

  } catch (error) {
    console.error('Error fetching companions:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Failed to fetch companions',
        message: error.message
      })
    };
  }
};