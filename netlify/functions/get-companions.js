const Airtable = require('airtable');

exports.handler = async (event, context) => {
  try {
    const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
      .base(process.env.AIRTABLE_BASE_ID_CG);

    const { filter, category, sort, limit } = event.queryStringParameters || {};

    let filterByFormula = '{status} = "Active"';

    if (category) {
      filterByFormula += ` AND FIND("${category}", {categories}) > 0`;
    }

    const selectOptions = {
      filterByFormula,
      sort: [
        { field: sort || 'rating', direction: 'desc' }
      ]
    };

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
        console.error('Error parsing pricing plans:', e);
      }

      return {
        id: record.id,
        name: fields.name,
        slug: fields.slug,
        rating: fields.rating,
        description: fields.description,
        short_description: fields.short_description,
        website_url: fields.website_url,
        affiliate_url: fields.affiliate_url,
        image_url: fields.image_url,
        categories: fields.categories ? fields.categories.split(',') : [],
        badges: fields.badges ? fields.badges.split(',') : [],
        pricing_plans: pricingPlans,
        featured: fields.featured || false,
        status: fields.status
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