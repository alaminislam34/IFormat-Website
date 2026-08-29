export type PlanAudience = "EMPLOYER" | "CANDIDATE" | "BOTH";
export type PlanBillingInterval = "MONTHLY" | "YEARLY";
export type SubscriptionStatus =
  | "TRIALING"
  | "ACTIVE"
  | "PAST_DUE"
  | "CANCELED"
  | "UNPAID"
  | "EXPIRED"
  | "INCOMPLETE"
  | "FREE";

export interface PlanDTO {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  priceInCents: number;
  currency: string;
  billingInterval: PlanBillingInterval;
  targetAudience: PlanAudience;
  isActive: boolean;
  stripePriceId?: string | null;
  stripeProductId?: string | null;
  maxActiveJobs?: number | null;
  maxApplicationsPerMonth?: number | null;
  aiScreeningEnabled: boolean;
  featuredJobPlacement: boolean;
  unmaskedApplicantProfiles: boolean;
  unlimitedCvTemplates: boolean;
  consultationDiscountPercent: number;
  customFeatures?: Record<string, any> | null;
}

export interface SubscriptionDTO {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  stripeCustomerId: string;
  stripeSubscriptionId?: string | null;
  currentPeriodStart?: string | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string | null;
  trialEndsAt?: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: PlanDTO;
}

export interface UserSubscriptionDetailsDTO {
  subscription: SubscriptionDTO | null;
  plan: PlanDTO;
  status: SubscriptionStatus;
  isPaidActive: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  usage: {
    jobsPostedCount: number;
    applicationsCount: number;
    aiScreeningsCount: number;
  };
  effectiveLimits: {
    maxActiveJobs: number | null;
    maxApplicationsPerMonth: number | null;
    aiScreeningEnabled: boolean;
    featuredJobPlacement: boolean;
    unmaskedApplicantProfiles: boolean;
    unlimitedCvTemplates: boolean;
    consultationDiscountPercent: number;
  };
}

export interface CreateCheckoutRequest {
  planId: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CheckoutSessionResponse {
  url: string;
  sessionId: string;
}

export interface CustomerPortalResponse {
  url: string;
}

export interface CreatePlanDTO {
  code: string;
  name: string;
  description?: string;
  priceInCents: number;
  currency?: string;
  billingInterval?: PlanBillingInterval;
  targetAudience?: PlanAudience;
  stripePriceId?: string;
  stripeProductId?: string;
  maxActiveJobs?: number | null;
  maxApplicationsPerMonth?: number | null;
  aiScreeningEnabled?: boolean;
  featuredJobPlacement?: boolean;
  unmaskedApplicantProfiles?: boolean;
  unlimitedCvTemplates?: boolean;
  consultationDiscountPercent?: number;
  customFeatures?: Record<string, any>;
}

export type UpdatePlanDTO = Partial<CreatePlanDTO> & {
  isActive?: boolean;
};
