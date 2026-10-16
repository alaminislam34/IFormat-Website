import { prisma } from "./prisma.js";
import { LEGACY_CATEGORY_MAP } from "../config/job-options.js";
import { logger } from "../utils/logger.js";

const WORK_MODES = ["Remote", "Onsite", "Hybrid"] as const;

/**
 * Backfill for jobs created before the structured location / category update.
 * Copies the mode into `workplaceType` and moves legacy categories to the new
 * list, keeping the old name in `originalCategory` so nothing is lost.
 * Idempotent: safe to run on every startup.
 */
export async function migrateLegacyJobData() {
  let modes = 0;
  for (const mode of WORK_MODES) {
    const { count } = await prisma.jobPosting.updateMany({
      where: { location: mode, NOT: { workplaceType: mode } },
      data: { workplaceType: mode },
    });
    modes += count;
  }

  // Category names are replaced, but the previous value is kept in originalCategory.
  let categories = 0;
  for (const [from, to] of Object.entries(LEGACY_CATEGORY_MAP)) {
    const { count } = await prisma.jobPosting.updateMany({
      where: { category: from },
      data: { category: to, originalCategory: from },
    });
    categories += count;
  }

  if (modes || categories) {
    logger.info(`Migrated legacy job data: ${modes} work modes, ${categories} categories`);
  }
}
