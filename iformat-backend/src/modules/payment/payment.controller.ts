import { Request, Response } from "express";
import { PaymentService } from "./payment.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { constructStripeEvent } from "../../lib/stripe.js";
import { CreateCheckoutSessionDto, CreateCustomerPortalDto, CancelSubscriptionDto } from "./payment.types.js";

export class PaymentController {
  static async createCheckout(req: Request, res: Response) {
    const { planId, successUrl, cancelUrl }: CreateCheckoutSessionDto = req.body;
    const result = await PaymentService.createCheckoutSession(
      req.user!.id,
      planId,
      successUrl,
      cancelUrl
    );
    return ApiResponse.success(res, "Checkout session created successfully", result);
  }

  static async createPortal(req: Request, res: Response) {
    const { returnUrl }: CreateCustomerPortalDto = req.body;
    const result = await PaymentService.createCustomerPortalSession(req.user!.id, returnUrl);
    return ApiResponse.success(res, "Customer billing portal session created", result);
  }

  static async getSubscription(req: Request, res: Response) {
    const sessionId = (req.query.sessionId || req.query.session_id) as string | undefined;
    const subDetails = await PaymentService.getUserSubscriptionDetails(req.user!.id, sessionId);
    return ApiResponse.success(res, "Subscription status retrieved successfully", subDetails);
  }

  static async cancelSubscription(req: Request, res: Response) {
    const { reason }: CancelSubscriptionDto = req.body;
    const updatedSub = await PaymentService.cancelSubscription(req.user!.id, reason);
    return ApiResponse.success(
      res,
      "Subscription will remain active until the end of your billing cycle",
      updatedSub
    );
  }

  static async resumeSubscription(req: Request, res: Response) {
    const updatedSub = await PaymentService.resumeSubscription(req.user!.id);
    return ApiResponse.success(res, "Subscription cancellation has been revoked", updatedSub);
  }

  static async webhook(req: Request, res: Response) {
    const sig = req.headers["stripe-signature"] as string;

    try {
      const event = constructStripeEvent(req.rawBody || req.body, sig);
      const result = await PaymentService.handleWebhookEvent(event);
      return res.status(200).json({ received: true, ...result });
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message || "Signature verification failed"}`);
    }
  }
}
