import { Router } from "express";
import { SettingController } from "./setting.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/rbac.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

// Strict security: system settings require authenticated Admin role
router.use(requireAuth);
router.use(requireAdmin);

router.get("/", catchAsync(SettingController.getSettings));
router.patch("/", catchAsync(SettingController.updateSettings));

export const settingRouter = router;
