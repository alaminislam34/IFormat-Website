import { z } from "zod";
import { PlanAudience, PlanBillingInterval } from "@prisma/client";

export const queryPlansSchema = z.object({
  audience: z.enum(["EMPLOYER", "CANDIDATE", "BOTH", "ALL"]).optional(),
  interval: z.nativeEnum(PlanBillingInterval).optional(),
  isActive: z
    .enum(["true", "false"])
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
});

export const createPlanSchema = z.object({
  code: z
    .string()
    .min(2, "Plan code must be at least 2 characters")
    .max(50)
    .regex(/^[A-Z0-9_]+$/, "Code must be uppercase letters, numbers, and underscores"),
  name: z.string().min(2, "Plan name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  priceInCents: z.number().int().min(0, "Price in cents must be >= 0"),
  currency: z.string().length(3).default("USD"),
  billingInterval: z.nativeEnum(PlanBillingInterval).default(PlanBillingInterval.MONTHLY),
  targetAudience: z.nativeEnum(PlanAudience).default(PlanAudience.EMPLOYER),
  stripePriceId: z.string().optional(),
  stripeProductId: z.string().optional(),
  maxActiveJobs: z.number().int().min(0).nullable().optional(),
  maxApplicationsPerMonth: z.number().int().min(0).nullable().optional(),
  aiScreeningEnabled: z.boolean().default(false),
  featuredJobPlacement: z.boolean().default(false),
  unmaskedApplicantProfiles: z.boolean().default(false),
  unlimitedCvTemplates: z.boolean().default(false),
  consultationDiscountPercent: z.number().int().min(0).max(100).default(0),
  customFeatures: z.record(z.any()).optional(),
});

export const updatePlanSchema = createPlanSchema.partial().extend({
  isActive: z.boolean().optional(),
});
