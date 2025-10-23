const Airtable = require('airtable');

exports.handler = async (event, context) => {
  try {
    if (!process.env.AIRTABLE_TOKEN_CG) {
      throw new Error('AIRTABLE_TOKEN_CG environment variable is not set');
    }
    if (!process.env.AIRTABLE_BASE_ID_CG) {
      throw new Error('AIRTABLE_BASE_ID_CG environment variable is not set');
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

    // Get translations for this companion
    let filterFormula = `{companion_slug} = "${slug}"`;

    if (lang) {
      filterFormula += ` AND {language} = "${lang}"`;
    }

    const records = await base(process.env.AIRTABLE_TRANSLATIONS_TABLE_ID_CG)
      .select({
        filterByFormula: filterFormula,
        maxRecords: 10
      })
      .all();

    const translations = records.map(record => {
      const fields = record.fields;
      return {
        id: record.id,
        companion_slug: fields.companion_slug || '',
        language: fields.language || 'en',
        field_name: fields.field_name || '',
        translated_content: fields.translated_content || '',
        status: fields.status || 'active'
      };
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      },
      body: JSON.stringify({ translations })
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
