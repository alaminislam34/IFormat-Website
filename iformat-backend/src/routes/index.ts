import { Router } from "express";
import { authRouter } from "../modules/auth/auth.route.js";
import { oauthRouter } from "../modules/oauth/oauth.route.js";
import { userRouter } from "../modules/user/user.route.js";
import { cvRouter } from "../modules/cv/cv.route.js";
import { jobRouter } from "../modules/job/job.route.js";
import { applicationRouter } from "../modules/application/application.route.js";
import { screeningRouter } from "../modules/screening/screening.route.js";
import { bookingRouter } from "../modules/booking/booking.route.js";
import { paymentRouter } from "../modules/payment/payment.route.js";
import { planRouter } from "../modules/plan/plan.route.js";
import { notificationRouter } from "../modules/notification/notification.route.js";
import { adminRouter } from "../modules/admin/admin.route.js";
import { aiRouter } from "../modules/ai/ai.route.js";
import { ApiResponse } from "../utils/apiResponse.js";

const apiRouter = Router();

// Health Check Probe
apiRouter.get("/health", (_req, res) => {
  return ApiResponse.success(res, "iFormat API is running smoothly", {
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Module Sub-routers
apiRouter.use("/auth", authRouter);
apiRouter.use("/oauth", oauthRouter);
apiRouter.use("/users", userRouter);
apiRouter.use("/cv", cvRouter);
apiRouter.use("/jobs", jobRouter);
apiRouter.use("/applications", applicationRouter);
apiRouter.use("/screening", screeningRouter);
apiRouter.use("/bookings", bookingRouter);
apiRouter.use("/payments", paymentRouter);
apiRouter.use("/plans", planRouter);
apiRouter.use("/notifications", notificationRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/ai", aiRouter);

export { apiRouter };
