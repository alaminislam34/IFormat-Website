import { z } from "zod";

export const createCheckoutSchema = z.object({
  planId: z.string().min(1, "Plan ID or code is required"),
  successUrl: z.string().url("Must be a valid URL").optional(),
  cancelUrl: z.string().url("Must be a valid URL").optional(),
});

export const customerPortalSchema = z.object({
  returnUrl: z.string().url("Must be a valid URL").optional(),
});

export const cancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional(),
});
