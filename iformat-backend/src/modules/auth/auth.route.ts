import { Router } from "express";
import { AuthController } from "./auth.controller.js";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "./auth.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import {
  authLimiter,
  passwordResetLimiter,
} from "../../middlewares/rateLimiter.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

router.post(
  "/register",
  authLimiter,
  validate({ body: registerSchema }),
  catchAsync(AuthController.register)
);

router.post(
  "/login",
  authLimiter,
  validate({ body: loginSchema }),
  catchAsync(AuthController.login)
);

router.post(
  "/verify-otp",
  authLimiter,
  validate({ body: verifyOtpSchema }),
  catchAsync(AuthController.verifyOtp)
);

router.post(
  "/resend-otp",
  authLimiter,
  validate({ body: resendOtpSchema }),
  catchAsync(AuthController.resendOtp)
);

router.post(
  "/refresh",
  catchAsync(AuthController.refresh)
);

router.post(
  "/logout",
  requireAuth,
  catchAsync(AuthController.logout)
);

router.post(
  "/forgot-password",
  passwordResetLimiter,
  validate({ body: forgotPasswordSchema }),
  catchAsync(AuthController.forgotPassword)
);

router.post(
  "/reset-password",
  passwordResetLimiter,
  validate({ body: resetPasswordSchema }),
  catchAsync(AuthController.resetPassword)
);

router.post(
  "/change-password",
  requireAuth,
  validate({ body: changePasswordSchema }),
  catchAsync(AuthController.changePassword)
);

router.get(
  "/me",
  requireAuth,
  catchAsync(AuthController.getMe)
);

export const authRouter = router;
