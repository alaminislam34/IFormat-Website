import { Subscription, Plan, SubscriptionStatus, SubscriptionUsage } from "@prisma/client";

export interface CreateCheckoutSessionDto {
  planId: string;
  phone?: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface CreateCustomerPortalDto {
  returnUrl?: string;
}

export interface CancelSubscriptionDto {
  reason?: string;
}

export interface UserSubscriptionDetails {
  subscription: Subscription | null;
  plan: Plan;
  status: SubscriptionStatus | "FREE";
  isPaidActive: boolean;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: Date | null;
  usage: {
    jobsPostedCount: number;
    applicationsCount: number;
    aiScreeningsCount: number;
    aiGenerationsCount: number;
  };
  effectiveLimits: {
    maxActiveJobs: number | null;
    maxApplicationsPerMonth: number | null;
    aiScreeningEnabled: boolean;
    featuredJobPlacement: boolean;
    unmaskedApplicantProfiles: boolean;
    unlimitedCvTemplates: boolean;
  };
}
