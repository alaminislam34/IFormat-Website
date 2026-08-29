import { apiClient } from "@/lib/api/api-client";
import {
  PlanDTO,
  PlanAudience,
  PlanBillingInterval,
  UserSubscriptionDetailsDTO,
  CreateCheckoutRequest,
  CheckoutSessionResponse,
  CustomerPortalResponse,
  SubscriptionDTO,
} from "@/types/api";

export class MembershipService {
  /**
   * Fetch active membership plans with optional audience and interval filtering
   */
  static async getPlans(params?: {
    audience?: PlanAudience | "ALL";
    interval?: PlanBillingInterval;
  }): Promise<PlanDTO[]> {
    return apiClient.get<PlanDTO[]>("/plans", {
      params: {
        audience: params?.audience,
        interval: params?.interval,
      },
    });
  }

  /**
   * Fetch single plan details by ID or code
   */
  static async getPlanById(idOrCode: string): Promise<PlanDTO> {
    return apiClient.get<PlanDTO>(`/plans/${idOrCode}`);
  }

  /**
   * Create a Stripe Checkout session for a chosen membership plan
   */
  static async createCheckoutSession(
    payload: CreateCheckoutRequest
  ): Promise<CheckoutSessionResponse> {
    return apiClient.post<CheckoutSessionResponse>("/payments/checkout", payload);
  }

  /**
   * Retrieve current authenticated user's subscription details, plan limits, and usage
   */
  static async getUserSubscription(): Promise<UserSubscriptionDetailsDTO> {
    return apiClient.get<UserSubscriptionDetailsDTO>("/payments/subscription");
  }

  /**
   * Generate Stripe Customer Billing Portal session URL
   */
  static async createCustomerPortal(
    returnUrl?: string
  ): Promise<CustomerPortalResponse> {
    return apiClient.post<CustomerPortalResponse>("/payments/customer-portal", {
      returnUrl,
    });
  }

  /**
   * Cancel subscription at the end of the current billing period
   */
  static async cancelSubscription(reason?: string): Promise<SubscriptionDTO> {
    return apiClient.post<SubscriptionDTO>("/payments/subscription/cancel", {
      reason,
    });
  }

  /**
   * Resume / Revoke pending cancellation of a subscription before it expires
   */
  static async resumeSubscription(): Promise<SubscriptionDTO> {
    return apiClient.post<SubscriptionDTO>("/payments/subscription/resume");
  }

  /**
   * Admin: Create a new membership plan tier
   */
  static async createPlan(data: import("@/types/api").CreatePlanDTO): Promise<PlanDTO> {
    return apiClient.post<PlanDTO>("/plans", data);
  }

  /**
   * Admin: Update an existing membership plan tier
   */
  static async updatePlan(
    id: string,
    data: import("@/types/api").UpdatePlanDTO
  ): Promise<PlanDTO> {
    return apiClient.patch<PlanDTO>(`/plans/${id}`, data);
  }
}

export const membershipService = MembershipService;
