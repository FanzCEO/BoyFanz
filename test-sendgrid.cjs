const sgMail = require('@sendgrid/mail');

// Use the SendGrid API key from .env
const SENDGRID_API_KEY = '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';

if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log('✅ SendGrid API key set');
} else {
  console.error('❌ No SendGrid API key');
  process.exit(1);
}

async function testEmail() {
  try {
    const msg = {
      to: 'wyatt@wyattxxxcole.com',
      from: 'wyatt@wyattxxxcole.com',
      subject: '✅ SendGrid Test from BoyFanz Production',
      html: '<h2>Test Email</h2><p>This is a test from the production server to verify SendGrid is working.</p><p>Time: ' + new Date().toLocaleString() + '</p>',
    };

    console.log('📧 Attempting to send test email...');
    const result = await sgMail.send(msg);
    console.log('✅ Email sent successfully!');
    console.log('Response:', result[0].statusCode, result[0].headers);
  } catch (error) {
    console.error('❌ Failed to send email:');
    console.error('Message:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Body:', error.response.body);
    }
  }
}

testEmail();
