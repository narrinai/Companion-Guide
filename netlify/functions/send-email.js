const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { name, email, company, subject, message, newsletter } = JSON.parse(event.body);

    // Create transporter using Gmail SMTP
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: 'gcastrading@gmail.com',
      subject: `Contact Form: ${subject}`,
      html: `
        <h2>Nieuw contactbericht van CompanionGuide.ai</h2>
        <p><strong>Naam:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Bedrijf:</strong> ${company || 'Niet opgegeven'}</p>
        <p><strong>Onderwerp:</strong> ${subject}</p>
        <p><strong>Newsletter:</strong> ${newsletter ? 'Ja' : 'Nee'}</p>
        <h3>Bericht:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><small>Dit bericht is verzonden via het contactformulier op companionguide.ai</small></p>
      `,
      text: `
Nieuw contactbericht van CompanionGuide.ai

Naam: ${name}
Email: ${email}
Bedrijf: ${company || 'Niet opgegeven'}
Onderwerp: ${subject}
Newsletter: ${newsletter ? 'Ja' : 'Nee'}

Bericht:
${message}

Dit bericht is verzonden via het contactformulier op companionguide.ai
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

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

  } catch (error) {
    console.error('Error sending email:', error);
    
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