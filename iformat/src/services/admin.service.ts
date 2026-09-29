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
  companyLogoUrl?: string | null;
  companyVideoUrl?: string | null;
  companyDescription?: string | null;
  phone?: string | null;
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
    isVerifiedCompany?: boolean | string;
    includeDeleted?: boolean | string;
  }): Promise<{ users: AdminUserItemDTO[]; meta: any }> {
    const res = await apiClient.get<any>("/admin/users", {
      params,
    });
    if (Array.isArray(res)) {
      return { users: res, meta: {} };
    }
    if (res && typeof res === "object" && Array.isArray(res.users)) {
      return res;
    }
    return { users: [], meta: {} };
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
    const res = await apiClient.get<any>("/admin/jobs", {
      params,
    });
    if (Array.isArray(res)) {
      return { jobs: res, meta: {} };
    }
    if (res && typeof res === "object" && Array.isArray(res.jobs)) {
      return res;
    }
    return { jobs: [], meta: {} };
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
    const res = await apiClient.get<any>("/admin/audit-logs", {
      params,
    });
    if (Array.isArray(res)) {
      return { logs: res, meta: {} };
    }
    if (res && typeof res === "object" && Array.isArray(res.logs)) {
      return res;
    }
    return { logs: [], meta: {} };
  }

  /**
   * List all platform service orders & consultation bookings
   */
  static async listBookings(): Promise<any[]> {
    const res = await apiClient.get<any>("/bookings/mine");
    return Array.isArray(res) ? res : (res as any)?.data || [];
  }

  /**
   * Retrieve platform system settings
   */
  static async getSettings(): Promise<Record<string, any>> {
    return apiClient.get<Record<string, any>>("/admin/settings");
  }

  /**
   * Update platform system settings
   */
  static async updateSettings(settings: Record<string, any>): Promise<Record<string, any>> {
    return apiClient.patch<Record<string, any>>("/admin/settings", { settings });
  }

  /**
   * List contact inquiries with optional status, search, and pagination
   */
  static async listInquiries(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ inquiries: ContactInquiryItem[]; total: number; page: number; limit: number; totalPages: number }> {
    const res = await apiClient.get<any>("/settings/inquiries", { params });
    const data = res?.data || res;
    if (data?.inquiries) {
      return {
        inquiries: data.inquiries,
        total: data.total ?? data.inquiries.length,
        page: data.page ?? 1,
        limit: data.limit ?? 20,
        totalPages: data.totalPages ?? 1,
      };
    }
    if (Array.isArray(data)) {
      return {
        inquiries: data,
        total: data.length,
        page: 1,
        limit: data.length,
        totalPages: 1,
      };
    }
    return { inquiries: [], total: 0, page: 1, limit: 20, totalPages: 1 };
  }

  /**
   * Update contact inquiry status
   */
  static async updateInquiryStatus(id: string, status: string): Promise<any> {
    return apiClient.patch(`/settings/inquiries/${id}`, { status });
  }

  /**
   * Delete contact inquiry
   */
  static async deleteInquiry(id: string): Promise<any> {
    return apiClient.delete(`/settings/inquiries/${id}`);
  }
}

export interface ContactInquiryItem {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  message: string;
  status: "UNREAD" | "CONTACTED" | "RESOLVED" | string;
  createdAt: string;
}

export const adminService = AdminService;

