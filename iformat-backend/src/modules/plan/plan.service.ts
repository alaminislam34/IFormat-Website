import { prisma } from "../../lib/prisma.js";
import { CreatePlanDto, UpdatePlanDto, PlanFilterQuery } from "./plan.types.js";
import { ConflictError, NotFoundError } from "../../errors/index.js";
import { PlanAudience, PlanBillingInterval, Role } from "@prisma/client";

export const SYSTEM_DEFAULT_PLANS = [
  // Employer Plans
  {
    code: "EMPLOYER_FREE",
    name: "Employer Starter (Free)",
    description: "Basic hiring capabilities with 1 active job posting.",
    priceInCents: 0,
    currency: "USD",
    billingInterval: PlanBillingInterval.MONTHLY,
    targetAudience: PlanAudience.EMPLOYER,
    isActive: true,
    stripePriceId: null as string | null,
    stripeProductId: null as string | null,
    maxActiveJobs: 1,
    maxApplicationsPerMonth: null as number | null,
    aiScreeningEnabled: false,
    featuredJobPlacement: false,
    unmaskedApplicantProfiles: false,
    unlimitedCvTemplates: false,
    consultationDiscountPercent: 0,
  },
  {
    code: "EMPLOYER_STARTER",
    name: "Employer Growth",
    description: "Growing teams with 3 active job slots and AI screening credits.",
    priceInCents: 2900, // $29/month
    currency: "USD",
    billingInterval: PlanBillingInterval.MONTHLY,
    targetAudience: PlanAudience.EMPLOYER,
    isActive: true,
    stripePriceId: null as string | null,
    stripeProductId: null as string | null,
    maxActiveJobs: 3,
    maxApplicationsPerMonth: null as number | null,
    aiScreeningEnabled: true,
    featuredJobPlacement: false,
    unmaskedApplicantProfiles: true,
    unlimitedCvTemplates: false,
    consultationDiscountPercent: 10,
  },
  {
    code: "EMPLOYER_PRO",
    name: "Employer Pro",
    description: "Professional hiring pipeline with 10 active jobs and unlimited AI screening.",
    priceInCents: 7900, // $79/month
    currency: "USD",
    billingInterval: PlanBillingInterval.MONTHLY,
    targetAudience: PlanAudience.EMPLOYER,
    isActive: true,
    stripePriceId: null as string | null,
    stripeProductId: null as string | null,
    maxActiveJobs: 10,
    maxApplicationsPerMonth: null as number | null,
    aiScreeningEnabled: true,
    featuredJobPlacement: true,
    unmaskedApplicantProfiles: true,
    unlimitedCvTemplates: false,
    consultationDiscountPercent: 20,
  },
  {
    code: "EMPLOYER_ENTERPRISE",
    name: "Employer Enterprise",
    description: "Unlimited job postings, dedicated support, and full applicant profile visibility.",
    priceInCents: 19900, // $199/month
    currency: "USD",
    billingInterval: PlanBillingInterval.MONTHLY,
    targetAudience: PlanAudience.EMPLOYER,
    isActive: true,
    stripePriceId: null as string | null,
    stripeProductId: null as string | null,
    maxActiveJobs: null as number | null, // Unlimited
    maxApplicationsPerMonth: null as number | null,
    aiScreeningEnabled: true,
    featuredJobPlacement: true,
    unmaskedApplicantProfiles: true,
    unlimitedCvTemplates: false,
    consultationDiscountPercent: 30,
  },
  // Candidate Plans
  {
    code: "CANDIDATE_FREE",
    name: "Candidate Basic",
    description: "Standard job application access with 5 monthly submissions.",
    priceInCents: 0,
    currency: "USD",
    billingInterval: PlanBillingInterval.MONTHLY,
    targetAudience: PlanAudience.CANDIDATE,
    isActive: true,
    stripePriceId: null as string | null,
    stripeProductId: null as string | null,
    maxActiveJobs: null as number | null,
    maxApplicationsPerMonth: 5,
    aiScreeningEnabled: false,
    featuredJobPlacement: false,
    unmaskedApplicantProfiles: true,
    unlimitedCvTemplates: false,
    consultationDiscountPercent: 0,
  },
  {
    code: "CANDIDATE_PRO",
    name: "Candidate Premium Career",
    description: "Unlimited job applications, premium CV templates, and consultation discounts.",
    priceInCents: 1500, // $15/month
    currency: "USD",
    billingInterval: PlanBillingInterval.MONTHLY,
    targetAudience: PlanAudience.CANDIDATE,
    isActive: true,
    stripePriceId: null as string | null,
    stripeProductId: null as string | null,
    maxActiveJobs: null as number | null,
    maxApplicationsPerMonth: null as number | null, // Unlimited
    aiScreeningEnabled: true,
    featuredJobPlacement: false,
    unmaskedApplicantProfiles: true,
    unlimitedCvTemplates: true,
    consultationDiscountPercent: 20,
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
