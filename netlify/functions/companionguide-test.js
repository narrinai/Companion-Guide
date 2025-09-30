const Airtable = require('airtable');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const data = JSON.parse(event.body);

    // Just return what we would send to Airtable
    const recordData = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      tagline: data.short_description,
      website_url: data.website_url,
      logo_url: data.image_url,
      status: 'Active'
    };

    if (data.rating) {
      recordData.rating = parseFloat(data.rating);
    }

    if (data.featured !== undefined) {
      recordData.is_featured = data.featured;
    }

    if (data.pricing_plans && typeof data.pricing_plans === 'string' && data.pricing_plans.trim()) {
      recordData.pricing_plans = data.pricing_plans;
    }
    if (data.pros && typeof data.pros === 'string' && data.pros.trim()) {
      recordData.pros = data.pros;
    }
    if (data.cons && typeof data.cons === 'string' && data.cons.trim()) {
      recordData.cons = data.cons;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'This is what would be sent to Airtable:',
        data: recordData,
        fieldTypes: Object.keys(recordData).reduce((acc, key) => {
          acc[key] = typeof recordData[key];
          return acc;
        }, {})
      })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    };
  }
};
