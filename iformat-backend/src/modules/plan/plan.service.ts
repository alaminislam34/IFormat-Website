import { prisma } from "../../lib/prisma.js";
import { env } from "../../config/env.js";
import { stripe, isMockStripe } from "../../lib/stripe.js";
import { logger } from "../../utils/logger.js";
import { CreatePlanDto, UpdatePlanDto, PlanFilterQuery } from "./plan.types.js";
import { ConflictError, NotFoundError } from "../../errors/index.js";
import { PlanAudience, PlanBillingInterval, Role } from "@prisma/client";

export const SYSTEM_FREE_PLAN = {
  code: "FREE_TIER",
  name: "Free Tier",
  description: "Standard job search, application tracking, and essential career tools.",
  priceInCents: 0,
  currency: "USD",
  billingInterval: PlanBillingInterval.MONTHLY,
  targetAudience: PlanAudience.BOTH,
  isActive: true,
  stripePriceId: null as string | null,
  stripeProductId: null as string | null,
  maxActiveJobs: 0,
  maxApplicationsPerMonth: 5,
  aiScreeningEnabled: false,
  featuredJobPlacement: false,
  unmaskedApplicantProfiles: false,
  unlimitedCvTemplates: false,
  customFeatures: [
    "Search & browse jobs",
    "Candidate profile",
    "Standard applications",
  ],
};

export const SYSTEM_DEFAULT_PLANS = [
  // 0. Free Tier
  SYSTEM_FREE_PLAN,
  // 1. Starter Plan
  {
    code: "BRANDING_STARTER",
    name: "Starter",
    description: "Maintain brand activity and engagement.",
    priceInCents: 14900, // $149/month
    currency: "USD",
    billingInterval: PlanBillingInterval.MONTHLY,
    targetAudience: PlanAudience.BOTH,
    isActive: true,
    stripePriceId: env.STRIPE_PRICE_STARTER || null,
    stripeProductId: env.STRIPE_PRODUCT_STARTER || null,
    maxActiveJobs: null as number | null,
    maxApplicationsPerMonth: null as number | null,
    aiScreeningEnabled: true,
    featuredJobPlacement: false,
    unmaskedApplicantProfiles: true,
    unlimitedCvTemplates: true,
    customFeatures: [
      "Weekly engagement (4)",
      "Email/Whatsapp support",
      "Connections Strategy",
      "Reporting & analytics",
      "Job market advise",
    ],
  },
  // 2. Grow Plan
  {
    code: "BRANDING_GROW",
    name: "Grow",
    description: "For career pivoters and specialized Brand visibility and job market alignment",
    priceInCents: 29900, // $299/package
    currency: "USD",
    billingInterval: PlanBillingInterval.MONTHLY,
    targetAudience: PlanAudience.BOTH,
    isActive: true,
    stripePriceId: env.STRIPE_PRICE_GROW || null,
    stripeProductId: env.STRIPE_PRODUCT_GROW || null,
    maxActiveJobs: null as number | null,
    maxApplicationsPerMonth: null as number | null,
    aiScreeningEnabled: true,
    featuredJobPlacement: false,
    unmaskedApplicantProfiles: true,
    unlimitedCvTemplates: true,
    customFeatures: [
      "Weekly engagement (4)",
      "Email/Whatsapp support",
      "Connections Strategy",
      "Reporting & analytics",
      "Recruiter messaging",
      "Quarterly LinkedIn Optimization",
    ],
  },
  // 3. Professional Plan
  {
    code: "BRANDING_PROFESSIONAL",
    name: "Professional",
    description: "High-touch leadership advisory & brand authority",
    priceInCents: 44900, // $449/month
    currency: "USD",
    billingInterval: PlanBillingInterval.MONTHLY,
    targetAudience: PlanAudience.BOTH,
    isActive: true,
    stripePriceId: env.STRIPE_PRICE_PROFESSIONAL || null,
    stripeProductId: env.STRIPE_PRODUCT_PROFESSIONAL || null,
    maxActiveJobs: null as number | null,
    maxApplicationsPerMonth: null as number | null,
    aiScreeningEnabled: true,
    featuredJobPlacement: true,
    unmaskedApplicantProfiles: true,
    unlimitedCvTemplates: true,
    customFeatures: [
      "Dedicated consultant",
      "1:1 Brand Strategy",
      "Recruiter Engagement",
      "Brand Updates/Edits",
      "Interview Coaching",
      "Salary Negotiation",
    ],
  },
  // 4. Enterprise Solutions
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

    where.isDeleted = false;

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
   * Find default fallback plan based on user role (dynamically configured by Admin in DB)
   */
  static async getDefaultPlanForRole(_role?: Role) {
    try {
      const dbFreePlan = await prisma.plan.findFirst({
        where: {
          code: "FREE_TIER",
          isDeleted: false,
        },
      });

      if (dbFreePlan) {
        return dbFreePlan;
      }
    } catch {
      // fallback
    }

    return SYSTEM_FREE_PLAN;
  }

  /**
   * Synchronize plan with Stripe (Product and Price).
   * Ensures that Stripe product exists, creates a new immutable Price in Stripe if price/interval changed,
   * archives previous price, and migrates existing active subscriptions.
   */
  private static async syncStripeForPlan(params: {
    planId: string;
    code: string;
    name: string;
    description?: string | null;
    priceInCents: number;
    currency: string;
    billingInterval: PlanBillingInterval;
    existingProductId?: string | null;
    existingPriceId?: string | null;
    updateActiveSubscriptions?: boolean;
  }): Promise<{ stripeProductId: string | null; stripePriceId: string | null }> {
    // 1. Free tier or 0-price does not require a Stripe recurring price
    if (params.priceInCents <= 0) {
      return { stripeProductId: null, stripePriceId: null };
    }

    // 2. Mock mode for testing/dev without Stripe credentials
    if (isMockStripe()) {
      return {
        stripeProductId: params.existingProductId || `prod_mock_${params.code.toLowerCase()}`,
        stripePriceId: params.existingPriceId || `price_mock_${Date.now()}`,
      };
    }

    try {
      // 3. Ensure Stripe Product exists
      let productId = params.existingProductId || null;
      if (productId) {
        try {
          await stripe.products.update(productId, {
            name: params.name,
            description: params.description || undefined,
          });
        } catch (err: any) {
          logger.warn(`Stripe product update warning: ${err.message}`);
        }
      } else {
        // Try searching if product with this code already exists in Stripe
        try {
          const list = await stripe.products.list({ limit: 100 });
          const matched = list.data.find(
            (p) =>
              p.metadata?.code === params.code ||
              p.name.toLowerCase() === params.name.toLowerCase()
          );
          if (matched) {
            productId = matched.id;
          }
        } catch (listErr: any) {
          logger.warn(`Failed searching Stripe products: ${listErr.message}`);
        }

        if (!productId) {
          const createdProduct = await stripe.products.create({
            name: params.name,
            description: params.description || undefined,
            metadata: {
              code: params.code,
              planId: params.planId,
            },
          });
          productId = createdProduct.id;
        }
      }

      // 4. Check if existing price in Stripe already matches the requested price & interval
      const stripeInterval =
        params.billingInterval === PlanBillingInterval.YEARLY ? "year" : "month";
      let priceMatches = false;

      if (params.existingPriceId) {
        try {
          const currentPrice = await stripe.prices.retrieve(params.existingPriceId);
          if (
            currentPrice.active &&
            currentPrice.unit_amount === params.priceInCents &&
            currentPrice.currency.toLowerCase() === params.currency.toLowerCase() &&
            currentPrice.recurring?.interval === stripeInterval
          ) {
            priceMatches = true;
          }
        } catch (retrieveErr: any) {
          logger.warn(`Stripe price retrieve warning: ${retrieveErr.message}`);
          priceMatches = false;
        }
      }

      if (priceMatches && params.existingPriceId) {
        return {
          stripeProductId: productId,
          stripePriceId: params.existingPriceId,
        };
      }

      // 5. Create new immutable Stripe Price
      const newPrice = await stripe.prices.create({
        product: productId!,
        unit_amount: params.priceInCents,
        currency: params.currency.toLowerCase(),
        recurring: {
          interval: stripeInterval,
        },
        metadata: {
          planCode: params.code,
          planId: params.planId,
        },
      });

      logger.info(
        `💳 [Stripe Sync] Created new Price ${newPrice.id} ($${(params.priceInCents / 100).toFixed(2)}) for Product ${productId} (${params.name})`
      );

      // 6. Archive old price in Stripe if different
      if (params.existingPriceId && params.existingPriceId !== newPrice.id) {
        try {
          await stripe.prices.update(params.existingPriceId, { active: false });
          logger.info(`💳 [Stripe Sync] Archived previous Stripe Price ${params.existingPriceId}`);
        } catch (err: any) {
          logger.warn(`Failed to archive old Stripe price ${params.existingPriceId}: ${err.message}`);
        }
      }

      // 7. Migrate active subscriptions if requested or on price updates
      if (params.updateActiveSubscriptions && params.existingPriceId) {
        try {
          const activeSubscriptions = await prisma.subscription.findMany({
            where: {
              planId: params.planId,
              status: "ACTIVE",
              stripeSubscriptionId: { not: null },
            },
          });

          for (const sub of activeSubscriptions) {
            if (
              sub.stripeSubscriptionId &&
              !sub.stripeSubscriptionId.startsWith("sub_mock_") &&
              !sub.stripeSubscriptionId.startsWith("sub_comped_")
            ) {
              try {
                const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
                if (stripeSub && stripeSub.items.data.length > 0) {
                  const itemId = stripeSub.items.data[0].id;
                  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
                    items: [{ id: itemId, price: newPrice.id }],
                    proration_behavior: "none",
                  });
                  logger.info(
                    `🔄 [Stripe Sync] Migrated active subscription ${sub.stripeSubscriptionId} to new price ${newPrice.id}`
                  );
                }
              } catch (subErr: any) {
                logger.warn(
                  `Could not migrate subscription ${sub.stripeSubscriptionId} to new price: ${subErr.message}`
                );
              }
            }
          }
        } catch (subListErr: any) {
          logger.warn(`Failed migrating active subscriptions: ${subListErr.message}`);
        }
      }

      return {
        stripeProductId: productId,
        stripePriceId: newPrice.id,
      };
    } catch (err: any) {
      logger.error(`❌ [Stripe Sync Error] Failed to sync Stripe product/price: ${err.message}`);
      return {
        stripeProductId: params.existingProductId || null,
        stripePriceId: params.existingPriceId || null,
      };
    }
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

    const currency = data.currency || "USD";
    const billingInterval = data.billingInterval || PlanBillingInterval.MONTHLY;

    let stripeProductId = data.stripeProductId || null;
    let stripePriceId = data.stripePriceId || null;

    if (data.priceInCents > 0 && (!stripeProductId || !stripePriceId)) {
      const synced = await this.syncStripeForPlan({
        planId: `temp-${data.code.toLowerCase()}`,
        code: data.code,
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        currency,
        billingInterval,
        existingProductId: stripeProductId,
        existingPriceId: stripePriceId,
      });
      stripeProductId = synced.stripeProductId;
      stripePriceId = synced.stripePriceId;
    }

    return prisma.plan.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description,
        priceInCents: data.priceInCents,
        currency,
        billingInterval,
        targetAudience: data.targetAudience || PlanAudience.EMPLOYER,
        stripePriceId,
        stripeProductId,
        maxActiveJobs: data.maxActiveJobs,
        maxApplicationsPerMonth: data.maxApplicationsPerMonth,
        aiScreeningEnabled: data.aiScreeningEnabled || false,
        featuredJobPlacement: data.featuredJobPlacement || false,
        unmaskedApplicantProfiles: data.unmaskedApplicantProfiles || false,
        unlimitedCvTemplates: data.unlimitedCvTemplates || false,
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

    // Protect Free Tier
    if (existing.code === "FREE_TIER") {
      data.priceInCents = 0;
      data.stripePriceId = undefined;
      data.stripeProductId = undefined;
    } else {
      const effectivePrice =
        data.priceInCents !== undefined ? data.priceInCents : existing.priceInCents;
      const effectiveInterval = data.billingInterval || existing.billingInterval;
      const effectiveCurrency = data.currency || existing.currency || "USD";
      const effectiveName = data.name || existing.name;
      const effectiveDescription =
        data.description !== undefined ? data.description : existing.description;

      const priceOrIntervalChanged =
        (data.priceInCents !== undefined && data.priceInCents !== existing.priceInCents) ||
        (data.billingInterval !== undefined && data.billingInterval !== existing.billingInterval) ||
        (data.currency !== undefined &&
          data.currency.toLowerCase() !== existing.currency.toLowerCase()) ||
        !existing.stripePriceId;

      if (effectivePrice > 0 && priceOrIntervalChanged) {
        const synced = await this.syncStripeForPlan({
          planId: existing.id,
          code: existing.code,
          name: effectiveName,
          description: effectiveDescription,
          priceInCents: effectivePrice,
          currency: effectiveCurrency,
          billingInterval: effectiveInterval,
          existingProductId: existing.stripeProductId,
          existingPriceId: existing.stripePriceId,
          updateActiveSubscriptions: true,
        });

        if (synced.stripeProductId) {
          data.stripeProductId = synced.stripeProductId;
        }
        if (synced.stripePriceId) {
          data.stripePriceId = synced.stripePriceId;
        }
      }
    }

    // Update all plan fields as requested by admin
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
        if (p.code === "FREE_TIER") {
          const exists = await prisma.plan.findUnique({ where: { code: "FREE_TIER" } });
          if (!exists) {
            await prisma.plan.create({ data: p });
          }
          continue;
        }

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
