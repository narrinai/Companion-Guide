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

    // Prepare record data - USE CORRECT AIRTABLE FIELD NAMES
    const recordData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      tagline: data.short_description, // Airtable field is 'tagline' not 'short_description'
      website_url: data.website_url,
      logo_url: data.image_url, // Airtable field is 'logo_url' not 'image_url'
      status: 'Active'
    };

    // Add optional fields
    if (data.rating) {
      recordData.rating = parseFloat(data.rating);
    }

    if (data.featured !== undefined) {
      recordData.is_featured = data.featured; // Airtable field is 'is_featured' not 'featured'
    }

    // Add text fields only if they have content
    if (data.pricing_plans && typeof data.pricing_plans === 'string' && data.pricing_plans.trim()) {
      recordData.pricing_plans = data.pricing_plans;
    }
    if (data.pros && typeof data.pros === 'string' && data.pros.trim()) {
      recordData.pros = data.pros;
    }
    if (data.cons && typeof data.cons === 'string' && data.cons.trim()) {
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
