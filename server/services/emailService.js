const nodemailer = require('nodemailer');
const path = require('path');

/**
 * Email Service for Projectra
 * Handles all email sending functionality using Gmail SMTP
 */

// Create reusable transporter
let transporter = null;

const createTransporter = () => {
  if (transporter) {
    return transporter;
  }

  // Check if SMTP credentials are configured
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn('⚠️  SMTP credentials not configured. Email sending will be disabled.');
    return null;
  }

  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      tls: {
        rejectUnauthorized: false // For development
      }
    });

    console.log('✅ Email service initialized successfully');
    return transporter;
  } catch (error) {
    console.error('❌ Failed to create email transporter:', error);
    return null;
  }
};

/**
 * Generate HTML template for invitation email
 */
const getInvitationEmailTemplate = (invitation, inviteLink, organizationName) => {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're Invited to Join ${organizationName}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 10px 0 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 40px 30px;
    }
    .content h2 {
      color: #667eea;
      font-size: 24px;
      margin-top: 0;
    }
    .content p {
      font-size: 16px;
      margin: 16px 0;
      color: #555;
    }
    .details {
      background: #f8f9fa;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 24px 0;
      border-radius: 4px;
    }
    .details p {
      margin: 8px 0;
      font-size: 15px;
    }
    .details strong {
      color: #333;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 16px 40px;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      margin: 24px 0;
      text-align: center;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      transition: transform 0.2s;
    }
    .cta-button:hover {
      transform: translateY(-2px);
    }
    .alternative-link {
      background: #f0f0f0;
      padding: 15px;
      border-radius: 4px;
      margin: 20px 0;
      font-size: 13px;
      word-break: break-all;
      color: #666;
    }
    .footer {
      background: #f8f9fa;
      padding: 24px 30px;
      text-align: center;
      font-size: 13px;
      color: #888;
      border-top: 1px solid #e0e0e0;
    }
    .footer p {
      margin: 8px 0;
    }
    .logo {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">📊 Projectra</div>
      <h1>You're Invited!</h1>
      <p>Join ${organizationName} on Projectra</p>
    </div>
    
    <div class="content">
      <h2>Welcome to the Team!</h2>
      
      <p>Hi${invitation.metadata?.firstName ? ' ' + invitation.metadata.firstName : ''},</p>
      
      <p>
        You've been invited by <strong>${invitation.invitedBy?.firstName || 'Team Admin'} ${invitation.invitedBy?.lastName || ''}</strong> 
        to join <strong>${organizationName}</strong> on Projectra as a <strong>${invitation.role.replace('_', ' ')}</strong>.
      </p>

      ${invitation.metadata?.message ? `
      <div class="details">
        <p><strong>Personal Message:</strong></p>
        <p style="font-style: italic;">"${invitation.metadata.message}"</p>
      </div>
      ` : ''}

      <div class="details">
        <p><strong>Email:</strong> ${invitation.email}</p>
        <p><strong>Role:</strong> ${invitation.role.replace('_', ' ').toUpperCase()}</p>
        <p><strong>Organization:</strong> ${organizationName}</p>
      </div>

      <p style="text-align: center;">
        <a href="${inviteLink}" class="cta-button">Accept Invitation</a>
      </p>

      <p style="font-size: 14px; color: #666;">
        This invitation will expire in 7 days. Click the button above to create your account and get started.
      </p>

      <p style="font-size: 13px; color: #888; margin-top: 24px;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <div class="alternative-link">
        ${inviteLink}
      </div>
    </div>

    <div class="footer">
      <p><strong>Projectra</strong> - Project Management Made Simple</p>
      <p>If you didn't expect this invitation, you can safely ignore this email.</p>
      <p style="margin-top: 16px; font-size: 12px;">
        © ${new Date().getFullYear()} Projectra. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return html;
};

/**
 * Generate plain text version of invitation email
 */
const getInvitationEmailText = (invitation, inviteLink, organizationName) => {
  return `
Welcome to Projectra!

Hi${invitation.metadata?.firstName ? ' ' + invitation.metadata.firstName : ''},

You've been invited by ${invitation.invitedBy?.firstName || 'Team Admin'} ${invitation.invitedBy?.lastName || ''} to join ${organizationName} on Projectra as a ${invitation.role.replace('_', ' ')}.

${invitation.metadata?.message ? `Personal Message:\n"${invitation.metadata.message}"\n\n` : ''}

INVITATION DETAILS:
- Email: ${invitation.email}
- Role: ${invitation.role.replace('_', ' ').toUpperCase()}
- Organization: ${organizationName}

ACCEPT INVITATION:
${inviteLink}

This invitation will expire in 7 days. Click the link above to create your account and get started.

If you didn't expect this invitation, you can safely ignore this email.

---
Projectra - Project Management Made Simple
© ${new Date().getFullYear()} Projectra. All rights reserved.
  `;
};

/**
 * Send invitation email
 * @param {Object} invitation - Invitation document (must be populated with invitedBy and organization)
 * @param {String} inviteLink - Full invitation URL
 * @returns {Promise} - Resolves with info or rejects with error
 */
const sendInvitationEmail = async (invitation, inviteLink) => {
  const transport = createTransporter();
  
  // If transporter is not available, log and return (dev mode fallback)
  if (!transport) {
    console.log('\n📧 EMAIL (Development Mode - Not Sent)');
    console.log('=====================================');
    console.log(`To: ${invitation.email}`);
    console.log(`Subject: You're invited to join ${invitation.organization?.name || 'an organization'} on Projectra`);
    console.log(`Invite Link: ${inviteLink}`);
    console.log('=====================================\n');
    
    return {
      success: true,
      message: 'Email logged (SMTP not configured)',
      mode: 'development'
    };
  }

  try {
    const organizationName = invitation.organization?.name || 'the organization';
    
    // Prepare email options
    const mailOptions = {
      from: {
        name: 'Projectra',
        address: process.env.SMTP_USER
      },
      to: invitation.email,
      subject: `You're invited to join ${organizationName} on Projectra`,
      text: getInvitationEmailText(invitation, inviteLink, organizationName),
      html: getInvitationEmailTemplate(invitation, inviteLink, organizationName),
      priority: 'high'
    };

    // Send email
    const info = await transport.sendMail(mailOptions);
    
    console.log('✅ Invitation email sent successfully');
    console.log(`   To: ${invitation.email}`);
    console.log(`   Message ID: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully',
      mode: 'production'
    };
  } catch (error) {
    console.error('❌ Failed to send invitation email:', error);
    
    // Log the invite link as fallback
    console.log('\n📧 EMAIL FAILED - Invitation Link (Manual Copy):');
    console.log(`   ${inviteLink}`);
    console.log('=====================================\n');
    
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send welcome email after successful registration
 */
const sendWelcomeEmail = async (user, organizationName) => {
  const transport = createTransporter();
  
  if (!transport) {
    console.log(`📧 Welcome email (dev mode): ${user.email}`);
    return { success: true, mode: 'development' };
  }

  try {
    const mailOptions = {
      from: {
        name: 'Projectra',
        address: process.env.SMTP_USER
      },
      to: user.email,
      subject: `Welcome to ${organizationName} on Projectra!`,
      text: `Welcome ${user.firstName}!\n\nYour account has been created successfully.\n\nYou can now log in to Projectra and start collaborating with your team.\n\nBest regards,\nThe Projectra Team`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #667eea;">Welcome to ${organizationName}!</h1>
          <p>Hi ${user.firstName},</p>
          <p>Your account has been created successfully! 🎉</p>
          <p>You can now log in to Projectra and start collaborating with your team.</p>
          <p style="margin-top: 30px;">
            <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}/login" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Log In Now
            </a>
          </p>
          <p style="color: #888; font-size: 14px; margin-top: 40px;">
            Best regards,<br/>
            The Projectra Team
          </p>
        </div>
      `
    };

    await transport.sendMail(mailOptions);
    console.log(`✅ Welcome email sent to ${user.email}`);
    
    return { success: true, mode: 'production' };
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    // Don't throw error - welcome email is not critical
    return { success: false, error: error.message };
  }
};

/**
 * Verify SMTP configuration
 */
const verifyEmailConfig = async () => {
  const transport = createTransporter();
  
  if (!transport) {
    return { configured: false, verified: false };
  }

  try {
    await transport.verify();
    console.log('✅ SMTP connection verified successfully');
    return { configured: true, verified: true };
  } catch (error) {
    console.error('❌ SMTP verification failed:', error.message);
    return { configured: true, verified: false, error: error.message };
  }
};

module.exports = {
  sendInvitationEmail,
  sendWelcomeEmail,
  verifyEmailConfig
};

