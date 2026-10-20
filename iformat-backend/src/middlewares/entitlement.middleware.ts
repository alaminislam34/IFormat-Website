import { Request, Response, NextFunction } from "express";
import { Role, JobStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AuthError } from "../errors/index.js";
import { logger } from "../utils/logger.js";
import {
  FREE_TIER_MAX_ACTIVE_JOBS,
  FREE_TIER_MONTHLY_AI_LIMIT,
  FREE_TIER_MONTHLY_APPLICATIONS_LIMIT,
  FREE_TIER_MONTHLY_JOB_ANALYSIS_LIMIT,
  readJobAnalysisLimit,
  applyLimitOverride,
  getCurrentBillingCycleUtc,
  getUserLimitOverrides,
  getEntitledSubscription,
  getFreeTierPlan,
  readAiLimit,
} from "../utils/entitlement.js";

/**
 * Middleware: Enforces subscription entitlements & monthly quota on Candidate AI tools.
 * Quota is checked up front but only consumed once the request succeeds.
 */
export const requireAiEntitlement = (actionType: string = "AI_GENERATION") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AuthError("Authentication required to use AI features"));
      }

      const userId = req.user.id;
      // Job analyzer has its own limit & counter, separate from other AI tools
      const isJobAnalysis = actionType === "JOB_ANALYSIS";
      const limitKey = isJobAnalysis ? "maxJobAnalyses" : "maxAiGenerations";
      const usageField = isJobAnalysis ? "jobAnalysesCount" : "aiGenerationsCount";
      const limitLabel = isJobAnalysis ? "monthly job analyses" : "monthly AI generations";

      // 1. Admin Bypass: Unlimited AI access
      if (req.user.role === Role.ADMIN) {
        return next();
      }

      // 2. Resolve the monthly cap from the user's plan (or the free tier plan)
      const subscription = await getEntitledSubscription(userId);
      let maxAiLimit: number | null;

      if (subscription) {
        // Paid plans are unlimited unless the admin set an explicit number
        maxAiLimit = isJobAnalysis
          ? readJobAnalysisLimit(subscription.plan.customFeatures, null)
          : readAiLimit(subscription.plan.customFeatures, null);
      } else {
        const freePlan = await getFreeTierPlan();
        maxAiLimit = isJobAnalysis
          ? readJobAnalysisLimit(freePlan?.customFeatures, FREE_TIER_MONTHLY_JOB_ANALYSIS_LIMIT)
          : readAiLimit(freePlan?.customFeatures, FREE_TIER_MONTHLY_AI_LIMIT);
      }

      // Admin per-user override wins over the plan
      maxAiLimit = applyLimitOverride(await getUserLimitOverrides(userId), limitKey, maxAiLimit);

      if (maxAiLimit === null) {
        return next();
      }

      // 3. Usage check (read-only)
      const { periodStart, periodEnd } = getCurrentBillingCycleUtc();
      const usage = await prisma.subscriptionUsage.findUnique({
        where: { userId_periodStart_periodEnd: { userId, periodStart, periodEnd } },
      });
      const used = usage?.[usageField] ?? 0;

      if (used >= maxAiLimit) {
        logger.warn(
          `🚫 [Entitlement] User ${req.user.email} (${userId}) exceeded ${limitLabel} quota (${used}/${maxAiLimit}) on ${actionType}`
        );

        return res.status(403).json({
          success: false,
          error: {
            code: "SUBSCRIPTION_REQUIRED",
            message: `You have reached your limit of ${maxAiLimit} ${limitLabel}. Please upgrade your membership for higher or unlimited usage.`,
            upgradeUrl: "/dashboard/billing",
            currentUsage: used,
            maxQuota: maxAiLimit,
            periodEnd,
          },
        });
      }

      // 4. Consume quota only if the AI call actually succeeded
      res.once("finish", () => {
        if (res.statusCode >= 400) return;
        prisma.subscriptionUsage
          .upsert({
            where: { userId_periodStart_periodEnd: { userId, periodStart, periodEnd } },
            create: { userId, periodStart, periodEnd, [usageField]: 1 },
            update: { [usageField]: { increment: 1 } },
          })
          .then(() =>
            logger.info(
              `🤖 [Entitlement] AI tool ${actionType} used by ${req.user?.email}. Usage: ${used + 1}/${maxAiLimit}`
            )
          )
          .catch((err) => logger.error(`Failed to record AI usage for ${userId}: ${err.message}`));
      });

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
    const activeSubscription = await getEntitledSubscription(req.user.id);

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

    const activeSubscription = await getEntitledSubscription(req.user.id);

    // Paid plan: null means unlimited. No plan: use the admin-editable free tier row.
    let maxAllowed: number | null;
    if (activeSubscription) {
      maxAllowed = activeSubscription.plan.maxActiveJobs;
    } else {
      const freePlan = await getFreeTierPlan();
      maxAllowed = freePlan?.maxActiveJobs ?? FREE_TIER_MAX_ACTIVE_JOBS;
    }

    maxAllowed = applyLimitOverride(
      await getUserLimitOverrides(req.user.id),
      "maxActiveJobs",
      maxAllowed
    );

    if (maxAllowed === null) {
      return next();
    }

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

    const activeSubscription = await getEntitledSubscription(req.user.id);

    // Paid plan: null means unlimited. No plan: use the admin-editable free tier row.
    let maxAllowed: number | null;
    if (activeSubscription) {
      maxAllowed = activeSubscription.plan.maxApplicationsPerMonth;
    } else {
      const freePlan = await getFreeTierPlan();
      maxAllowed = freePlan?.maxApplicationsPerMonth ?? FREE_TIER_MONTHLY_APPLICATIONS_LIMIT;
    }

    maxAllowed = applyLimitOverride(
      await getUserLimitOverrides(req.user.id),
      "maxApplicationsPerMonth",
      maxAllowed
    );

    if (maxAllowed === null) {
      return next();
    }

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
