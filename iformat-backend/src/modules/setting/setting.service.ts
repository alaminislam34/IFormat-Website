import { prisma } from "../../lib/prisma.js";
import { logger } from "../../utils/logger.js";
import { env } from "../../config/env.js";
import { Role } from "@prisma/client";
import nodemailer from "nodemailer";

const DEFAULT_SYSTEM_SETTINGS: Record<string, string> = {
  AI_MODEL_PREFERENCE: "gpt-4o-mini",
  SCREENING_AUTO_RUN: "true",
  DEFAULT_MATCH_THRESHOLD: "75",
  CONTACT_LOCATION: "123 Business Pkwy, Suite 400\nNew York, NY 10001",
  CONTACT_PHONE: "+1 (555) 123-4567",
  CONTACT_EMAIL: "info@iformatbranding.com",
};

export class SettingService {
  /**
   * Get all system settings as a key-value dictionary
   */
  static async getAllSettings(): Promise<Record<string, any>> {
    const rows = await prisma.systemSetting.findMany();

    const settingsMap: Record<string, any> = { ...DEFAULT_SYSTEM_SETTINGS };
    for (const row of rows) {
      try {
        settingsMap[row.key] = JSON.parse(row.value);
      } catch {
        settingsMap[row.key] = row.value;
      }
    }

    return settingsMap;
  }

  /**
   * Upsert one or multiple system settings
   */
  static async updateSettings(
    settings: Record<string, any>,
    updatedById?: string
  ): Promise<Record<string, any>> {
    const entries = Object.entries(settings);

    await prisma.$transaction(
      entries.map(([key, value]) => {
        const stringValue = typeof value === "string" ? value : JSON.stringify(value);
        return prisma.systemSetting.upsert({
          where: { key },
          create: {
            key,
            value: stringValue,
            updatedById,
          },
          update: {
            value: stringValue,
            updatedById,
          },
        });
      })
    );

    logger.info(
      `⚙️ System settings updated by user ${updatedById || "system"}: ${entries
        .map(([k]) => k)
        .join(", ")}`
    );

    return this.getAllSettings();
  }

  /**
   * Public contact information (location, phone, email)
   */
  static async getContactInfo(): Promise<{ location: string; phone: string; email: string }> {
    const rows = await prisma.systemSetting.findMany({
      where: {
        key: { in: ["CONTACT_LOCATION", "CONTACT_PHONE", "CONTACT_EMAIL"] },
      },
    });

    const result = {
      location: DEFAULT_SYSTEM_SETTINGS.CONTACT_LOCATION,
      phone: DEFAULT_SYSTEM_SETTINGS.CONTACT_PHONE,
      email: DEFAULT_SYSTEM_SETTINGS.CONTACT_EMAIL,
    };

    for (const r of rows) {
      if (r.key === "CONTACT_LOCATION" && r.value) result.location = r.value;
      if (r.key === "CONTACT_PHONE" && r.value) result.phone = r.value;
      if (r.key === "CONTACT_EMAIL" && r.value) result.email = r.value;
    }

    return result;
  }

  /**
   * Update contact information
   */
  static async updateContactInfo(
    data: { location?: string; phone?: string; email?: string },
    updatedById?: string
  ) {
    const updates: Array<{ key: string; value: string }> = [];
    if (data.location !== undefined) updates.push({ key: "CONTACT_LOCATION", value: data.location });
    if (data.phone !== undefined) updates.push({ key: "CONTACT_PHONE", value: data.phone });
    if (data.email !== undefined) updates.push({ key: "CONTACT_EMAIL", value: data.email });

    for (const item of updates) {
      await prisma.systemSetting.upsert({
        where: { key: item.key },
        create: { key: item.key, value: item.value, updatedById },
        update: { value: item.value, updatedById },
      });
    }

    return this.getContactInfo();
  }

  /**
   * Submit Contact Us Inquiry:
   * - Records inquiry in DB
   * - Dispatches email notification to info@iformatbranding.com
   * - Creates in-app admin notifications
   */
  static async submitContactInquiry(data: {
    fullName: string;
    email: string;
    phone?: string;
    message: string;
  }) {
    const inquiry = await prisma.contactInquiry.create({
      data: {
        fullName: data.fullName.trim(),
        email: data.email.trim(),
        phone: data.phone ? data.phone.trim() : null,
        message: data.message.trim(),
        status: "UNREAD",
      },
    });

    // 1. Dispatch notification email to info@iformatbranding.com
    try {
      const emailSubject = `🔔 New Contact Us Message from ${data.fullName}`;
      const emailBody = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1e293b; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0;">
          <h2 style="color: #0A54B1; margin-top: 0;">New Contact Form Message</h2>
          <p style="font-size: 14px; color: #64748b;">A visitor submitted an inquiry through the iFormat website Contact section:</p>
          <div style="background: #f8fafc; border-radius: 12px; padding: 18px; margin: 20px 0; border: 1px solid #e2e8f0;">
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Full Name:</strong> ${data.fullName}</p>
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #0284c7;">${data.email}</a></p>
            <p style="margin: 0 0 10px 0; font-size: 14px;"><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
            <p style="margin: 0; font-size: 14px;"><strong>Message:</strong></p>
            <div style="margin-top: 8px; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 14px; white-space: pre-wrap;">${data.message}</div>
          </div>
          <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">This message has also been saved to your iFormat Admin Inquiries dashboard.</p>
        </div>
      `;

      if (env.NODE_ENV === "development" && (!env.SMTP_USER || env.SMTP_PASS === "app-password")) {
        logger.info(
          `📧 [DEV EMAIL SIMULATION] Contact inquiry from ${data.fullName} (${data.email}) sent to info@iformatbranding.com`
        );
      } else {
        const transporter = nodemailer.createTransport({
          host: env.SMTP_HOST,
          port: env.SMTP_PORT,
          secure: env.SMTP_PORT === 465,
          auth: {
            user: env.SMTP_USER,
            pass: env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: env.SMTP_FROM,
          to: "info@iformatbranding.com",
          replyTo: data.email,
          subject: emailSubject,
          html: emailBody,
        });
        logger.info(`📧 Contact notification email successfully dispatched to info@iformatbranding.com`);
      }
    } catch (mailErr: any) {
      logger.warn(`⚠️ [SettingService] Could not send contact notification email: ${mailErr.message}`);
    }

    // 2. Create in-app admin notifications
    try {
      const adminUsers = await prisma.user.findMany({
        where: { role: Role.ADMIN },
        select: { id: true },
      });

      if (adminUsers.length > 0) {
        await prisma.notification.createMany({
          data: adminUsers.map((a) => ({
            userId: a.id,
            title: "New Contact Us Message",
            message: `${data.fullName} sent a message: "${data.message.slice(0, 100)}..."`,
            type: "SYSTEM",
          })),
        });
      }
    } catch (notifErr: any) {
      logger.warn(`⚠️ [SettingService] Could not create admin in-app notification: ${notifErr.message}`);
    }

    return inquiry;
  }

  /**
   * List contact inquiries for Admin Dashboard
   */
  static async getContactInquiries(page = 1, limit = 20, status?: string, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (search && search.trim()) {
      where.OR = [
        { fullName: { contains: search.trim(), mode: "insensitive" } },
        { email: { contains: search.trim(), mode: "insensitive" } },
        { phone: { contains: search.trim(), mode: "insensitive" } },
        { message: { contains: search.trim(), mode: "insensitive" } },
      ];
    }

    const [inquiries, total] = await Promise.all([
      prisma.contactInquiry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.contactInquiry.count({ where }),
    ]);

    return {
      inquiries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update inquiry status
   */
  static async updateContactInquiryStatus(id: string, status: string) {
    return prisma.contactInquiry.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Delete contact inquiry
   */
  static async deleteContactInquiry(id: string) {
    return prisma.contactInquiry.delete({
      where: { id },
    });
  }
}
