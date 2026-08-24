import { Plan, PlanAudience, PlanBillingInterval } from "@prisma/client";

export interface PlanFilterQuery {
  audience?: PlanAudience | "ALL";
  interval?: PlanBillingInterval;
  isActive?: boolean;
}

export interface CreatePlanDto {
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

export interface UpdatePlanDto extends Partial<CreatePlanDto> {
  isActive?: boolean;
}

export type { Plan };
