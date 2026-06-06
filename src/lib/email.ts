import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.mailtrap.io",
  port: parseInt(process.env.SMTP_PORT || "2525"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const defaultFrom = process.env.SMTP_FROM || '"BQMS Security" <noreply@bqms.local>';

async function sendMail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({ from: defaultFrom, to, subject, html });
    console.log(`[Email Sent]: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("[Email Error]:", error);
    return { success: false, error };
  }
}

export async function sendPasswordResetEmail(to: string, userName: string, resetUrl: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1e3a8a;">BQMS Password Reset</h2>
      <p>Hello ${userName},</p>
      <p>We received a request to reset your password for the Biofix Quality Management System (BQMS).</p>
      <p>Please click the button below to set a new password. This link will expire in 15 minutes.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
      </div>
      <p style="font-size: 12px; color: #ef4444;"><strong>Security Warning:</strong> If you did not request a password reset, please ignore this email or contact your system administrator immediately.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 12px; color: #6b7280;">If the button doesn't work, copy and paste this link into your browser:<br/>${resetUrl}</p>
    </div>
  `;
  return sendMail(to, "BQMS - Password Reset Request", html);
}

export async function sendSecurityNotification(to: string, userName: string, action: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1e3a8a;">BQMS Security Alert</h2>
      <p>Hello ${userName},</p>
      <p>We noticed a security-related action on your account:</p>
      <p style="padding: 10px; background-color: #f3f4f6; border-left: 4px solid #f59e0b; font-weight: bold;">${action}</p>
      <p>If this was you, no further action is required.</p>
      <p style="font-size: 12px; color: #ef4444;"><strong>Security Warning:</strong> If you did not perform this action, please reset your password and contact support immediately.</p>
    </div>
  `;
  return sendMail(to, "BQMS - Security Alert", html);
}

export async function sendWelcomeEmail(to: string, userName: string, loginUrl: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #1e3a8a;">Welcome to BQMS!</h2>
      <p>Hello ${userName},</p>
      <p>Your account has been successfully created on the Biofix Quality Management System (BQMS).</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Login to your Account</a>
      </div>
      <p>We're excited to have you on board.</p>
    </div>
  `;
  return sendMail(to, "Welcome to BQMS", html);
}

// Keep generic sendEmail for backwards compatibility if needed, or remove if unused.
export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  return sendMail(to, subject, html);
}
