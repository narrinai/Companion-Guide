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

    console.log('Received data:', {
      name: data.name,
      slug: data.slug,
      hasDescription: !!data.description,
      hasPricingPlans: !!data.pricing_plans
    });

    // Validate required fields
    if (!data.name || !data.slug || !data.description || !data.short_description || !data.website_url) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required fields: name, slug, description, short_description, website_url'
        })
      };
    }

    // Configure Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_TOKEN_CG
    }).base(process.env.AIRTABLE_BASE_ID_CG);

    const table = base(process.env.AIRTABLE_TABLE_ID_CG);

    // Prepare record data - only include fields that exist in Airtable
    const recordData = {
      name: data.name,
      slug: data.slug,
      rating: data.rating || 4.5,
      description: data.description,
      short_description: data.short_description,
      website_url: data.website_url,
      affiliate_url: data.affiliate_url || data.website_url,
      image_url: data.image_url,
      featured: data.featured || false,
      status: 'Active',
      is_free: data.is_free !== undefined ? data.is_free : true
    };

    // Add optional fields only if they have content
    if (data.pricing_plans && data.pricing_plans.trim()) {
      recordData.pricing_plans = data.pricing_plans;
    }
    if (data.pros && data.pros.trim()) {
      recordData.pros = data.pros;
    }
    if (data.cons && data.cons.trim()) {
      recordData.cons = data.cons;
    }

    console.log('Creating record with fields:', Object.keys(recordData));

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
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error
    });

    // Return more detailed error info
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Failed to create companion',
        details: error.error || error.statusCode || 'Unknown error'
      })
    };
  }
};
