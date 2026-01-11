import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp0001.neo.space',
  port: 587,
  secure: false,
  auth: {
    user: 'wyatt@wyattxxxcole.com',
    pass: 'Bama@11061990'
  }
});

console.log('🔄 Connecting to SMTP server smtp0001.neo.space:587...');

try {
  const info = await transporter.sendMail({
    from: '"BoyFanz Security Test" <support@fanz.website>',
    to: 'wyatt@wyattxxxcole.com',
    subject: '✅ SMTP Test - BoyFanz Email System',
    html: '<h2>SMTP Configuration Test</h2><p>This is a test email from the BoyFanz security alert system.</p><p><strong>SMTP Server:</strong> smtp0001.neo.space:587</p><p>If you received this, the email configuration is working correctly!</p>'
  });

  console.log('✅ Email sent successfully!');
  console.log('📧 Message ID:', info.messageId);
  console.log('📬 Response:', info.response);
  console.log('');
  console.log('✨ Check wyatt@wyattxxxcole.com inbox for the test email!');
} catch (error) {
  console.error('❌ Failed to send email:');
  console.error('Error:', error.message);
  if (error.code) console.error('Code:', error.code);
  if (error.response) console.error('SMTP Response:', error.response);
}
