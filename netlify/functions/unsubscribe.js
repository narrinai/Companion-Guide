/**
 * Netlify Function to handle newsletter unsubscribe
 * Endpoint: /.netlify/functions/unsubscribe
 */

const Airtable = require('airtable');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { email } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email address is required' })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // Initialize Airtable
    const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
      .base(process.env.AIRTABLE_BASE_ID_CG);

    console.log(`Processing unsubscribe request for: ${email}`);

    // Find the subscriber record by email
    const records = await base('Email_Subscribers').select({
      filterByFormula: `{email} = "${email}"`,
      maxRecords: 1
    }).all();

    if (records.length === 0) {
      // Email not found - still return success (don't reveal if email exists)
      console.log(`Email not found in subscribers: ${email}`);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: 'Unsubscribed successfully'
        })
      };
    }

    // Update the subscriber status to 'unsubscribed'
    const record = records[0];
    await base('Email_Subscribers').update(record.id, {
      status: 'unsubscribed',
      unsubscribed_at: new Date().toISOString()
    });

    console.log(`✅ Successfully unsubscribed: ${email}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Unsubscribed successfully'
      })
    };

  } catch (error) {
    console.error('Error processing unsubscribe:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to process unsubscribe request',
        details: error.message
      })
    };
  }
};
