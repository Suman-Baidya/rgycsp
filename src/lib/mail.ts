import { Resend } from 'resend';

// Initialize Resend with the provided API key (or a dummy key to prevent runtime errors on startup)
export const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_to_bypass_init_error_123');

const fromEmail = process.env.SMTP_FROM || 'onboarding@resend.dev'; // Use verified domain string in production

/**
 * Super Admin Utility to send system alerts
 */
export async function sendSystemAlertEmail(subject: string, htmlContent: string) {
  try {
    const developerEmail = process.env.DEVELOPER_EMAIL;
    if (!developerEmail) return { error: "Developer email not set." };

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: developerEmail,
      subject: `[ABCD Edu Hub Alert] ${subject}`,
      html: htmlContent,
    });
    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send system alert email", error);
    return { success: false, error };
  }
}

/**
 * Standard utility to send student notifications based on Workspace activities
 */
export async function sendStudentNotification(
  studentEmail: string, 
  workspaceName: string, 
  subject: string, 
  htmlContent: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail, // Needs to be an authenticated domain associated with Resend
      to: studentEmail,
      subject: `[${workspaceName}] ${subject}`,
      html: htmlContent,
    });
    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send student email", error);
    return { success: false, error };
  }
}
/**
 * Send OTP for email verification
 */
export async function sendOTPEmail(email: string, otp: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: "Verification Code for Admission",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px;">
          <h2 style="color: #0f172a; font-weight: 800; margin-bottom: 8px;">Verification Code</h2>
          <p style="color: #64748b; font-size: 14px; margin-bottom: 24px;">Please use the following code to verify your email address for your admission application.</p>
          <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 4px; color: #0f172a;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">This code will expire in 10 minutes. If you didn't request this, please ignore this email.</p>
        </div>
      `,
    });
    if (error) {
      console.error("Resend API Error:", error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send OTP email", error);
    return { success: false, error };
  }
}
