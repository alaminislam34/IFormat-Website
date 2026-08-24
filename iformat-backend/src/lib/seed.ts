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

    // 3. Ensure initial published jobs exist
    const currentJobCount = await prisma.jobPosting.count();
    if (currentJobCount === 0) {
      const sampleJobs = [
        {
          title: "Senior Full Stack Developer",
          company: "Vercel Inc",
          category: "Technology & Engineering",
          jobType: "Full Time",
          workplaceType: "Remote",
          location: "Remote",
          salary: "$120,000 - $150,000",
          description: "Vercel is the platform for frontend developers, providing speed and reliability. You'll architect and build full-stack features across our core product and internal tooling.",
          responsibilities: [
            "Design and implement scalable APIs and frontend components",
            "Collaborate with design and product teams on new features",
            "Lead code reviews and mentor junior engineers",
          ],
          requirements: [
            "5+ years of full-stack engineering experience",
            "Deep expertise in React, Next.js and Node.js",
            "Experience with PostgreSQL and Redis databases",
          ],
          niceToHave: ["Edge computing experience", "Open-source contributions"],
          perks: ["Fully remote", "Unlimited PTO", "Equity package"],
          status: "PUBLISHED" as const,
        },
        {
          title: "Backend Engineer (Node.js)",
          company: "Stripe",
          category: "Technology & Engineering",
          jobType: "Full Time",
          workplaceType: "Hybrid",
          location: "Hybrid",
          salary: "$130,000 - $160,000",
          description: "Stripe builds financial infrastructure for the internet. Join our core payment platform team to build secure, reliable, and high-performance financial APIs.",
          responsibilities: [
            "Design and scale Stripe's core payment processing systems",
            "Improve API response latency and distributed database reliability",
            "Maintain strict security standards and PCI compliance",
          ],
          requirements: [
            "4+ years of backend engineering experience",
            "Expertise in Node.js, TypeScript, and database optimization",
            "Strong understanding of distributed systems and message queues",
          ],
          niceToHave: ["Experience with financial regulations", "Go or Java background"],
          perks: ["Top tier health insurance", "Learning stipend", "401k matching"],
          status: "PUBLISHED" as const,
        },
        {
          title: "Product Designer (UI/UX)",
          company: "Figma",
          category: "Design & Creative",
          jobType: "Full Time",
          workplaceType: "Remote",
          location: "Remote",
          salary: "$100,000 - $130,000",
          description: "Help build the future of design tools. You'll lead design efforts for new collaborative features in Figma, shaping how teams design together.",
          responsibilities: [
            "Conduct user research and translate insights into design solutions",
            "Create wireframes, interactive prototypes, and high-fidelity designs",
            "Maintain and expand Figma's design system tokens",
          ],
          requirements: [
            "Portfolio demonstrating clean typography, layout, and visual systems",
            "4+ years of UI/UX design experience, preferably in SaaS",
          ],
          niceToHave: ["Motion design skills", "HTML/CSS prototyping"],
          perks: ["Fully remote", "Figma Pro subscription", "Equipment budget"],
          status: "PUBLISHED" as const,
        },
        {
          title: "Senior AI / Machine Learning Researcher",
          company: "Anthropic",
          category: "Data & AI",
          jobType: "Full Time",
          workplaceType: "Hybrid",
          location: "Hybrid",
          salary: "$160,000 - $220,000",
          description: "Advance the frontiers of Artificial General Intelligence. Conduct groundbreaking research in transformer models, multimodal reasoning, and reinforcement learning.",
          responsibilities: [
            "Develop novel deep learning architectures and training paradigms",
            "Collaborate with engineering teams to scale models to thousands of GPUs",
          ],
          requirements: [
            "PhD or MS in Computer Science, Machine Learning, or equivalent",
            "Deep proficiency in PyTorch, JAX, and distributed training frameworks",
          ],
          niceToHave: ["Sparse MoE experience", "RLHF / DPO expertise"],
          perks: ["Compute access", "Research sabbatical policy", "Top compensation"],
          status: "PUBLISHED" as const,
        },
      ];

      for (const j of sampleJobs) {
        await prisma.jobPosting.create({
          data: {
            ...j,
            employerId: adminUser.id,
          },
        });
      }
      console.log(`✅ Seeded ${sampleJobs.length} active published jobs into database.`);
    }

    console.log("🎉 Database initialization complete!");
  } catch (err: any) {
    console.warn(`[Seed Warning]: ${err.message}`);
  }
}

if (process.argv[1] && process.argv[1].includes("seed")) {
  seedDatabase().then(() => process.exit(0));
}
