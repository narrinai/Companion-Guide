const Airtable = require('airtable');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const data = JSON.parse(event.body);

    // Configure Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_TOKEN_CG
    }).base(process.env.AIRTABLE_BASE_ID_CG);

    const table = base(process.env.AIRTABLE_TABLE_ID_CG);

    // Prepare record data
    const recordData = {
      name: data.name,
      slug: data.slug,
      rating: data.rating,
      description: data.description,
      short_description: data.short_description,
      website_url: data.website_url,
      affiliate_url: data.affiliate_url || data.website_url,
      image_url: data.image_url,
      featured: data.featured || false,
      status: 'Active',
      is_free: data.is_free !== undefined ? data.is_free : true,
      created_date: new Date().toISOString(),
      updated_date: new Date().toISOString()
    };

    // Add optional fields if provided
    if (data.pricing_plans) {
      recordData.pricing_plans = data.pricing_plans;
    }
    if (data.pros) {
      recordData.pros = data.pros;
    }
    if (data.cons) {
      recordData.cons = data.cons;
    }

    // Create record in Airtable
    const record = await table.create(recordData);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        id: record.id,
        name: data.name
      })
    };

  } catch (error) {
    console.error('Error creating companion:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Failed to create companion'
      })
    };
  }
};
