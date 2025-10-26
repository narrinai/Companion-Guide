const Airtable = require('airtable');

exports.handler = async (event, context) => {
  try {
    if (!process.env.AIRTABLE_TOKEN_CG) {
      throw new Error('AIRTABLE_TOKEN_CG environment variable is not set');
    }
    if (!process.env.AIRTABLE_BASE_ID_CG) {
      throw new Error('AIRTABLE_BASE_ID_CG environment variable is not set');
    }
    if (!process.env.AIRTABLE_TABLE_ID_CG) {
      throw new Error('AIRTABLE_TABLE_ID_CG environment variable is not set');
    }
    if (!process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG) {
      throw new Error('AIRTABLE_TRANSLATIONS_TABLE_ID_CG environment variable is not set');
    }

    const base = new Airtable({apiKey: process.env.AIRTABLE_TOKEN_CG})
      .base(process.env.AIRTABLE_BASE_ID_CG);

    const { slug, lang } = event.queryStringParameters || {};

    if (!slug) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'slug parameter is required' })
      };
    }

    if (!lang) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'lang parameter is required' })
      };
    }

    // Query translation directly by slug (from lookup field) and language
    const translationRecords = await base(process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG)
      .select({
        filterByFormula: `AND({language} = "${lang}", FIND("${slug}", ARRAYJOIN({slug (from companion)})))`,
        maxRecords: 1
      })
      .all();

    if (translationRecords.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Translation not found' })
      };
    }

    const fields = translationRecords[0].fields;

    // Parse JSON fields if they're strings
    let features = fields.features;
    if (typeof features === 'string') {
      try {
        features = JSON.parse(features);
      } catch (e) {
        console.error('Error parsing features:', e);
        features = null;
      }
    }

    let pricing_plans = fields.pricing_plans;
    if (typeof pricing_plans === 'string') {
      try {
        pricing_plans = JSON.parse(pricing_plans);
      } catch (e) {
        console.error('Error parsing pricing_plans:', e);
        pricing_plans = null;
      }
    }

    let hero_specs = fields.hero_specs;
    if (typeof hero_specs === 'string') {
      try {
        hero_specs = JSON.parse(hero_specs);
      } catch (e) {
        console.error('Error parsing hero_specs:', e);
        hero_specs = null;
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      },
      body: JSON.stringify({
        my_verdict: fields.my_verdict || '',
        tagline: fields.tagline || '',
        body_description: fields.body_text || fields.description || '',
        description: fields.description || '',
        features: features,
        pricing_plans: pricing_plans,
        hero_specs: hero_specs,
        language: fields.language || lang
      })
    };

  } catch (error) {
    console.error('Error fetching translations:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        error: error.message,
        translations: []
      })
    };
  }
};
