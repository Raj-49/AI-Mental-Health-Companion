const nodemailer = require('nodemailer');

// Create reusable transporter using SMTP configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('Email service configuration error:', error);
  } else {
    console.log('Email service is ready to send messages');
  }
});

/**
 * Send password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @param {string} userName - User's name for personalization
 */
const sendPasswordResetEmail = async (to, resetToken, userName) => {
  try {
    // Determine frontend URL based on environment
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? process.env.PRODUCTION_FRONTEND_URL 
      : process.env.LOCAL_FRONTEND_URL || 'http://localhost:3000';

    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
      from: `"AI Mental Health Companion" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Password Reset Request - AI Mental Health Companion',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 14px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              margin-top: 20px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 12px;
              color: #666;
              text-align: center;
            }
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 10px 15px;
              margin: 15px 0;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🧠 AI Mental Health Companion</h1>
            <p>Password Reset Request</p>
          </div>
          <div class="content">
            <p>Hello ${userName || 'there'},</p>
            
            <p>We received a request to reset the password for your AI Mental Health Companion account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <center>
              <a href="${resetUrl}" class="button">Reset Password</a>
            </center>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
            
            <div class="warning">
              <strong>⚠️ Important:</strong>
              <ul style="margin: 5px 0;">
                <li>This link will expire in <strong>1 hour</strong></li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password won't change until you create a new one</li>
              </ul>
            </div>
            
            <p>If you're having trouble clicking the button, contact our support team.</p>
            
            <p>Best regards,<br>
            <strong>AI Mental Health Companion Team</strong></p>
          </div>
          <div class="footer">
            <p>This is an automated email. Please do not reply to this message.</p>
            <p>&copy; 2024 AI Mental Health Companion. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${userName || 'there'},

        We received a request to reset the password for your AI Mental Health Companion account.

        Click the link below to reset your password:
        ${resetUrl}

        ⚠️ Important:
        - This link will expire in 1 hour
        - If you didn't request this reset, please ignore this email
        - Your password won't change until you create a new one

        Best regards,
        AI Mental Health Companion Team
        
        ---
        This is an automated email. Please do not reply to this message.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

/**
 * Send welcome email to new users
 * @param {string} to - Recipient email address
 * @param {string} userName - User's name
 */
const sendWelcomeEmail = async (to, userName) => {
  try {
    const frontendUrl = process.env.NODE_ENV === 'production' 
      ? process.env.PRODUCTION_FRONTEND_URL 
      : process.env.LOCAL_FRONTEND_URL || 'http://localhost:3000';

    const mailOptions = {
      from: `"AI Mental Health Companion" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Welcome to AI Mental Health Companion! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              padding: 14px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .features {
              background: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .feature-item {
              margin: 10px 0;
              padding-left: 25px;
              position: relative;
            }
            .feature-item:before {
              content: "✓";
              position: absolute;
              left: 0;
              color: #667eea;
              font-weight: bold;
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🧠 Welcome to AI Mental Health Companion!</h1>
          </div>
          <div class="content">
            <p>Hello ${userName || 'there'},</p>
            
            <p>Welcome aboard! We're excited to have you join our community focused on mental wellness and personal growth.</p>
            
            <div class="features">
              <h3>What you can do with AI Mental Health Companion:</h3>
              <div class="feature-item">Track your daily moods and emotions</div>
              <div class="feature-item">Journal your thoughts and feelings</div>
              <div class="feature-item">Get AI-powered insights and support</div>
              <div class="feature-item">Monitor your mental health journey over time</div>
              <div class="feature-item">Access personalized wellness recommendations</div>
            </div>
            
            <center>
              <a href="${frontendUrl}/dashboard" class="button">Go to Dashboard</a>
            </center>
            
            <p>If you have any questions or need support, don't hesitate to reach out.</p>
            
            <p>Here's to your mental wellness journey! 🌟</p>
            
            <p>Best regards,<br>
            <strong>AI Mental Health Companion Team</strong></p>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${userName || 'there'},

        Welcome aboard! We're excited to have you join AI Mental Health Companion.

        What you can do:
        - Track your daily moods and emotions
        - Journal your thoughts and feelings
        - Get AI-powered insights and support
        - Monitor your mental health journey over time
        - Access personalized wellness recommendations

        Visit your dashboard: ${frontendUrl}/dashboard

        Here's to your mental wellness journey!

        Best regards,
        AI Mental Health Companion Team
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email - it's not critical
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
