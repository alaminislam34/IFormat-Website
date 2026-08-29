import { prisma } from "../../lib/prisma.js";
import { logger } from "../../utils/logger.js";

const DEFAULT_SYSTEM_SETTINGS: Record<string, string> = {
  AI_MODEL_PREFERENCE: "gpt-4o-mini",
  SCREENING_AUTO_RUN: "true",
  DEFAULT_MATCH_THRESHOLD: "75",
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
        // Try parsing JSON if value was stored as JSON string
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
}
