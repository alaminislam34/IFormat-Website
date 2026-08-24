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
});

interface SendEmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export const sendEmail = async ({
  to,
  subject,
  template,
  data,
}: SendEmailOptions): Promise<boolean> => {
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

    await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html: fullHtml,
    });

    logger.info(`📧 Email sent successfully to ${to} (${template})`);
    return true;
  } catch (error) {
    logger.error(`Failed to send email (${template}) to ${to}:`, error);
    return false;
  }
};
