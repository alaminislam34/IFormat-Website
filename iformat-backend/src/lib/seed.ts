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

    // 2. Ensure primary Admin users exist (Superadmin, Jessica Founder, Info Desk)
    const adminAccounts = [
      { email: "admin@iformatbranding.com", name: "iFormat Executive Admin", password: "administrator123!" },
      { email: "devamin.bd@gmail.com", name: "iFormat Technical Lead", password: "administrator123!" },
    ];

    let primaryAdvisorId: string | null = null;

    for (const acc of adminAccounts) {
      let existingUser = await prisma.user.findUnique({ where: { email: acc.email } });
      if (!existingUser) {
        const passwordHash = await bcrypt.hash(acc.password, 10);
        existingUser = await prisma.user.create({
          data: {
            email: acc.email,
            name: acc.name,
            passwordHash,
            role: Role.ADMIN,
            emailVerified: true,
            companyName: "iFormat Global",
          },
        });
        console.log(`✅ Default Superadmin created: ${acc.email} / ${acc.password}`);
      } else {
        if (existingUser.role !== Role.ADMIN) {
          existingUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: { role: Role.ADMIN },
          });
          console.log(`✅ User ${acc.email} promoted to ADMIN role.`);
        } else {
          console.log(`ℹ️ Admin user already exists (${acc.email}).`);
        }
      }

      if (!primaryAdvisorId && acc.email === "admin@iformatbranding.com") {
        primaryAdvisorId = existingUser.id;
      }
    }

    // 3. Seed Available Consultation Slots for next 30 days
    if (primaryAdvisorId) {
      const existingFutureSlots = await prisma.consultationSlot.count({
        where: {
          startTime: { gte: new Date() },
          isDeleted: false,
          isBooked: false,
        },
      });

      if (existingFutureSlots < 10) {
        console.log("🌱 Seeding available consultation slots for the next 30 days...");
        const now = new Date();
        const slotsToCreate: any[] = [];

        // Generate slots for the next 20 business days
        for (let dayOffset = 1; dayOffset <= 28; dayOffset++) {
          const date = new Date(now);
          date.setDate(now.getDate() + dayOffset);
          const dayOfWeek = date.getDay();

          // Skip weekends (0 is Sunday, 6 is Saturday)
          if (dayOfWeek === 0 || dayOfWeek === 6) continue;

          // Add 3 sessions per day: 10:00 AM, 2:00 PM, 4:00 PM
          const sessionHours = [10, 14, 16];
          for (const hour of sessionHours) {
            const start = new Date(date);
            start.setHours(hour, 0, 0, 0);

            const end = new Date(date);
            end.setHours(hour + 1, 0, 0, 0);

            slotsToCreate.push({
              advisorId: primaryAdvisorId,
              title: "1-on-1 Personal Brand & Executive Career Consultation",
              startTime: start,
              endTime: end,
              isBooked: false,
              priceInCents: 4900,
            });
          }
        }

        if (slotsToCreate.length > 0) {
          await prisma.consultationSlot.createMany({
            data: slotsToCreate,
            skipDuplicates: true,
          });
          console.log(`✅ Successfully seeded ${slotsToCreate.length} consultation slots.`);
        }
      } else {
        console.log(`ℹ️ Sufficient consultation slots exist (${existingFutureSlots} slots available).`);
      }
    }

    console.log("🎉 Database initialization complete!");
  } catch (err: any) {
    console.warn(`[Seed Warning]: ${err.message}`);
  }
}

if (process.argv[1] && process.argv[1].includes("seed")) {
  seedDatabase().then(() => process.exit(0));
}
