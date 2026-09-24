import { Router } from "express";
import { SettingController } from "./setting.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/rbac.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

// 1. Public Routes (accessible to all website visitors)
router.get("/contact", catchAsync(SettingController.getContactInfo));
router.post("/contact", catchAsync(SettingController.submitContactInquiry));

// 2. Admin Protected Routes
router.use(requireAuth);
router.use(requireAdmin);

router.get("/", catchAsync(SettingController.getSettings));
router.patch("/", catchAsync(SettingController.updateSettings));
router.patch("/contact", catchAsync(SettingController.updateContactInfo));
router.get("/inquiries", catchAsync(SettingController.getContactInquiries));
router.patch("/inquiries/:id", catchAsync(SettingController.updateContactInquiryStatus));

export const settingRouter = router;
