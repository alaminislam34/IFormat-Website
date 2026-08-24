import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { ForbiddenError, AuthError } from "../errors/index.js";
import { PaymentService } from "../modules/payment/payment.service.js";

export type EntitlementFeature =
  | "CREATE_JOB"
  | "SUBMIT_APPLICATION"
  | "AI_SCREENING"
  | "FEATURED_JOB"
  | "UNMASKED_PROFILES";

/**
 * Middleware factory to enforce plan-derived feature entitlements & limits
 */
export const requireEntitlement = (feature: EntitlementFeature) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AuthError("Authentication required"));
      }

      // 1. Admin Override: Admin role bypasses all subscription plan restrictions
      if (req.user.role === Role.ADMIN) {
        return next();
      }

      // 2. Fetch user's subscription and effective plan limits
      const subDetails = await PaymentService.getUserSubscriptionDetails(req.user.id);
      const limits = subDetails.effectiveLimits;

      // 3. Feature-specific entitlement checks
      switch (feature) {
        case "CREATE_JOB": {
          if (limits.maxActiveJobs !== null) {
            // Count currently active (PUBLISHED or DRAFT) non-deleted jobs owned by employer
            const activeJobsCount = await prisma.jobPosting.count({
              where: {
                employerId: req.user.id,
                isDeleted: false,
                status: { in: ["PUBLISHED", "DRAFT"] },
              },
            });

            if (activeJobsCount >= limits.maxActiveJobs) {
              return next(
                new ForbiddenError(
                  `You have reached your limit of ${limits.maxActiveJobs} active job posting(s) on your current plan (${subDetails.plan.name}). Please upgrade your plan to post more jobs.`
                )
              );
            }
          }
          break;
        }

        case "SUBMIT_APPLICATION": {
          if (limits.maxApplicationsPerMonth !== null) {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

            const monthlyAppsCount = await prisma.application.count({
              where: {
                candidateId: req.user.id,
                createdAt: { gte: startOfMonth },
              },
            });

            if (monthlyAppsCount >= limits.maxApplicationsPerMonth) {
              return next(
                new ForbiddenError(
                  `You have reached your monthly limit of ${limits.maxApplicationsPerMonth} application(s) on your current plan. Upgrade to Candidate Pro for unlimited applications.`
                )
              );
            }
          }
          break;
        }

        case "AI_SCREENING": {
          if (!limits.aiScreeningEnabled) {
            return next(
              new ForbiddenError(
                `AI Resume Screening is not available on your current plan (${subDetails.plan.name}). Please upgrade to Employer Starter, Pro, or Enterprise.`
              )
            );
          }
          break;
        }

        case "FEATURED_JOB": {
          if (!limits.featuredJobPlacement) {
            return next(
              new ForbiddenError(
                `Featured job placement requires an Employer Pro or Enterprise plan.`
              )
            );
          }
          break;
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Convenient exports
export const requireJobPostingQuota = requireEntitlement("CREATE_JOB");
export const requireApplicationQuota = requireEntitlement("SUBMIT_APPLICATION");
export const requireAiScreeningAccess = requireEntitlement("AI_SCREENING");
