/**
 * Email Sending Utility using Resend
 * 
 * Provides functions for sending transactional emails
 */

/**
 * Send verification email with OTP code
 * @param {string} toEmail - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} userName - User's name
 * @returns {Promise<void>}
 */
export async function sendVerificationEmail(toEmail, otp, userName) {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@learncart.com';

    if (!RESEND_API_KEY) {
        console.warn('⚠️  RESEND_API_KEY not configured - email not sent');
        // In development, just log the OTP
        if (process.env.NODE_ENV === 'development') {
            console.log('🔐 Development Mode - OTP for', toEmail, ':', otp);
            return;
        }
        throw new Error('Email service not configured');
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: EMAIL_FROM,
                to: toEmail,
                subject: 'Verify Your Email - LearnCart',
                html: getVerificationEmailTemplate(otp, userName),
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to send email: ${error}`);
        }

        console.log('✅ Verification email sent to:', toEmail);
    } catch (error) {
        console.error('❌ Error sending email:', error);
        throw error;
    }
}

/**
 * Generate HTML email template for verification
 * @param {string} otp - OTP code
 * @param {string} userName - User's name
 * @returns {string} HTML email template
 */
function getVerificationEmailTemplate(otp, userName) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 40px 20px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600;">🛒 LearnCart</h1>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px;">
                            <h2 style="margin: 0 0 20px; color: #333333; font-size: 24px; font-weight: 600;">Verify Your Email</h2>
                            <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">
                                Hi ${userName},
                            </p>
                            <p style="margin: 0 0 30px; color: #666666; font-size: 16px; line-height: 1.5;">
                                Thanks for signing up for LearnCart! To complete your registration and start creating listings, please verify your email address using the code below:
                            </p>
                            
                            <!-- OTP Code -->
                            <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center; margin: 0 0 30px;">
                                <div style="color: #999999; font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</div>
                                <div style="font-size: 36px; font-weight: 700; color: #667eea; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                    ${otp}
                                </div>
                                <div style="color: #999999; font-size: 13px; margin-top: 10px;">
                                    This code expires in 10 minutes
                                </div>
                            </div>
                            
                            <p style="margin: 0 0 20px; color: #666666; font-size: 16px; line-height: 1.5;">
                                Enter this code on the verification page to activate your account.
                            </p>
                            
                            <p style="margin: 0; color: #999999; font-size: 14px; line-height: 1.5;">
                                If you didn't create an account on LearnCart, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px 40px; background-color: #f8f9fa; border-radius: 0 0 8px 8px; text-align: center;">
                            <p style="margin: 0; color: #999999; font-size: 13px;">
                                © ${new Date().getFullYear()} LearnCart. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim();
}
