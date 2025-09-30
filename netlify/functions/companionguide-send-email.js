exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { name, email, company, subject, message, newsletter } = JSON.parse(event.body);

    // Use Netlify Forms API approach instead
    const emailContent = `
Nieuw contactbericht van CompanionGuide.ai

Naam: ${name}
Email: ${email}
Bedrijf: ${company || 'Niet opgegeven'}
Onderwerp: ${subject}
Newsletter: ${newsletter ? 'Ja' : 'Nee'}

Bericht:
${message}

Dit bericht is verzonden via het contactformulier op companionguide.ai
    `;

    // Send using fetch to a third-party service or use Netlify Forms
    // For now, let's use a simple email service API
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID || 'gmail',
        template_id: process.env.EMAILJS_TEMPLATE_ID || 'contact_form',
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        template_params: {
          from_name: name,
          from_email: email,
          company: company,
          subject: subject,
          message: message,
          newsletter: newsletter ? 'Ja' : 'Nee',
          to_email: 'gcastrading@gmail.com'
        }
      })
    });

    if (response.ok) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST'
        },
        body: JSON.stringify({ 
          success: true, 
          message: 'Email sent successfully' 
        })
      };
    } else {
      throw new Error('Failed to send via EmailJS');
    }

  } catch (error) {
    console.error('Error sending email:', error);
    
    // Fallback: Use Netlify's built-in form handling
    try {
      const formData = new URLSearchParams();
      formData.append('form-name', 'contact');
      formData.append('name', name);
      formData.append('email', email);
      formData.append('company', company || '');
      formData.append('subject', subject);
      formData.append('message', message);
      formData.append('newsletter', newsletter ? 'yes' : 'no');

      const netlifyResponse = await fetch('https://companionguide.ai/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      if (netlifyResponse.ok) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify({ 
            success: true, 
            message: 'Email sent via Netlify Forms' 
          })
        };
      }
    } catch (fallbackError) {
      console.error('Fallback error:', fallbackError);
    }
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: false, 
        error: 'Failed to send email' 
      })
    };
  }
};