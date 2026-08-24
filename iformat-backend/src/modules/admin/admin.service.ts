import { prisma } from "../../lib/prisma.js";
import { Role, JobStatus, SubscriptionStatus, AuditAction } from "@prisma/client";
import { NotFoundError, ValidationError } from "../../errors/index.js";
import { getPagination, createPaginationMeta } from "../../utils/pagination.js";

export class AdminService {
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
      prisma.user.count({ where: { isDeleted: false } }),
      prisma.user.count({ where: { role: Role.CANDIDATE, isDeleted: false } }),
      prisma.user.count({ where: { role: Role.EMPLOYER, isDeleted: false } }),
      prisma.user.count({ where: { isBanned: true } }),
      prisma.user.count({ where: { isDeleted: true } }),
      prisma.jobPosting.count({ where: { isDeleted: false } }),
      prisma.jobPosting.count({ where: { status: JobStatus.PUBLISHED, isDeleted: false } }),
      prisma.jobPosting.count({ where: { status: JobStatus.DRAFT, isDeleted: false } }),
      prisma.jobPosting.count({ where: { status: JobStatus.CLOSED, isDeleted: false } }),
      prisma.jobPosting.count({ where: { isDeleted: true } }),
      prisma.application.count({ where: { isDeleted: false } }),
      prisma.booking.count({ where: { isDeleted: false } }),
      prisma.subscription.findMany({
        where: { status: SubscriptionStatus.ACTIVE },
        include: { plan: true },
      }),
      prisma.plan.findMany({ where: { isDeleted: false } }),
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
      includeDeleted?: boolean | string;
    } = {}
  ) {
    const { page, limit, skip } = getPagination(query);

    const where: any = {};

    if (query.includeDeleted !== "true" && query.includeDeleted !== true) {
      where.isDeleted = false;
    }

    if (query.role) {
      where.role = query.role;
    }

    if (query.isBanned !== undefined) {
      where.isBanned = query.isBanned === "true" || query.isBanned === true;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { email: { contains: query.search, mode: "insensitive" } },
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

    const meta = createPaginationMeta(total, page, limit);
    return { users, meta };
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

  /**
   * User Management: Force verify user email address
   */
  static async forceVerifyEmail(adminId: string, userId: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User", userId);

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    await this.logAction(
      adminId,
      AuditAction.USER_EMAIL_VERIFIED,
      "USER",
      userId,
      { email: user.email },
      ipAddress
    );

    return updated;
  }

  /**
   * Job Moderation: List all jobs with admin filters
   */
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

    const where: any = {};

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

    const where: any = {};

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
