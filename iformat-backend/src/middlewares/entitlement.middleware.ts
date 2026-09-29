import { Request, Response, NextFunction } from "express";
import { Role, SubscriptionStatus, JobStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ForbiddenError, AuthError } from "../errors/index.js";
import { logger } from "../utils/logger.js";

const FREE_TIER_MONTHLY_AI_LIMIT = 5;
const FREE_TIER_MAX_ACTIVE_JOBS = 1;
const FREE_TIER_MONTHLY_APPLICATIONS_LIMIT = 10;

/**
 * Get current UTC month start and end timestamps
 */
function getCurrentBillingCycleUtc() {
  const now = new Date();
  const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
  const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
  return { periodStart, periodEnd };
}

/**
 * Middleware: Enforces subscription entitlements & monthly quota on Candidate AI tools
 */
export const requireAiEntitlement = (actionType: string = "AI_GENERATION") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AuthError("Authentication required to use AI features"));
      }

      const userId = req.user.id;

      // 1. Admin Bypass: Unlimited AI access
      if (req.user.role === Role.ADMIN) {
        return next();
      }

      // 2. Check Active Subscription
      const activeSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          status: SubscriptionStatus.ACTIVE,
        },
        include: {
          plan: true,
        },
      });

      let maxAiLimit: number | null = null;

      if (activeSubscription) {
        const customFeat = activeSubscription.plan.customFeatures as any;
        if (customFeat && typeof customFeat.maxAiGenerations === "number") {
          maxAiLimit = customFeat.maxAiGenerations;
        } else if (customFeat && customFeat.maxAiGenerations === null) {
          maxAiLimit = null; // explicitly unlimited
        } else {
          // Default paid subscriber has full unlimited entitlement
          return next();
        }
      } else {
        // Free tier: check if admin customized quota on FREE_TIER plan in DB
        const freePlan = await prisma.plan.findUnique({
          where: { code: "FREE_TIER" },
        });
        const customFeat = freePlan?.customFeatures as any;
        if (customFeat && typeof customFeat.maxAiGenerations === "number") {
          maxAiLimit = customFeat.maxAiGenerations;
        } else {
          maxAiLimit = FREE_TIER_MONTHLY_AI_LIMIT;
        }
      }

      if (maxAiLimit === null) {
        return next();
      }

      // 3. Usage Check & Increment
      const { periodStart, periodEnd } = getCurrentBillingCycleUtc();

      // Find or create monthly cycle record
      let usage = await prisma.subscriptionUsage.findUnique({
        where: {
          userId_periodStart_periodEnd: {
            userId,
            periodStart,
            periodEnd,
          },
        },
      });

      if (!usage) {
        usage = await prisma.subscriptionUsage.create({
          data: {
            userId,
            periodStart,
            periodEnd,
            aiGenerationsCount: 0,
          },
        });
      }

      // Check quota limit
      if (usage.aiGenerationsCount >= maxAiLimit) {
        logger.warn(
          `🚫 [Entitlement] User ${req.user.email} (${userId}) exceeded AI monthly quota (${usage.aiGenerationsCount}/${maxAiLimit}) on ${actionType}`
        );

        return res.status(403).json({
          success: false,
          error: {
            code: "SUBSCRIPTION_REQUIRED",
            message: `You have reached your limit of ${maxAiLimit} monthly AI generations. Please upgrade your membership for higher or unlimited generations.`,
            upgradeUrl: "/dashboard/billing",
            currentUsage: usage.aiGenerationsCount,
            maxQuota: maxAiLimit,
            periodEnd,
          },
        });
      }

      // Atomically increment quota
      await prisma.subscriptionUsage.update({
        where: { id: usage.id },
        data: {
          aiGenerationsCount: { increment: 1 },
        },
      });

      logger.info(
        `🤖 [Entitlement] AI tool ${actionType} granted to ${req.user.email}. Usage: ${usage.aiGenerationsCount + 1}/${maxAiLimit}`
      );

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

/**
 * Middleware: Enforces Employer AI Screening plan capability
 */
export const requireEmployerAiScreeningEntitlement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AuthError("Authentication required for AI applicant screening"));
    }

    // 1. Admin Bypass
    if (req.user.role === Role.ADMIN) {
      return next();
    }

    // 2. Check Employer active plan with aiScreeningEnabled
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.id,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        plan: true,
      },
    });

    if (activeSubscription && activeSubscription.plan.aiScreeningEnabled) {
      return next();
    }

    logger.warn(
      `🚫 [Entitlement] Employer ${req.user.email} attempted AI screening without enabled plan.`
    );

    return res.status(403).json({
      success: false,
      error: {
        code: "SUBSCRIPTION_REQUIRED",
        message: "AI Applicant Screening is an Employer Pro feature. Please upgrade your plan to unlock automated candidate match scoring and insights.",
        upgradeUrl: "/dashboard/billing",
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const requireAiScreeningAccess = requireEmployerAiScreeningEntitlement;

/**
 * Middleware: Enforces Employer active job posting quota
 */
export const requireJobPostingQuota = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AuthError("Authentication required to post jobs"));
    }

    if (req.user.role === Role.ADMIN) {
      return next();
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.id,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        plan: true,
      },
    });

    const maxAllowed = activeSubscription?.plan?.maxActiveJobs ?? FREE_TIER_MAX_ACTIVE_JOBS;

    const currentActiveJobs = await prisma.jobPosting.count({
      where: {
        employerId: req.user.id,
        status: JobStatus.PUBLISHED,
        isDeleted: false,
      },
    });

    if (currentActiveJobs >= maxAllowed) {
      return res.status(403).json({
        success: false,
        error: {
          code: "SUBSCRIPTION_REQUIRED",
          message: `You have reached your limit of ${maxAllowed} active job posting(s). Please upgrade to post more jobs simultaneously.`,
          upgradeUrl: "/dashboard/billing",
          currentActiveJobs,
          maxAllowed,
        },
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Middleware: Enforces Candidate monthly job application quota
 */
export const requireApplicationQuota = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AuthError("Authentication required to apply for jobs"));
    }

    if (req.user.role === Role.ADMIN) {
      return next();
    }

    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: req.user.id,
        status: SubscriptionStatus.ACTIVE,
      },
      include: {
        plan: true,
      },
    });

    const maxAllowed = activeSubscription?.plan?.maxApplicationsPerMonth ?? FREE_TIER_MONTHLY_APPLICATIONS_LIMIT;

    const { periodStart, periodEnd } = getCurrentBillingCycleUtc();

    const currentApplications = await prisma.application.count({
      where: {
        candidateId: req.user.id,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    if (currentApplications >= maxAllowed) {
      return res.status(403).json({
        success: false,
        error: {
          code: "SUBSCRIPTION_REQUIRED",
          message: `You have reached your monthly job application limit of ${maxAllowed}. Please upgrade to a Pro plan for unlimited applications.`,
          upgradeUrl: "/dashboard/billing",
          currentApplications,
          maxAllowed,
        },
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
