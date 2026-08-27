import { prisma } from "./prisma.js";
import { SYSTEM_DEFAULT_PLANS } from "../modules/plan/plan.service.js";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  try {
    console.log("🌱 Checking default database records...");

    // 1. Seed Plans
    for (const plan of SYSTEM_DEFAULT_PLANS) {
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
          isActive: plan.isActive,
          maxActiveJobs: plan.maxActiveJobs,
          maxApplicationsPerMonth: plan.maxApplicationsPerMonth,
          aiScreeningEnabled: plan.aiScreeningEnabled,
          featuredJobPlacement: plan.featuredJobPlacement,
          unmaskedApplicantProfiles: plan.unmaskedApplicantProfiles,
          unlimitedCvTemplates: plan.unlimitedCvTemplates,
          consultationDiscountPercent: plan.consultationDiscountPercent,
        },
        update: {
          name: plan.name,
          priceInCents: plan.priceInCents,
          isActive: plan.isActive,
        },
      });
    }
    console.log("✅ Default membership plans seeded successfully.");

    // 2. Ensure an Admin user exists for testing
    const adminEmail = "admin@iformat.com";
    let adminUser = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!adminUser) {
      const passwordHash = await bcrypt.hash("AdminPassword123!", 10);
      adminUser = await prisma.user.create({
        data: {
          email: adminEmail,
          name: "Super Admin",
          passwordHash,
          role: Role.ADMIN,
          emailVerified: true,
          companyName: "iFormat Global",
        },
      });
      console.log(`✅ Default Superadmin created: ${adminEmail} / AdminPassword123!`);
    }

    console.log("🎉 Database initialization complete!");
  } catch (err: any) {
    console.warn(`[Seed Warning]: ${err.message}`);
  }
}

if (process.argv[1] && process.argv[1].includes("seed")) {
  seedDatabase().then(() => process.exit(0));
}
