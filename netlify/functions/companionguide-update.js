const Airtable = require('airtable');

exports.handler = async (event, context) => {
  // Only allow POST/PUT/PATCH requests
  if (!['POST', 'PUT', 'PATCH'].includes(event.httpMethod)) {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { recordId, fields } = JSON.parse(event.body);

    if (!recordId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required field: recordId'
        })
      };
    }

    if (!fields || Object.keys(fields).length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'Missing required field: fields (must contain at least one field to update)'
        })
      };
    }

    console.log('Updating record:', recordId, 'with fields:', JSON.stringify(fields, null, 2));

    // Configure Airtable
    const base = new Airtable({
      apiKey: process.env.AIRTABLE_TOKEN_CG
    }).base(process.env.AIRTABLE_BASE_ID_CG);

    const table = base(process.env.AIRTABLE_TABLE_ID_CG);

    // Update record in Airtable
    const record = await table.update(recordId, fields);

    console.log('Successfully updated record:', record.id);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        id: record.id,
        fields: record.fields
      })
    };

  } catch (error) {
    console.error('Error updating companion:', error);
    console.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      error: error.error
    });

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message || 'Failed to update companion',
        details: error.error || error.statusCode || 'Unknown error'
      })
    };
  }
};
