const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,  // Use the SMTP server host from .env
  port: parseInt(process.env.EMAIL_PORT, 10), // Use the SMTP server port from .env
  secure: process.env.EMAIL_SECURE === 'true', // Convert EMAIL_SECURE string to boolean
  auth: {
    user: process.env.EMAIL_USER,     // Authentication email address from .env
    pass: process.env.EMAIL_PASSWORD  // Email password from .env
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function sendEmailNotification(emails, uuid, repoUrl) {
  // Convert single email to array if necessary
  if (!Array.isArray(emails)) {
    emails = [emails];
  }

  let subject;
  let html;
  const baseUrl = process.env.BASE_URL || 'http://localhost:3001';

  if (uuid === 'no-text-files') {
    subject = 'Analysis of your repository';
    html = `The repository ${repoUrl} has been analyzed. Since it doesn't contain any text files, we couldn't process it at the moment. Please try again with a different repository.`;
    emails.forEach(email => {
      console.log(`Preparing to send 'no text files' notification email to: ${email}`);
    });
  } else {
    if(!uuid) {
      console.error('The UUID is undefined.', { emails, repoUrl });
      throw new Error('The UUID is undefined.');
    }
    subject = 'Your repo is ready for a chat!';
    html = `The repository <a href="${repoUrl}">${repoUrl}</a> has been analyzed. You can chat with it at <a href="${baseUrl}/explain/${uuid}">${baseUrl}/explain/${uuid}</a>.`;
    emails.forEach(email => {
      console.log(`Preparing to send 'repo ready' notification email to: ${email}`);
    });
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    bcc: emails.join(", "), // Changed 'to' to 'bcc'
    subject: subject,
    html: html
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully. Result: ${JSON.stringify(result)}`);
  } catch (error) {
    console.error(`Failed to send email: ${error.message}`, error.stack);
    throw error;
  }
}

module.exports = {
  sendEmailNotification
};