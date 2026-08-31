import { prisma } from "../../lib/prisma.js";
import { CreatePlanDto, UpdatePlanDto, PlanFilterQuery } from "./plan.types.js";
import { ConflictError, NotFoundError } from "../../errors/index.js";
import { PlanAudience, PlanBillingInterval, Role } from "@prisma/client";

export const SYSTEM_DEFAULT_PLANS = [
  // Official iFormat Branding Packages
  {
    code: "BRANDING_STARTER",
    name: "Starter",
    description: "Maintain brand activity and engagement.",
    priceInCents: 14900, // $149/month
    currency: "USD",
    billingInterval: PlanBillingInterval.MONTHLY,
    targetAudience: PlanAudience.BOTH,
    isActive: true,
    stripePriceId: null as string | null,
    stripeProductId: null as string | null,
    maxActiveJobs: null as number | null,
    maxApplicationsPerMonth: null as number | null,
    aiScreeningEnabled: true,
    featuredJobPlacement: false,
    unmaskedApplicantProfiles: true,
    unlimitedCvTemplates: true,
    consultationDiscountPercent: 10,
    customFeatures: [
      "Weekly engagement (4)",
      "Email/Whatsapp support",
      "Connections Strategy",
      "Reporting & analytics",
      "Job market advise",
    ],
  },
  {
    code: "BRANDING_PROFESSIONAL",
    name: "Professional",
    description: "High-touch leadership advisory & brand authority",
    priceInCents: 44900, // $449/month
    currency: "USD",
    billingInterval: PlanBillingInterval.MONTHLY,
    targetAudience: PlanAudience.BOTH,
    isActive: true,
    stripePriceId: null as string | null,
    stripeProductId: null as string | null,
    maxActiveJobs: null as number | null,
    maxApplicationsPerMonth: null as number | null,
    aiScreeningEnabled: true,
    featuredJobPlacement: true,
    unmaskedApplicantProfiles: true,
    unlimitedCvTemplates: true,
    consultationDiscountPercent: 25,
    customFeatures: [
      "Dedicated consultant",
      "1:1 Brand Strategy",
      "Recruiter Engagement",
      "Brand Updates/Edits",
      "Interview Coaching",
      "Salary Negotiation",
    ],
  },
  {
    code: "BRANDING_GROW",
    name: "Grow",
    description: "For career pivoters and specialized Brand visibility and job market alignment",
    priceInCents: 29900, // $299/package
    currency: "USD",
    billingInterval: PlanBillingInterval.MONTHLY,
    targetAudience: PlanAudience.BOTH,
    isActive: true,
    stripePriceId: null as string | null,
    stripeProductId: null as string | null,
    maxActiveJobs: null as number | null,
    maxApplicationsPerMonth: null as number | null,
    aiScreeningEnabled: true,
    featuredJobPlacement: false,
    unmaskedApplicantProfiles: true,
    unlimitedCvTemplates: true,
    consultationDiscountPercent: 15,
    customFeatures: [
      "Weekly engagement (4)",
      "Email/Whatsapp support",
      "Connections Strategy",
      "Reporting & analytics",
      "Recruiter messaging",
      "Quarterly LinkedIn Optimization",
    ],
  },
  {
    code: "BRANDING_ENTERPRISE",
    name: "Enterprise Solutions",
    description: "Designed for career changers and niche pros to boost your brand and meet market needs",
    priceInCents: 0, // Custom / Contact Us
    currency: "USD",
    billingInterval: PlanBillingInterval.MONTHLY,
    targetAudience: PlanAudience.BOTH,
    isActive: true,
    stripePriceId: null as string | null,
    stripeProductId: null as string | null,
    maxActiveJobs: null as number | null,
    maxApplicationsPerMonth: null as number | null,
    aiScreeningEnabled: true,
    featuredJobPlacement: true,
    unmaskedApplicantProfiles: true,
    unlimitedCvTemplates: true,
    consultationDiscountPercent: 50,
    customFeatures: [
      "Outplacement Support",
      "Startup Brand Equity",
      "Stakeholder Brand Equity",
      "Investor Brand Engagement",
      "Restructuring",
      "Workforce Transitions",
    ],
  },
];

export class PlanService {
  /**
   * List all active public plans with optional filtering
   */
  static async listPlans(filters: PlanFilterQuery = {}) {
    const where: any = {};

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    } else {
      where.isActive = true; // default to active only for public
    }

    if (filters.audience && filters.audience !== "ALL") {
      where.targetAudience = { in: [filters.audience, PlanAudience.BOTH] };
    }

    if (filters.interval) {
      where.billingInterval = filters.interval;
    }

    try {
      const plans = await prisma.plan.findMany({
        where,
        orderBy: [{ priceInCents: "asc" }, { name: "asc" }],
      });

      if (plans.length > 0) return plans;
    } catch {
      // If DB is offline or not yet migrated, return default system plans matching filters
    }

    return SYSTEM_DEFAULT_PLANS.filter((p) => {
      if (filters.audience && filters.audience !== "ALL") {
        const pAudience = p.targetAudience as PlanAudience;
        if (pAudience !== filters.audience && pAudience !== PlanAudience.BOTH) {
          return false;
        }
      }
      if (filters.interval && p.billingInterval !== filters.interval) {
        return false;
      }
      return true;
    });
  }

  /**
   * Get single plan by ID or code
   */
  static async getPlanByIdOrCode(idOrCode: string) {
    try {
      const plan = await prisma.plan.findFirst({
        where: {
          OR: [{ id: idOrCode }, { code: idOrCode }],
        },
      });

      if (plan) return plan;
    } catch {
      // Fallback to static plan
    }

    const fallback = SYSTEM_DEFAULT_PLANS.find(
      (p) => p.code === idOrCode || (p as any).id === idOrCode
    );

    if (!fallback) {
      throw new NotFoundError("Plan", idOrCode);
    }

    return { id: `mock-${fallback.code.toLowerCase()}`, ...fallback };
  }

  /**
   * Find default fallback plan based on user role
   */
  static getDefaultPlanForRole(role: Role) {
    const code = role === Role.EMPLOYER ? "EMPLOYER_FREE" : "CANDIDATE_FREE";
    return (
      SYSTEM_DEFAULT_PLANS.find((p) => p.code === code) || SYSTEM_DEFAULT_PLANS[0]
    );
  }

  /**
   * Admin: Create a new plan
   */
  static async createPlan(data: CreatePlanDto) {
    const existing = await prisma.plan.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      throw new ConflictError(`Plan with code '${data.code}' already exists`);
    }

    return prisma.plan.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        currency: data.currency || "USD",
        billingInterval: data.billingInterval || PlanBillingInterval.MONTHLY,
        targetAudience: data.targetAudience || PlanAudience.EMPLOYER,
        stripePriceId: data.stripePriceId,
        stripeProductId: data.stripeProductId,
        maxActiveJobs: data.maxActiveJobs,
        maxApplicationsPerMonth: data.maxApplicationsPerMonth,
        aiScreeningEnabled: data.aiScreeningEnabled || false,
        featuredJobPlacement: data.featuredJobPlacement || false,
        unmaskedApplicantProfiles: data.unmaskedApplicantProfiles || false,
        unlimitedCvTemplates: data.unlimitedCvTemplates || false,
        consultationDiscountPercent: data.consultationDiscountPercent || 0,
        customFeatures: data.customFeatures,
      },
    });
  }

  /**
   * Admin: Update an existing plan
   */
  static async updatePlan(id: string, data: UpdatePlanDto) {
    const existing = await prisma.plan.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundError("Plan", id);
    }

    return prisma.plan.update({
      where: { id },
      data,
    });
  }

  /**
   * Seed default plans in database if table is empty
   */
  static async seedDefaultPlans() {
    try {
      for (const p of SYSTEM_DEFAULT_PLANS) {
        await prisma.plan.upsert({
          where: { code: p.code },
          create: p,
          update: p,
        });
      }
    } catch {
      // Ignored if DB is disconnected during testing
    }
  }
}
