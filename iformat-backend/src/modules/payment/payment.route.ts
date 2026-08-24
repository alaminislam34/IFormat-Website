import { Router } from "express";
import { PaymentController } from "./payment.controller.js";
import {
  createCheckoutSchema,
  customerPortalSchema,
  cancelSubscriptionSchema,
} from "./payment.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

// Stripe Webhook Endpoint (Exempt from JWT auth, requires raw body stripe-signature)
router.post("/webhook", catchAsync(PaymentController.webhook));

// Protected Payment & Subscription Endpoints
router.use(requireAuth);

router.post(
  "/checkout",
  validate({ body: createCheckoutSchema }),
  catchAsync(PaymentController.createCheckout)
);

router.post(
  "/customer-portal",
  validate({ body: customerPortalSchema }),
  catchAsync(PaymentController.createPortal)
);

router.get("/subscription", catchAsync(PaymentController.getSubscription));

router.post(
  "/subscription/cancel",
  validate({ body: cancelSubscriptionSchema }),
  catchAsync(PaymentController.cancelSubscription)
);

router.post(
  "/subscription/resume",
  catchAsync(PaymentController.resumeSubscription)
);

export const paymentRouter = router;
