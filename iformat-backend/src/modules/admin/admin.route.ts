import { Router } from "express";
import { AdminController } from "./admin.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/rbac.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

// Strict security: all admin routes require authenticated Admin role
router.use(requireAuth);
router.use(requireAdmin);

// 1. Dashboard Overview & Financial KPIs
router.get("/metrics", catchAsync(AdminController.getMetrics));

// 2. User Moderation & Soft Deletion
router.get("/users", catchAsync(AdminController.listUsers));
router.patch("/users/:id/ban", catchAsync(AdminController.banUser));
router.post("/users/:id/verify-email", catchAsync(AdminController.forceVerifyEmail));
router.delete("/users/:id", catchAsync(AdminController.softDeleteUser));
router.post("/users/:id/restore", catchAsync(AdminController.restoreUser));

// 3. Job Moderation & Soft Deletion
router.get("/jobs", catchAsync(AdminController.listJobs));
router.patch("/jobs/:id/status", catchAsync(AdminController.updateJobStatus));
router.delete("/jobs/:id", catchAsync(AdminController.softDeleteJob));
router.post("/jobs/:id/restore", catchAsync(AdminController.restoreJob));

// 4. Company Verification
router.patch("/companies/:userId/verify", catchAsync(AdminController.toggleCompanyVerification));

// 5. Subscription Manual Grant / Override
router.post("/subscriptions/override", catchAsync(AdminController.overrideSubscription));

// 6. Audit Trail
router.get("/audit-logs", catchAsync(AdminController.listAuditLogs));

export const adminRouter = router;
