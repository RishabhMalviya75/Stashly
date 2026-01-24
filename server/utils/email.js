/**
 * Email Utility
 * =============
 * Handles sending emails using nodemailer.
 */

const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
    const port = parseInt(process.env.SMTP_PORT) || 465;
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: port,
        secure: port === 465, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        // Add timeout settings
        connectionTimeout: 10000, // 10 seconds
        greetingTimeout: 10000,
        socketTimeout: 10000
    });
};

/**
 * Send password reset verification code email
 * @param {string} email - Recipient email
 * @param {string} code - 6-digit verification code
 * @param {string} displayName - User's display name
 */
const sendPasswordResetCode = async (email, code, displayName = 'User') => {
    const transporter = createTransporter();

    const mailOptions = {
        from: `"Stashly" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Reset Code - Stashly',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table role="presentation" style="width: 100%; max-width: 480px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                <!-- Header -->
                                <tr>
                                    <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #e5e5e5;">
                                        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #171717;">
                                            🔐 Stashly
                                        </h1>
                                    </td>
                                </tr>
                                
                                <!-- Content -->
                                <tr>
                                    <td style="padding: 32px;">
                                        <p style="margin: 0 0 16px; font-size: 16px; color: #525252;">
                                            Hi ${displayName},
                                        </p>
                                        <p style="margin: 0 0 24px; font-size: 16px; color: #525252;">
                                            You requested to reset your password. Use the verification code below to proceed:
                                        </p>
                                        
                                        <!-- Code Box -->
                                        <div style="background-color: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                                            <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #171717; font-family: monospace;">
                                                ${code}
                                            </span>
                                        </div>
                                        
                                        <p style="margin: 0 0 8px; font-size: 14px; color: #737373;">
                                            ⏱️ This code expires in <strong>10 minutes</strong>.
                                        </p>
                                        <p style="margin: 0; font-size: 14px; color: #737373;">
                                            If you didn't request this, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                                
                                <!-- Footer -->
                                <tr>
                                    <td style="padding: 24px 32px; background-color: #fafafa; border-radius: 0 0 12px 12px; text-align: center;">
                                        <p style="margin: 0; font-size: 12px; color: #a3a3a3;">
                                            © ${new Date().getFullYear()} Stashly. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
        `,
        text: `
Hi ${displayName},

You requested to reset your password. Your verification code is: ${code}

This code expires in 10 minutes.

If you didn't request this, you can safely ignore this email.

- Stashly Team
        `.trim()
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = {
    sendPasswordResetCode
};
