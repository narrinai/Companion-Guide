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

    // First, find the companion by slug
    const companionRecords = await base(process.env.AIRTABLE_TABLE_ID_CG)
      .select({
        filterByFormula: `{slug} = "${slug}"`,
        maxRecords: 1
      })
      .all();

    if (companionRecords.length === 0) {
      return {
        statusCode: 404,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ error: 'Companion not found' })
      };
    }

    const companionRecordId = companionRecords[0].id;

    // Get translation for this companion in the specified language
    const translationRecords = await base(process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG)
      .select({
        filterByFormula: `AND({language} = "${lang}", FIND("${companionRecordId}", ARRAYJOIN({companion})))`,
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

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      },
      body: JSON.stringify({
        my_verdict: fields.my_verdict || '',
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
