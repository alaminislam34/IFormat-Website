import { prisma } from "./prisma.js";
import { SYSTEM_DEFAULT_PLANS } from "../modules/plan/plan.service.js";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  try {
    console.log("🌱 Checking default database records...");

    // 1. Seed Plans
    for (const plan of SYSTEM_DEFAULT_PLANS) {
      if (plan.code === "FREE_TIER") {
        const existingFree = await prisma.plan.findUnique({ where: { code: "FREE_TIER" } });
        if (!existingFree) {
          await prisma.plan.create({
            data: {
              code: plan.code,
              name: plan.name,
              description: plan.description,
              priceInCents: plan.priceInCents,
              currency: plan.currency,
              billingInterval: plan.billingInterval as any,
              targetAudience: plan.targetAudience as any,
              stripePriceId: plan.stripePriceId,
              stripeProductId: plan.stripeProductId,
              maxActiveJobs: plan.maxActiveJobs,
              maxApplicationsPerMonth: plan.maxApplicationsPerMonth,
              aiScreeningEnabled: plan.aiScreeningEnabled,
              featuredJobPlacement: plan.featuredJobPlacement,
              unmaskedApplicantProfiles: plan.unmaskedApplicantProfiles,
              unlimitedCvTemplates: plan.unlimitedCvTemplates,
              customFeatures: plan.customFeatures as any,
            },
          });
        }
        continue;
      }

      await prisma.plan.upsert({
        where: { code: plan.code },
        create: {
          code: plan.code,
          name: plan.name,
          description: plan.description,
          priceInCents: plan.priceInCents,
          currency: plan.currency,
          billingInterval: plan.billingInterval as any,
          targetAudience: plan.targetAudience as any,
          stripePriceId: plan.stripePriceId,
          stripeProductId: plan.stripeProductId,
          maxActiveJobs: plan.maxActiveJobs,
          maxApplicationsPerMonth: plan.maxApplicationsPerMonth,
          aiScreeningEnabled: plan.aiScreeningEnabled,
          featuredJobPlacement: plan.featuredJobPlacement,
          unmaskedApplicantProfiles: plan.unmaskedApplicantProfiles,
          unlimitedCvTemplates: plan.unlimitedCvTemplates,
          customFeatures: plan.customFeatures as any,
        },
        update: {
          name: plan.name,
          description: plan.description,
          priceInCents: plan.priceInCents,
          customFeatures: plan.customFeatures as any,
          isActive: plan.isActive,
          stripePriceId: plan.stripePriceId,
          stripeProductId: plan.stripeProductId,
        },
      });
    }

    // Clean up any obsolete non-branding plans
    const validCodes = SYSTEM_DEFAULT_PLANS.map((p) => p.code);
    await prisma.plan.updateMany({
      where: { code: { notIn: validCodes } },
      data: { isActive: false, isDeleted: true, deletedAt: new Date() },
    });
    await prisma.plan.deleteMany({
      where: { code: { notIn: validCodes }, subscriptions: { none: {} } },
    });
    console.log("✅ Default membership plans seeded successfully and obsolete plans purged.");

    // 2. Ensure the primary Admin user exists (devamin.bd@gmail.com)
    const adminEmail = "devamin.bd@gmail.com";
    let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!adminUser) {
      const passwordHash = await bcrypt.hash("administrator123!", 10);
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: "iFormat Administrator",
          passwordHash,
          role: Role.ADMIN,
          emailVerified: true,
          companyName: "iFormat Global",
        },
      });
      console.log(`✅ Default Superadmin created: ${adminEmail} / administrator123!`);
    } else {
      console.log(`ℹ️ Admin user already exists (${adminEmail}). Preserving existing password.`);
    }

    console.log("🎉 Database initialization complete!");
  } catch (err: any) {
    console.warn(`[Seed Warning]: ${err.message}`);
  }
}

if (process.argv[1] && process.argv[1].includes("seed")) {
  seedDatabase().then(() => process.exit(0));
}
