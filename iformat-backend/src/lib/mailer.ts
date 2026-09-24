import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
  replyTo?: string;
  text?: string;
}

/**
 * Generate plain-text fallback for emails.
 * High-deliverability: Email clients (Gmail, Outlook, Yahoo) require multipart/alternative
 * with clean plain-text to avoid high spam scores.
 */
function buildPlainText(template: string, data: Record<string, any>, subject: string): string {
  if (template === "otp-verification") {
    return [
      `Your iFormat Verification Code is: ${data.code}`,
      `================================================`,
      ``,
      `Hello ${data.name || "there"},`,
      ``,
      `Your 6-digit verification code is: ${data.code}`,
      ``,
      `This code is valid for 10 minutes. Please enter it in the iFormat website or app to complete your verification.`,
      ``,
      `If you did not request this verification code, please ignore this email. Your account is secure.`,
      ``,
      `Security reminder: iFormat will never ask you for your password or verification code.`,
      ``,
      `------------------------------------------------`,
      `iFormat Branding Ltd.`,
      `Official Website: https://iformatbranding.com`,
      `Official Support: info@iformatbranding.com`,
    ].join("\n");
  }

  if (template === "password-reset") {
    return [
      `iFormat Password Reset Request`,
      `================================================`,
      ``,
      `Hello ${data.name || "there"},`,
      ``,
      data.code ? `Your 6-digit verification code is: ${data.code}\n` : ``,
      `We received a request to reset the password for your iFormat account.`,
      data.resetUrl ? `Click the link below or paste it into your browser to set a new password:\n${data.resetUrl}\n` : ``,
      `This request is valid for 10 minutes.`,
      `If you did not make this request, you can safely ignore this email.`,
      ``,
      `------------------------------------------------`,
      `iFormat Branding Ltd.`,
      `Official Website: https://iformatbranding.com`,
      `Official Support: info@iformatbranding.com`,
    ].join("\n");
  }

  if (template === "booking-confirmation") {
    return [
      `iFormat - Consultation Booking Confirmation`,
      `================================================`,
      ``,
      `Hello ${data.name || "there"},`,
      ``,
      `Your consultation booking has been confirmed with our team.`,
      data.details ? `Details: ${data.details}\n` : ``,
      ``,
      `If you need to reschedule or have questions, contact us at info@iformatbranding.com`,
      ``,
      `iFormat Branding Ltd. · https://iformatbranding.com`,
    ].join("\n");
  }

  return [
    `${subject}`,
    `================================================`,
    `Hello ${data.name || "there"},`,
    ``,
    `Thank you for using iFormat.`,
    ``,
    `For any assistance, contact our team at info@iformatbranding.com`,
    `Visit: https://iformatbranding.com`,
  ].join("\n");
}

export const sendEmail = async ({
  to,
  subject,
  template,
  data,
  replyTo,
  text,
}: SendEmailOptions): Promise<boolean> => {
  const maxRetries = 2;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const templatePath = path.resolve(
        process.cwd(),
        "src",
        "views",
        "emails",
        `${template}.ejs`
      );
      const layoutPath = path.resolve(
        process.cwd(),
        "src",
        "views",
        "emails",
        "layouts",
        "base.ejs"
      );

      const bodyHtml = await ejs.renderFile(templatePath, data);
      const fullHtml = await ejs.renderFile(layoutPath, {
        subject,
        body: bodyHtml,
        ...data,
      });

      if (
        env.NODE_ENV === "development" &&
        (!env.SMTP_USER || env.SMTP_PASS === "app-password")
      ) {
        logger.info(
          `📧 [DEV EMAIL SIMULATION] To: ${to} | Subject: "${subject}" | Template: ${template}`
        );
        return true;
      }

      // Generate RFC-compliant Message-ID and anti-spam deliverability headers
      const domain = "iformatbranding.com";
      const messageId = `<${Date.now()}.${Math.random().toString(36).substring(2, 10)}@${domain}>`;
      const plainText = text || buildPlainText(template, data, subject);
      const isUrgent = template.includes("otp") || template.includes("reset");

      await transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        replyTo: replyTo || env.SMTP_REPLY_TO || "info@iformatbranding.com",
        subject,
        text: plainText,
        html: fullHtml,
        messageId,
        headers: {
          "X-Mailer": "iFormat Mailer 1.0",
          "X-Priority": isUrgent ? "1 (Highest)" : "3 (Normal)",
          "Importance": isUrgent ? "High" : "Normal",
          "Auto-Submitted": "auto-generated",
          "X-Auto-Response-Suppress": "OOF, AutoReply",
        },
      });

      logger.info(`📧 Email sent successfully to ${to} (${template}) from ${env.SMTP_FROM}`);
      return true;
    } catch (error) {
      if (attempt < maxRetries) {
        logger.warn(`⚠️ [Mailer] Attempt ${attempt} failed to send email to ${to}. Retrying...`);
        await new Promise((res) => setTimeout(res, 1000 * attempt));
      } else {
        logger.error(`❌ [Mailer] All ${maxRetries} attempts failed to send email (${template}) to ${to}:`, error);
        return false;
      }
    }
  }
  return false;
};
