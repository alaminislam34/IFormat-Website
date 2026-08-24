import Stripe from "stripe";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || "sk_test_mock", {
  apiVersion: "2025-02-24.acacia" as any,
  typescript: true,
});

export const constructStripeEvent = (payload: string | Buffer, signature: string) => {
  if (!env.STRIPE_WEBHOOK_SECRET) {
    logger.warn("⚠️ STRIPE_WEBHOOK_SECRET is not set. Skipping signature verification in dev.");
    return JSON.parse(payload.toString());
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );
};
