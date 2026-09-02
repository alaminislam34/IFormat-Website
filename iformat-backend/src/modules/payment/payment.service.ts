import { prisma } from "../../lib/prisma.js";
import { stripe } from "../../lib/stripe.js";
import { env, getFrontendUrl } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import { ConflictError, NotFoundError, ValidationError, ForbiddenError } from "../../errors/index.js";
import { PlanService } from "../plan/plan.service.js";
import { UserSubscriptionDetails } from "./payment.types.js";
import { Role, SubscriptionStatus, PlanAudience, PlanBillingInterval } from "@prisma/client";

export class PaymentService {
  /**
   * Helper to determine if Stripe live mode is configured
   */
  private static isMockStripe(): boolean {
    return (
      !env.STRIPE_SECRET_KEY ||
      env.STRIPE_SECRET_KEY === "sk_test_mock_stripe_key" ||
      env.STRIPE_SECRET_KEY === "sk_test_mock"
    );
  }

  /**
   * Create a Stripe Checkout Session for subscription purchase
   */
  static async createCheckoutSession(
    userId: string,
    planIdOrCode: string,
    successUrlOverride?: string,
    cancelUrlOverride?: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: { include: { plan: true } } },
    });

    if (!user) {
      throw new NotFoundError("User", userId);
    }

    const targetPlan = await PlanService.getPlanByIdOrCode(planIdOrCode);

    // Validate target audience
    if (
      targetPlan.targetAudience !== PlanAudience.BOTH &&
      ((user.role === Role.EMPLOYER && targetPlan.targetAudience !== PlanAudience.EMPLOYER) ||
        (user.role === Role.CANDIDATE && targetPlan.targetAudience !== PlanAudience.CANDIDATE))
    ) {
      throw new ForbiddenError(
        `Plan '${targetPlan.name}' is designated for ${targetPlan.targetAudience} accounts only.`
      );
    }

    // Check if user is already actively subscribed to this exact plan
    if (
      user.subscription &&
      user.subscription.planId === targetPlan.id &&
      user.subscription.status === SubscriptionStatus.ACTIVE &&
      !user.subscription.cancelAtPeriodEnd
    ) {
      throw new ConflictError("You are already actively subscribed to this membership plan.");
    }

    const successUrl =
      successUrlOverride ||
      `${getFrontendUrl()}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&plan=${targetPlan.code}`;
    const cancelUrl =
      cancelUrlOverride || `${getFrontendUrl()}/pricing?canceled=true`;

    // 1. Mock Mode (Local Development & CI)
    if (this.isMockStripe()) {
      logger.info(
        `💳 [Mock Stripe] Simulating Checkout Session & activating plan for user: ${user.email} (Plan: ${targetPlan.name})`
      );

      const periodStart = new Date();
      const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const mockSessionId = `cs_mock_${Date.now()}`;
      const mockCustomerId = user.subscription?.stripeCustomerId || `cus_mock_${user.id}`;
      const mockSubId = `sub_mock_${Date.now()}`;

      await prisma.subscription.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          planId: targetPlan.id,
          stripeCustomerId: mockCustomerId,
          stripeSubscriptionId: mockSubId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
        },
        update: {
          planId: targetPlan.id,
          stripeCustomerId: mockCustomerId,
          stripeSubscriptionId: mockSubId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: false,
          canceledAt: null,
        },
      });

      return {
        url: `${getFrontendUrl()}/dashboard/billing?mock_success=true&session_id=${mockSessionId}&plan=${targetPlan.code}`,
        sessionId: mockSessionId,
      };
    }

    // 2. Production / Live Stripe Mode
    const customerId = await this.getOrCreateStripeCustomer(user);

    const stripeInterval: "month" | "year" =
      targetPlan.billingInterval === PlanBillingInterval.YEARLY ||
      String(targetPlan.billingInterval).toUpperCase() === "YEARLY"
        ? "year"
        : "month";

    const stripePriceId = (targetPlan as any).stripePriceId;
    const lineItems = stripePriceId
      ? [{ price: stripePriceId, quantity: 1 }]
      : [
          {
            price_data: {
              currency: targetPlan.currency.toLowerCase(),
              product_data: {
                name: targetPlan.name,
                description: targetPlan.description || undefined,
              },
              unit_amount: targetPlan.priceInCents,
              recurring: {
                interval: stripeInterval,
              },
            },
            quantity: 1,
          },
        ];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: user.id,
        planId: targetPlan.id,
        planCode: targetPlan.code,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId: targetPlan.id,
          planCode: targetPlan.code,
        },
      },
    });

    return {
      url: session.url!,
      sessionId: session.id,
    };
  }

  /**
   * Safe helper to ensure a valid Stripe customer ID exists on Stripe
   */
  private static async getOrCreateStripeCustomer(user: any): Promise<string> {
    let customerId = user.subscription?.stripeCustomerId;

    if (
      customerId &&
      !customerId.startsWith("cus_comped") &&
      !customerId.startsWith("cus_mock")
    ) {
      try {
        const existing = await stripe.customers.retrieve(customerId);
        if (existing && !existing.deleted) {
          return existing.id;
        }
      } catch (err: any) {
        logger.warn(
          `Customer ${customerId} not found in Stripe (${err.message}). Creating fresh customer.`
        );
      }
    }

    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: { userId: user.id, role: user.role },
    });

    if (user.subscription) {
      await prisma.subscription.update({
        where: { id: user.subscription.id },
        data: { stripeCustomerId: customer.id },
      });
    }

    return customer.id;
  }

  /**
   * Create a Stripe Customer Billing Portal Session
   */
  static async createCustomerPortalSession(userId: string, returnUrlOverride?: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true },
    });

    if (!user) throw new NotFoundError("User", userId);

    const returnUrl = returnUrlOverride || `${getFrontendUrl()}/dashboard/billing`;

    const rawCustomerId = user.subscription?.stripeCustomerId;
    if (
      this.isMockStripe() ||
      !rawCustomerId ||
      rawCustomerId.startsWith("cus_comped") ||
      rawCustomerId.startsWith("cus_mock")
    ) {
      return {
        url: `${getFrontendUrl()}/dashboard/billing?mock_portal=true`,
      };
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: rawCustomerId,
        return_url: returnUrl,
      });

      return { url: session.url };
    } catch (err: any) {
      logger.warn(`Stripe Billing Portal error for ${rawCustomerId}:`, err.message);
      return {
        url: `${getFrontendUrl()}/dashboard/billing?mock_portal=true`,
      };
    }
  }

  /**
   * Cancel Subscription (Defaults to cancel at period end)
   */
  static async cancelSubscription(userId: string, _reason?: string) {
    const sub = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!sub || sub.status !== SubscriptionStatus.ACTIVE) {
      throw new ValidationError("No active paid subscription found to cancel");
    }

    if (sub.cancelAtPeriodEnd) {
      return sub; // already scheduled to cancel
    }

    if (!this.isMockStripe() && sub.stripeSubscriptionId && !sub.stripeSubscriptionId.startsWith("sub_mock")) {
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
    }

    return prisma.subscription.update({
      where: { id: sub.id },
      data: {
        cancelAtPeriodEnd: true,
        canceledAt: new Date(),
      },
      include: { plan: true },
    });
  }

  /**
   * Resume / Revoke cancellation of a subscription before it expires
   */
  static async resumeSubscription(userId: string) {
    const sub = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!sub || !sub.cancelAtPeriodEnd) {
      throw new ValidationError("Subscription is not scheduled for cancellation");
    }

    if (!this.isMockStripe() && sub.stripeSubscriptionId && !sub.stripeSubscriptionId.startsWith("sub_mock")) {
      await stripe.subscriptions.update(sub.stripeSubscriptionId, {
        cancel_at_period_end: false,
      });
    }

    return prisma.subscription.update({
      where: { id: sub.id },
      data: {
        cancelAtPeriodEnd: false,
        canceledAt: null,
      },
      include: { plan: true },
    });
  }

  /**
   * Automatically sync Stripe subscription status into database
   */
  static async syncUserSubscriptionWithStripe(userId: string, sessionId?: string) {
    if (this.isMockStripe()) return;

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { subscription: true },
      });
      if (!user) return;

      // 1. Check direct Stripe Checkout Session if provided
      if (sessionId && sessionId.startsWith("cs_") && !sessionId.startsWith("cs_mock_")) {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const isPaidOrComplete =
          session.payment_status === "paid" ||
          session.payment_status === "no_payment_required" ||
          session.status === "complete";

        if (isPaidOrComplete) {
          const planCode = session.metadata?.planCode || session.metadata?.plan;
          const planId = session.metadata?.planId;

          let targetPlan: any;
          if (planId) {
            targetPlan = await prisma.plan.findUnique({ where: { id: planId } });
          }
          if (!targetPlan && planCode) {
            targetPlan = await PlanService.getPlanByIdOrCode(planCode);
          }
          if (!targetPlan) {
            targetPlan = await PlanService.getPlanByIdOrCode("EMPLOYER_PRO");
          }

          const customerId = (session.customer as string) || user.subscription?.stripeCustomerId || `cus_${userId}`;
          const subscriptionId = session.subscription as string;

          let periodStart = new Date();
          let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

          if (subscriptionId) {
            try {
              const stripeSub: any = await stripe.subscriptions.retrieve(subscriptionId);
              if (stripeSub.current_period_start) {
                periodStart = new Date(stripeSub.current_period_start * 1000);
              }
              if (stripeSub.current_period_end) {
                periodEnd = new Date(stripeSub.current_period_end * 1000);
              }
            } catch (err: any) {
              logger.warn(`Could not retrieve Stripe subscription: ${err.message}`);
            }
          }

          await prisma.subscription.upsert({
            where: { userId },
            create: {
              userId,
              planId: targetPlan.id,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId || `sub_${userId}`,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
            },
            update: {
              planId: targetPlan.id,
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId || undefined,
              status: SubscriptionStatus.ACTIVE,
              currentPeriodStart: periodStart,
              currentPeriodEnd: periodEnd,
              cancelAtPeriodEnd: false,
              canceledAt: null,
            },
          });
          logger.info(`✅ [Sync] User ${userId} subscription synced via session ${sessionId}`);
          return;
        }
      }

      // 2. Check active Stripe subscriptions for this customer / existing subscription
      const subId = user.subscription?.stripeSubscriptionId;
      const customerId = user.subscription?.stripeCustomerId;

      if (subId && !subId.startsWith("sub_mock") && !subId.startsWith("sub_comped")) {
        try {
          const stripeSub: any = await stripe.subscriptions.retrieve(subId);
          if (stripeSub) {
            const status = this.mapStripeStatus(stripeSub.status);
            const periodStart = stripeSub.current_period_start
              ? new Date(stripeSub.current_period_start * 1000)
              : undefined;
            const periodEnd = stripeSub.current_period_end
              ? new Date(stripeSub.current_period_end * 1000)
              : undefined;

            await prisma.subscription.update({
              where: { id: user.subscription!.id },
              data: {
                status,
                cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
                canceledAt: stripeSub.canceled_at ? new Date(stripeSub.canceled_at * 1000) : null,
              },
            });
            logger.info(`✅ [Sync] User ${userId} subscription status updated from Stripe (${status})`);
            return;
          }
        } catch (err: any) {
          logger.warn(`⚠️ [Sync] Could not retrieve Stripe sub ${subId}: ${err.message}`);
        }
      }

      if (customerId && !customerId.startsWith("cus_comped") && !customerId.startsWith("cus_mock")) {
        const stripeSubs = await stripe.subscriptions.list({
          customer: customerId,
          status: "all",
          limit: 1,
        });

        if (stripeSubs.data && stripeSubs.data.length > 0) {
          const latestSub = stripeSubs.data[0];
          if (latestSub.status === "active" || latestSub.status === "trialing") {
            const planCode = latestSub.metadata?.planCode || latestSub.metadata?.plan;
            const planId = latestSub.metadata?.planId;

            let targetPlan: any;
            if (planId) {
              targetPlan = await prisma.plan.findUnique({ where: { id: planId } });
            }
            if (!targetPlan && planCode) {
              targetPlan = await PlanService.getPlanByIdOrCode(planCode);
            }
            if (!targetPlan) {
              const itemPrice = latestSub.items?.data?.[0]?.price;
              if (itemPrice?.unit_amount) {
                targetPlan = await prisma.plan.findFirst({
                  where: { priceInCents: itemPrice.unit_amount, isDeleted: false },
                });
              }
            }
            if (!targetPlan) {
              targetPlan = await PlanService.getPlanByIdOrCode("EMPLOYER_PRO");
            }

            const periodStart = new Date(latestSub.current_period_start * 1000);
            const periodEnd = new Date(latestSub.current_period_end * 1000);

            await prisma.subscription.upsert({
              where: { userId },
              create: {
                userId,
                planId: targetPlan.id,
                stripeCustomerId: customerId,
                stripeSubscriptionId: latestSub.id,
                status: SubscriptionStatus.ACTIVE,
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: latestSub.cancel_at_period_end,
              },
              update: {
                planId: targetPlan.id,
                stripeCustomerId: customerId,
                stripeSubscriptionId: latestSub.id,
                status: SubscriptionStatus.ACTIVE,
                currentPeriodStart: periodStart,
                currentPeriodEnd: periodEnd,
                cancelAtPeriodEnd: latestSub.cancel_at_period_end,
                canceledAt: latestSub.canceled_at ? new Date(latestSub.canceled_at * 1000) : null,
              },
            });
            logger.info(`✅ [Sync] User ${userId} subscription synced via Stripe customer ${customerId}`);
          }
        }
      }
    } catch (err: any) {
      logger.warn(`⚠️ [Sync] Auto-sync with Stripe skipped: ${err.message}`);
    }
  }

  /**
   * Get user's complete subscription status, limits, and usage
   */
  static async getUserSubscriptionDetails(userId: string, sessionId?: string): Promise<UserSubscriptionDetails> {
    // Proactively sync Stripe session/customer status if needed
    await this.syncUserSubscriptionWithStripe(userId, sessionId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: { include: { plan: true } },
      },
    });

    if (!user) throw new NotFoundError("User", userId);

    const activeSub = user.subscription;
    const isPaidPlan = Boolean(activeSub?.plan && activeSub.plan.priceInCents > 0);
    const isPaidActive =
      activeSub !== null &&
      isPaidPlan &&
      (activeSub.status === SubscriptionStatus.ACTIVE ||
        activeSub.status === SubscriptionStatus.TRIALING) &&
      (!activeSub.currentPeriodEnd || activeSub.currentPeriodEnd > new Date());

    let plan: any;
    if (activeSub?.plan) {
      plan = activeSub.plan;
    } else {
      plan = PlanService.getDefaultPlanForRole(user.role);
    }

    // Retrieve cycle usage
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    let usage = { jobsPostedCount: 0, applicationsCount: 0, aiScreeningsCount: 0 };
    try {
      const usageRecord = await prisma.subscriptionUsage.findFirst({
        where: {
          userId,
          periodStart: { lte: now },
          periodEnd: { gte: now },
        },
      });

      if (usageRecord) {
        usage = {
          jobsPostedCount: usageRecord.jobsPostedCount,
          applicationsCount: usageRecord.applicationsCount,
          aiScreeningsCount: usageRecord.aiScreeningsCount,
        };
      }
    } catch {
      // Ignored if DB offline
    }

    return {
      subscription: activeSub,
      plan,
      status: isPaidActive && activeSub ? activeSub.status : "FREE",
      isPaidActive,
      cancelAtPeriodEnd: isPaidActive && activeSub ? activeSub.cancelAtPeriodEnd : false,
      currentPeriodEnd: isPaidActive && activeSub ? activeSub.currentPeriodEnd : null,
      usage,
      effectiveLimits: {
        maxActiveJobs: plan.maxActiveJobs,
        maxApplicationsPerMonth: plan.maxApplicationsPerMonth,
        aiScreeningEnabled: plan.aiScreeningEnabled,
        featuredJobPlacement: plan.featuredJobPlacement,
        unmaskedApplicantProfiles: plan.unmaskedApplicantProfiles,
        unlimitedCvTemplates: plan.unlimitedCvTemplates,
        consultationDiscountPercent: plan.consultationDiscountPercent,
      },
    };
  }

  /**
   * Stripe Webhook Ingestion Engine with Idempotency & Deduplication
   */
  static async handleWebhookEvent(event: any) {
    const eventId = event.id;
    const eventType = event.type;

    logger.info(`💳 [Stripe Webhook] Received Event: ${eventType} (ID: ${eventId})`);

    // 1. Idempotency Check
    try {
      const existingEvent = await prisma.webhookEvent.findUnique({
        where: { stripeEventId: eventId },
      });

      if (existingEvent) {
        logger.info(`⏩ [Stripe Webhook] Duplicate event ${eventId} already processed. Skipping.`);
        return { duplicate: true };
      }

      await prisma.webhookEvent.create({
        data: {
          stripeEventId: eventId,
          eventType,
          payload: event as any,
        },
      });
    } catch (e: any) {
      logger.warn(`⚠️ [Stripe Webhook] Failed to record WebhookEvent idempotency log: ${e.message}`);
    }

    // 2. Dispatch event to handler
    switch (eventType) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.userId;
        const planCode = session.metadata?.planCode || session.metadata?.plan;

        if (!userId) {
          logger.warn(`⚠️ [Webhook] checkout.session.completed missing userId`);
          break;
        }

        const plan = planCode
          ? await PlanService.getPlanByIdOrCode(planCode)
          : await PlanService.getPlanByIdOrCode("EMPLOYER_PRO");

        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        // Fetch subscription period details from Stripe if available
        let periodStart = new Date();
        let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

        if (!this.isMockStripe() && subscriptionId) {
          try {
            const stripeSub: any = await stripe.subscriptions.retrieve(subscriptionId);
            periodStart = new Date(stripeSub.current_period_start * 1000);
            periodEnd = new Date(stripeSub.current_period_end * 1000);
          } catch (err: any) {
            logger.warn(`⚠️ [Webhook] Error fetching stripe subscription: ${err.message}`);
          }
        }

        await prisma.subscription.upsert({
          where: { userId },
          create: {
            userId,
            planId: plan.id,
            stripeCustomerId: customerId || `cus_${userId}`,
            stripeSubscriptionId: subscriptionId || `sub_${userId}`,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
          },
          update: {
            planId: plan.id,
            stripeCustomerId: customerId || undefined,
            stripeSubscriptionId: subscriptionId || undefined,
            status: SubscriptionStatus.ACTIVE,
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            cancelAtPeriodEnd: false,
            canceledAt: null,
          },
        });

        logger.info(`✅ [Webhook] User ${userId} successfully subscribed to ${plan.name}`);
        break;
      }

      case "customer.subscription.updated": {
        const stripeSub = event.data.object;
        const subscriptionId = stripeSub.id;
        const status = this.mapStripeStatus(stripeSub.status);
        const cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
        const currentPeriodStart = new Date(stripeSub.current_period_start * 1000);
        const currentPeriodEnd = new Date(stripeSub.current_period_end * 1000);

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            status,
            cancelAtPeriodEnd,
            currentPeriodStart,
            currentPeriodEnd,
          },
        });

        logger.info(
          `🔄 [Webhook] Updated subscription ${subscriptionId} status: ${status} (cancelAtPeriodEnd: ${cancelAtPeriodEnd})`
        );
        break;
      }

      case "customer.subscription.deleted": {
        const stripeSub = event.data.object;
        const subscriptionId = stripeSub.id;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: {
            status: SubscriptionStatus.EXPIRED,
            canceledAt: new Date(),
          },
        });

        logger.info(`⏹️ [Webhook] Subscription ${subscriptionId} deleted/expired`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: SubscriptionStatus.PAST_DUE },
          });
          logger.warn(`⚠️ [Webhook] Payment failed for subscription ${subscriptionId} -> PAST_DUE`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          await prisma.subscription.updateMany({
            where: { stripeSubscriptionId: subscriptionId },
            data: { status: SubscriptionStatus.ACTIVE },
          });
          logger.info(`✅ [Webhook] Payment succeeded for subscription ${subscriptionId} -> ACTIVE`);
        }
        break;
      }
    }

    return { processed: true };
  }

  /**
   * Helper to map Stripe status strings to SubscriptionStatus enum
   */
  private static mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case "active":
        return SubscriptionStatus.ACTIVE;
      case "trialing":
        return SubscriptionStatus.TRIALING;
      case "past_due":
        return SubscriptionStatus.PAST_DUE;
      case "canceled":
        return SubscriptionStatus.CANCELED;
      case "unpaid":
        return SubscriptionStatus.UNPAID;
      case "incomplete":
      case "incomplete_expired":
        return SubscriptionStatus.INCOMPLETE;
      default:
        return SubscriptionStatus.ACTIVE;
    }
  }
}
