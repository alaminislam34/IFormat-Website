import { Router } from "express";
import { ScreeningController } from "./screening.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireEmployer } from "../../middlewares/rbac.middleware.js";
import { requireAiScreeningAccess } from "../../middlewares/entitlement.middleware.js";
import { aiLimiter } from "../../middlewares/rateLimiter.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

router.use(requireAuth);
router.use(requireEmployer);

router.get("/:applicationId", catchAsync(ScreeningController.getResult));
router.post(
  "/:applicationId/rerun",
  requireAiScreeningAccess,
  aiLimiter,
  catchAsync(ScreeningController.triggerScreening)
);

export const screeningRouter = router;
