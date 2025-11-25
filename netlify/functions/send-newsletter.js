/**
 * Netlify Function to send newsletter emails via SendGrid
 * Endpoint: /.netlify/functions/send-newsletter
 */

const sgMail = require('@sendgrid/mail');
const Airtable = require('airtable');
const { generateNewsletterEmail } = require('../../email-templates/newsletter-template');

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
    const { email, sendTest = false } = JSON.parse(event.body);

    if (!email) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email address is required' })
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid email address' })
      };
    }

    // Initialize SendGrid
    const sendGridApiKey = process.env.SENDGRID_API_KEY_CG;
    if (!sendGridApiKey) {
      throw new Error('SendGrid API key not configured');
    }
    sgMail.setApiKey(sendGridApiKey);

    // Initialize Airtable
    const base = new Airtable({ apiKey: process.env.AIRTABLE_TOKEN_CG })
      .base(process.env.AIRTABLE_BASE_ID_CG);

    console.log('Fetching data from Airtable...');

    // Fetch deals from Airtable (companions with deal_description that are not hidden)
    const dealsRecords = await base(process.env.AIRTABLE_TABLE_ID_CG).select({
      filterByFormula: 'AND({deal_description} != "", {status} != "Hidden")',
      maxRecords: 5,
      sort: [{ field: 'rating', direction: 'desc' }]
    }).all();

    const deals = dealsRecords.map(record => ({
      name: record.fields.name,
      slug: record.fields.slug,
      logo_url: record.fields.logo_url,
      rating: record.fields.rating,
      deal_description: record.fields.deal_description,
      deal_badge: record.fields.deal_badge,
      short_description: record.fields.short_description,
      website_url: record.fields.website_url
    }));

    // Fetch Companion of the Month
    const cotmRecords = await base(process.env.AIRTABLE_TABLE_ID_CG).select({
      filterByFormula: '{is_month} = TRUE()',
      maxRecords: 1
    }).all();

    const companionOfTheMonth = cotmRecords.length > 0 ? {
      name: cotmRecords[0].fields.name,
      slug: cotmRecords[0].fields.slug,
      logo_url: cotmRecords[0].fields.logo_url,
      rating: cotmRecords[0].fields.rating,
      short_description: cotmRecords[0].fields.short_description,
      description: cotmRecords[0].fields.description,
      website_url: cotmRecords[0].fields.website_url
    } : null;

    // Fetch featured companions (excluding Simone and Dream Companion)
    const featuredRecords = await base(process.env.AIRTABLE_TABLE_ID_CG).select({
      filterByFormula: 'AND({is_featured} = TRUE(), {status} != "Hidden")',
      maxRecords: 12,
      sort: [{ field: 'rating', direction: 'desc' }]
    }).all();

    const featuredCompanions = featuredRecords
      .map(record => ({
        name: record.fields.name,
        slug: record.fields.slug,
        logo_url: record.fields.logo_url,
        website_url: record.fields.website_url
      }))
      .filter(c => c.slug !== 'simone' && c.slug !== 'dream-companion');

    console.log('Data fetched:', {
      deals: deals.length,
      companionOfTheMonth: !!companionOfTheMonth,
      featuredCompanions: featuredCompanions.length
    });

    // Generate email HTML
    const emailHTML = generateNewsletterEmail({
      deals,
      companionOfTheMonth,
      featuredCompanions,
      recipientEmail: email
    });

    // Send email via SendGrid
    const msg = {
      to: email,
      from: {
        email: 'news@companionguide.ai',
        name: 'CompanionGuide News'
      },
      replyTo: 'hello@companionguide.ai',
      subject: `${companionOfTheMonth ? `🏆 ${companionOfTheMonth.name} - ` : ''}Latest AI Companion Deals & Reviews`,
      html: emailHTML
    };

    await sgMail.send(msg);

    console.log(`✅ Newsletter sent to ${email}`);

    // Store email subscription in Airtable (optional)
    if (!sendTest) {
      try {
        await base('Email_Subscribers').create([
          {
            fields: {
              email: email,
              subscribed_at: new Date().toISOString(),
              status: 'active'
            }
          }
        ], { typecast: true });
      } catch (err) {
        console.warn('Could not store subscriber (table might not exist):', err.message);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Newsletter sent successfully!'
      })
    };

  } catch (error) {
    console.error('Error sending newsletter:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to send newsletter',
        details: error.message
      })
    };
  }
};
