import { apiClient } from "@/lib/api/api-client";
import { UserRole } from "@/types/api";

export interface AdminMetricsDTO {
  revenue: {
    mrrInCents: number;
    mrrFormatted: string;
    activePaidSubscribers: number;
    totalPlansCount: number;
  };
  users: {
    total: number;
    candidates: number;
    employers: number;
    banned: number;
    deleted: number;
  };
  jobs: {
    total: number;
    published: number;
    draft: number;
    closed: number;
    deleted: number;
  };
  applications: {
    total: number;
  };
  consultations: {
    totalBookings: number;
  };
}

export interface AdminUserItemDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string | null;
  emailVerified: boolean;
  isBanned: boolean;
  banReason?: string | null;
  isVerifiedCompany: boolean;
  isDeleted: boolean;
  deletedAt?: string | null;
  companyName?: string | null;
  companyWebsite?: string | null;
  createdAt: string;
  subscription?: {
    status: string;
    plan?: {
      code: string;
      name: string;
      priceInCents: number;
    };
  } | null;
  _count: {
    cvs: number;
    jobPostings: number;
    applications: number;
    bookings: number;
  };
}

export interface AdminJobItemDTO {
  id: string;
  title: string;
  company: string;
  category: string;
  jobType: string;
  location: string;
  salary: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  employer: {
    id: string;
    name: string;
    email: string;
    companyName?: string | null;
    companyLogoUrl?: string | null;
    isVerifiedCompany: boolean;
  };
  _count: {
    applications: number;
  };
}

export interface AdminAuditLogDTO {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any> | null;
  ipAddress?: string | null;
  createdAt: string;
  admin: {
    id: string;
    name: string;
    email: string;
  };
}

export class AdminService {
  /**
   * Fetch executive platform and revenue metrics
   */
  static async getMetrics(): Promise<AdminMetricsDTO> {
    return apiClient.get<AdminMetricsDTO>("/admin/metrics");
  }

  /**
   * List users with search, role, ban status, and soft-delete filters
   */
  static async listUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isBanned?: boolean | string;
    includeDeleted?: boolean | string;
  }): Promise<{ users: AdminUserItemDTO[]; meta: any }> {
    return apiClient.get<{ users: AdminUserItemDTO[]; meta: any }>("/admin/users", {
      params,
    });
  }

  /**
   * Ban or unban user account
   */
  static async banUser(userId: string, isBanned: boolean, reason?: string) {
    return apiClient.patch(`/admin/users/${userId}/ban`, { isBanned, reason });
  }

  /**
   * Soft delete user
   */
  static async softDeleteUser(userId: string) {
    return apiClient.delete(`/admin/users/${userId}`);
  }

  /**
   * Restore soft-deleted user
   */
  static async restoreUser(userId: string) {
    return apiClient.post(`/admin/users/${userId}/restore`);
  }

  /**
   * Force verify user email
   */
  static async forceVerifyEmail(userId: string) {
    return apiClient.post(`/admin/users/${userId}/verify-email`);
  }

  /**
   * List all job postings for moderation
   */
  static async listJobs(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    employerId?: string;
    includeDeleted?: boolean | string;
  }): Promise<{ jobs: AdminJobItemDTO[]; meta: any }> {
    return apiClient.get<{ jobs: AdminJobItemDTO[]; meta: any }>("/admin/jobs", {
      params,
    });
  }

  /**
   * Force update job status
   */
  static async updateJobStatus(jobId: string, status: string) {
    return apiClient.patch(`/admin/jobs/${jobId}/status`, { status });
  }

  /**
   * Soft delete job posting
   */
  static async softDeleteJob(jobId: string) {
    return apiClient.delete(`/admin/jobs/${jobId}`);
  }

  /**
   * Restore soft-deleted job
   */
  static async restoreJob(jobId: string) {
    return apiClient.post(`/admin/jobs/${jobId}/restore`);
  }

  /**
   * Toggle company verification badge
   */
  static async toggleCompanyVerification(userId: string, isVerifiedCompany: boolean) {
    return apiClient.patch(`/admin/companies/${userId}/verify`, { isVerifiedCompany });
  }

  /**
   * Manually grant / comp a subscription
   */
  static async overrideSubscription(userId: string, planId: string, durationDays = 365) {
    return apiClient.post("/admin/subscriptions/override", {
      userId,
      planId,
      durationDays,
    });
  }

  /**
   * List audit logs
   */
  static async listAuditLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    targetType?: string;
  }): Promise<{ logs: AdminAuditLogDTO[]; meta: any }> {
    return apiClient.get<{ logs: AdminAuditLogDTO[]; meta: any }>("/admin/audit-logs", {
      params,
    });
  }
}

export const adminService = AdminService;
