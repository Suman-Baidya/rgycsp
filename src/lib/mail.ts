import { Resend } from 'resend';

// Initialize Resend with the provided API key
export const resend = new Resend(process.env.RESEND_API_KEY);

const fromEmail = process.env.SMTP_FROM || 'onboarding@resend.dev'; // Use verified domain string in production

/**
 * Super Admin Utility to send system alerts
 */
export async function sendSystemAlertEmail(subject: string, htmlContent: string) {
  try {
    const developerEmail = process.env.DEVELOPER_EMAIL;
    if (!developerEmail) return { error: "Developer email not set." };

    const data = await resend.emails.send({
      from: fromEmail,
      to: developerEmail,
      subject: `[ABCD Edu Hub Alert] ${subject}`,
      html: htmlContent,
    });
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
    const data = await resend.emails.send({
      from: fromEmail, // Needs to be an authenticated domain associated with Resend
      to: studentEmail,
      subject: `[${workspaceName}] ${subject}`,
      html: htmlContent,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Failed to send student email", error);
    return { success: false, error };
  }
}
