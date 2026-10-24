import {
  LIMIT_OVERRIDE_KEYS,
  LimitOverrideKey,
  FREE_TIER_MONTHLY_AI_LIMIT,
  FREE_TIER_MONTHLY_JOB_ANALYSIS_LIMIT,
  FREE_TIER_MAX_ACTIVE_JOBS,
  FREE_TIER_MONTHLY_APPLICATIONS_LIMIT,
  applyLimitOverride,
  getCurrentBillingCycleUtc,
  getFreeTierPlan,
  readAiLimit,
  readJobAnalysisLimit,
  resetMonthlyAiUsage,
} from "../../utils/entitlement.js";
import { isSuperAdminEmail, superAdminUserConditions } from "../../config/super-admin.js";
import { prisma } from "../../lib/prisma.js";
import { Role, JobStatus, SubscriptionStatus, AuditAction, Prisma } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../errors/index.js";
import { getPagination, createPaginationMeta } from "../../utils/pagination.js";


export class AdminService {
  /**
   * Super admins are invisible and untouchable to other admins: respond as if
   * the account does not exist.
   */
  private static assertNotSuperAdmin(user: { id: string; email: string }) {
    if (isSuperAdminEmail(user.email)) {
      throw new NotFoundError("User", user.id);
    }
  }

  /**
   * Executive Command Center Platform & Monetization Metrics
   */
  static async getPlatformMetrics() {
    const [
      totalUsers,
      totalCandidates,
      totalEmployers,
      bannedUsers,
      deletedUsers,
      totalJobs,
      publishedJobs,
      draftJobs,
      closedJobs,
      deletedJobs,
      totalApplications,
      totalBookings,
      activeSubscriptions,
      plans,
    ] = await Promise.all([
      prisma.user.count({
        where: {
          isDeleted: false,
          NOT: superAdminUserConditions(),
        },
      }),
      prisma.user.count({ where: { role: Role.CANDIDATE, isDeleted: false } }),
      prisma.user.count({ where: { role: Role.EMPLOYER, isDeleted: false } }),
      prisma.user.count({
        where: {
          isBanned: true,
          NOT: superAdminUserConditions(),
        },
      }),
      prisma.user.count({
        where: {
          isDeleted: true,
          NOT: superAdminUserConditions(),
        },
      }),
      prisma.jobPosting.count({ where: { isDeleted: false, employer: { NOT: superAdminUserConditions() } } }),
      prisma.jobPosting.count({ where: { status: JobStatus.PUBLISHED, isDeleted: false, employer: { NOT: superAdminUserConditions() } } }),
      prisma.jobPosting.count({ where: { status: JobStatus.DRAFT, isDeleted: false, employer: { NOT: superAdminUserConditions() } } }),
      prisma.jobPosting.count({ where: { status: JobStatus.CLOSED, isDeleted: false, employer: { NOT: superAdminUserConditions() } } }),
      prisma.jobPosting.count({ where: { isDeleted: true, employer: { NOT: superAdminUserConditions() } } }),
      prisma.application.count({ where: { isDeleted: false, candidate: { NOT: superAdminUserConditions() } } }),
      prisma.booking.count({ where: { isDeleted: false, user: { NOT: superAdminUserConditions() } } }),
      prisma.subscription.findMany({
        where: { status: SubscriptionStatus.ACTIVE, user: { NOT: superAdminUserConditions() } },
        include: { plan: true },
      }),
      prisma.plan.findMany({ where: { isDeleted: false, isActive: true } }),
    ]);

    // Calculate approximate MRR (Monthly Recurring Revenue) in USD
    const mrrInCents = activeSubscriptions.reduce((acc, sub) => {
      if (!sub.plan) return acc;
      const amount = sub.plan.priceInCents;
      return sub.plan.billingInterval === "YEARLY" ? acc + Math.round(amount / 12) : acc + amount;
    }, 0);

    return {
      revenue: {
        mrrInCents,
        mrrFormatted: `$${(mrrInCents / 100).toLocaleString()}`,
        activePaidSubscribers: activeSubscriptions.length,
        totalPlansCount: plans.length,
      },
      users: {
        total: totalUsers,
        candidates: totalCandidates,
        employers: totalEmployers,
        banned: bannedUsers,
        deleted: deletedUsers,
      },
      jobs: {
        total: totalJobs,
        published: publishedJobs,
        draft: draftJobs,
        closed: closedJobs,
        deleted: deletedJobs,
      },
      applications: {
        total: totalApplications,
      },
      consultations: {
        totalBookings,
      },
    };
  }

  /**
   * Log administrative action to immutable AuditLog table
   */
  static async logAction(
    adminId: string,
    action: AuditAction,
    targetType: string,
    targetId: string,
    details?: any,
    ipAddress?: string
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          adminId,
          action,
          targetType,
          targetId,
          details: details ? details : undefined,
          ipAddress: ipAddress || null,
        },
      });
    } catch (err: any) {
      console.warn(`[AuditLog Error]: Failed to write audit log: ${err.message}`);
    }
  }

  /**
   * User Management: List users with filters, search, and soft delete inclusion
   */
  static async listUsers(
    query: {
      page?: number | string;
      limit?: number | string;
      search?: string;
      role?: Role;
      isBanned?: boolean | string;
      isVerifiedCompany?: boolean | string;
      includeDeleted?: boolean | string;
    } = {}
  ) {
    const { page, limit, skip } = getPagination(query);

    const where: any = {
      NOT: superAdminUserConditions(),
    };

    if (query.includeDeleted !== "true" && query.includeDeleted !== true) {
      where.isDeleted = false;
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.isBanned !== undefined) {
      where.isBanned = query.isBanned === "true" || query.isBanned === true;
    }

    if (query.isVerifiedCompany !== undefined) {
      where.isVerifiedCompany = query.isVerifiedCompany === "true" || query.isVerifiedCompany === true;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
        { phone: { contains: query.search, mode: "insensitive" } },
        { companyName: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          avatarUrl: true,
          emailVerified: true,
          isBanned: true,
          banReason: true,
          isVerifiedCompany: true,
          isDeleted: true,
          deletedAt: true,
          companyName: true,
          companyWebsite: true,
          companyLogoUrl: true,
          companyVideoUrl: true,
          companyDescription: true,
          limitOverrides: true,
          createdAt: true,
          subscription: {
            include: { plan: true },
          },
          _count: {
            select: {
              cvs: true,
              jobPostings: true,
              applications: true,
              bookings: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const usersWithLimits = await this.attachEffectiveLimits(users);

    const meta = createPaginationMeta(total, page, limit);
    return { users: usersWithLimits, meta };
  }

  /**
   * Adds `limits` to each user: the effective cap (plan or free tier, then the
   * admin override; null = unlimited) next to current-period usage. Mirrors the
   * checks in entitlement.middleware.
   */
  private static async attachEffectiveLimits<
    T extends {
      id: string;
      role: Role;
      limitOverrides: Prisma.JsonValue;
      subscription: {
        status: SubscriptionStatus;
        currentPeriodEnd: Date | null;
        plan: { maxActiveJobs: number | null; maxApplicationsPerMonth: number | null; customFeatures: Prisma.JsonValue };
      } | null;
    },
  >(users: T[]) {
    if (users.length === 0) return [];

    const ids = users.map((u) => u.id);
    const { periodStart, periodEnd } = getCurrentBillingCycleUtc();

    const [freePlan, usageRows, jobCounts, appCounts] = await Promise.all([
      getFreeTierPlan(),
      prisma.subscriptionUsage.findMany({
        where: { userId: { in: ids }, periodStart, periodEnd },
        select: { userId: true, aiGenerationsCount: true, jobAnalysesCount: true },
      }),
      prisma.jobPosting.groupBy({
        by: ["employerId"],
        where: { employerId: { in: ids }, status: JobStatus.PUBLISHED, isDeleted: false },
        _count: { _all: true },
      }),
      prisma.application.groupBy({
        by: ["candidateId"],
        where: { candidateId: { in: ids }, createdAt: { gte: periodStart, lte: periodEnd } },
        _count: { _all: true },
      }),
    ]);

    const usageByUser = new Map(usageRows.map((r) => [r.userId, r]));
    const jobsByUser = new Map(jobCounts.map((r) => [r.employerId, r._count._all]));
    const appsByUser = new Map(appCounts.map((r) => [r.candidateId, r._count._all]));
    const now = new Date();

    return users.map((u) => {
      const sub = u.subscription;
      const entitled =
        sub &&
        (sub.status === SubscriptionStatus.ACTIVE || sub.status === SubscriptionStatus.TRIALING) &&
        (!sub.currentPeriodEnd || sub.currentPeriodEnd > now);
      const plan = entitled ? sub.plan : null;

      const base: Record<LimitOverrideKey, number | null> = plan
        ? {
            maxAiGenerations: readAiLimit(plan.customFeatures, null),
            maxJobAnalyses: readJobAnalysisLimit(plan.customFeatures, null),
            maxActiveJobs: plan.maxActiveJobs,
            maxApplicationsPerMonth: plan.maxApplicationsPerMonth,
          }
        : {
            maxAiGenerations: readAiLimit(freePlan?.customFeatures, FREE_TIER_MONTHLY_AI_LIMIT),
            maxJobAnalyses: readJobAnalysisLimit(freePlan?.customFeatures, FREE_TIER_MONTHLY_JOB_ANALYSIS_LIMIT),
            maxActiveJobs: freePlan?.maxActiveJobs ?? FREE_TIER_MAX_ACTIVE_JOBS,
            maxApplicationsPerMonth: freePlan?.maxApplicationsPerMonth ?? FREE_TIER_MONTHLY_APPLICATIONS_LIMIT,
          };

      const usage = usageByUser.get(u.id);
      const used: Record<LimitOverrideKey, number> = {
        maxAiGenerations: usage?.aiGenerationsCount ?? 0,
        maxJobAnalyses: usage?.jobAnalysesCount ?? 0,
        maxActiveJobs: jobsByUser.get(u.id) ?? 0,
        maxApplicationsPerMonth: appsByUser.get(u.id) ?? 0,
      };

      const limits = {} as Record<LimitOverrideKey, { limit: number | null; used: number; isOverridden: boolean }>;
      for (const key of LIMIT_OVERRIDE_KEYS) {
        const overrides = u.limitOverrides;
        const isOverridden =
          !!overrides &&
          typeof overrides === "object" &&
          !Array.isArray(overrides) &&
          (overrides as Record<string, unknown>)[key] !== undefined;
        limits[key] = { limit: applyLimitOverride(overrides, key, base[key]), used: used[key], isOverridden };
      }
      return { ...u, limits };
    });
  }

  /**
   * User Management: Ban or Unban account (Invalidates active sessions)
   */
  static async banUser(
    adminId: string,
    userId: string,
    isBanned: boolean,
    banReason?: string,
    ipAddress?: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User", userId);
    this.assertNotSuperAdmin(user);

    if (user.role === Role.ADMIN) {
      throw new ValidationError("Cannot ban a fellow Admin account");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        isBanned,
        banReason: isBanned ? banReason || "Administrative suspension" : null,
        tokenVersion: { increment: 1 }, // Revokes all active JWT sessions
      },
    });

    await this.logAction(
      adminId,
      isBanned ? AuditAction.USER_BANNED : AuditAction.USER_UNBANNED,
      "USER",
      userId,
      { banReason: isBanned ? banReason : null },
      ipAddress
    );

    return updated;
  }

  /**
   * User Management: Soft Delete user
   */
  static async softDeleteUser(adminId: string, userId: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User", userId);
    this.assertNotSuperAdmin(user);

    if (user.role === Role.ADMIN) {
      throw new ValidationError("Cannot delete an Admin account");
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        tokenVersion: { increment: 1 },
      },
    });

    // If an employer is soft-deleted, hide all their job postings as well
    if (user.role === Role.EMPLOYER) {
      await prisma.jobPosting.updateMany({
        where: { employerId: userId, isDeleted: false },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });
    }

    await this.logAction(
      adminId,
      AuditAction.USER_SOFT_DELETED,
      "USER",
      userId,
      { email: user.email },
      ipAddress
    );

    return updated;
  }

  /**
   * User Management: Restore soft-deleted user
   */
  static async restoreUser(adminId: string, userId: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User", userId);
    this.assertNotSuperAdmin(user);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    await this.logAction(
      adminId,
      AuditAction.USER_RESTORED,
      "USER",
      userId,
      { email: user.email },
      ipAddress
    );

    return updated;
  }

  static async listJobs(
    query: {
      page?: number | string;
      limit?: number | string;
      search?: string;
      status?: JobStatus;
      employerId?: string;
      includeDeleted?: boolean | string;
    } = {}
  ) {
    const { page, limit, skip } = getPagination(query);

    const where: any = { employer: { NOT: superAdminUserConditions() } };

    if (query.includeDeleted !== "true" && query.includeDeleted !== true) {
      where.isDeleted = false;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.employerId) {
      where.employerId = query.employerId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: "insensitive" } },
        { company: { contains: query.search, mode: "insensitive" } },
        { category: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const [jobs, total] = await Promise.all([
      prisma.jobPosting.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          employer: {
            select: {
              id: true,
              name: true,
              email: true,
              companyName: true,
              companyLogoUrl: true,
              isVerifiedCompany: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
      }),
      prisma.jobPosting.count({ where }),
    ]);

    const meta = createPaginationMeta(total, page, limit);
    return { jobs, meta };
  }

  /**
   * Job Moderation: Force update job status or toggle featured status
   */
  static async updateJobStatus(
    adminId: string,
    jobId: string,
    status: JobStatus,
    ipAddress?: string
  ) {
    const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError("Job", jobId);

    const updated = await prisma.jobPosting.update({
      where: { id: jobId },
      data: { status },
    });

    await this.logAction(
      adminId,
      AuditAction.JOB_STATUS_CHANGED,
      "JOB",
      jobId,
      { previousStatus: job.status, newStatus: status },
      ipAddress
    );

    return updated;
  }

  /**
   * Job Moderation: Soft delete job
   */
  static async softDeleteJob(adminId: string, jobId: string, ipAddress?: string) {
    const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError("Job", jobId);

    const updated = await prisma.jobPosting.update({
      where: { id: jobId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await this.logAction(
      adminId,
      AuditAction.JOB_SOFT_DELETED,
      "JOB",
      jobId,
      { title: job.title },
      ipAddress
    );

    return updated;
  }

  /**
   * Job Moderation: Restore soft-deleted job
   */
  static async restoreJob(adminId: string, jobId: string, ipAddress?: string) {
    const job = await prisma.jobPosting.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundError("Job", jobId);

    const updated = await prisma.jobPosting.update({
      where: { id: jobId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    await this.logAction(
      adminId,
      AuditAction.JOB_RESTORED,
      "JOB",
      jobId,
      { title: job.title },
      ipAddress
    );

    return updated;
  }

  /**
   * Company Management: Toggle verified company trust badge
   */
  static async toggleCompanyVerification(
    adminId: string,
    userId: string,
    isVerifiedCompany: boolean,
    ipAddress?: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User", userId);
    this.assertNotSuperAdmin(user);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { isVerifiedCompany },
    });

    await this.logAction(
      adminId,
      isVerifiedCompany ? AuditAction.COMPANY_VERIFIED : AuditAction.COMPANY_UNVERIFIED,
      "COMPANY",
      userId,
      { companyName: user.companyName, isVerifiedCompany },
      ipAddress
    );

    // Dispatch real-time in-app notification to the employer
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: "SYSTEM",
          title: isVerifiedCompany
            ? "🎉 Verified Company Badge Granted!"
            : "Company Verification Status Updated",
          message: isVerifiedCompany
            ? `Your organization (${user.companyName || user.name}) is now an official Verified Hiring Partner. The verified badge is displayed on your job listings and company page.`
            : `The verification trust badge for (${user.companyName || user.name}) has been revoked.`,
          payload: { actionUrl: "/dashboard" },
        },
      });
    } catch (notifErr: any) {
      console.warn("Could not dispatch verification notification to employer:", notifErr.message);
    }

    return updated;
  }

  /**
   * Update Company Logo for an Employer
   */
  static async updateCompanyLogo(
    adminId: string,
    userId: string,
    companyLogoUrl: string,
    ipAddress?: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User", userId);
    this.assertNotSuperAdmin(user);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { companyLogoUrl },
    });

    await this.logAction(
      adminId,
      AuditAction.SETTINGS_UPDATED,
      "COMPANY",
      userId,
      { companyName: user.companyName, companyLogoUrl },
      ipAddress
    );

    return updated;
  }

  /**
   * Subscription Management: Manually grant/comp a subscription to user
   */
  static async overrideSubscription(
    adminId: string,
    userId: string,
    planId: string,
    durationDays = 365,
    ipAddress?: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User", userId);
    this.assertNotSuperAdmin(user);

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundError("Plan", planId);

    const currentPeriodStart = new Date();
    const currentPeriodEnd = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);

    const subscription = await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        stripeCustomerId: `cus_comped_${userId}`,
        stripeSubscriptionId: `sub_comped_${Date.now()}`,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
      },
      update: {
        planId: plan.id,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart,
        currentPeriodEnd,
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
      include: { plan: true },
    });

    // Let the new plan's limits apply immediately instead of inheriting old usage
    await resetMonthlyAiUsage(userId);

    await this.logAction(
      adminId,
      AuditAction.SUBSCRIPTION_MANUALLY_ASSIGNED,
      "SUBSCRIPTION",
      userId,
      { planCode: plan.code, durationDays },
      ipAddress
    );

    return subscription;
  }

  /**
   * Per-user limit overrides. Each key: number = cap, null = unlimited, omitted = plan default.
   */
  static async setUserLimitOverrides(
    adminId: string,
    userId: string,
    overrides: Record<string, unknown>,
    ipAddress?: string
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User", userId);
    this.assertNotSuperAdmin(user);

    const clean: Record<string, number | null> = {};
    for (const key of LIMIT_OVERRIDE_KEYS) {
      const value = overrides?.[key];
      if (value === null) clean[key] = null;
      else if (typeof value === "number" && Number.isInteger(value) && value >= 0) clean[key] = value;
      else if (value !== undefined) throw new ValidationError(`${key} must be a non-negative integer or null`);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { limitOverrides: Object.keys(clean).length ? clean : Prisma.DbNull },
      select: { id: true, limitOverrides: true },
    });

    await this.logAction(
      adminId,
      AuditAction.USER_LIMITS_UPDATED,
      "USER",
      userId,
      { limitOverrides: clean },
      ipAddress
    );

    return updated;
  }

  /**
   * Audit Logs: Query immutable activity logs
   */
  static async listAuditLogs(
    query: {
      page?: number | string;
      limit?: number | string;
      action?: AuditAction;
      targetType?: string;
      adminId?: string;
    } = {}
  ) {
    const { page, limit, skip } = getPagination(query);

    // Hide every audit entry performed by, or targeting, a super admin
    const superAdmins = await prisma.user.findMany({
      where: { OR: superAdminUserConditions() },
      select: { id: true },
    });
    const superAdminIds = superAdmins.map((u) => u.id);

    const notConditions: any[] = [{ admin: { OR: superAdminUserConditions() } }];

    if (superAdminIds.length > 0) {
      notConditions.push({ targetId: { in: superAdminIds } });
    }

    const where: any = {
      NOT: notConditions,
    };

    if (query.action) where.action = query.action;
    if (query.targetType) where.targetType = query.targetType;
    if (query.adminId) where.adminId = query.adminId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const meta = createPaginationMeta(total, page, limit);
    return { logs, meta };
  }
}
