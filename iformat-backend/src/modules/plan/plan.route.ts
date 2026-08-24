import { Router } from "express";
import { PlanController } from "./plan.controller.js";
import { queryPlansSchema, createPlanSchema, updatePlanSchema } from "./plan.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireAdmin } from "../../middlewares/rbac.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

// Public Plan Catalog
router.get(
  "/",
  validate({ query: queryPlansSchema }),
  catchAsync(PlanController.list)
);

router.get("/:id", catchAsync(PlanController.getById));

// Admin Plan Management
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate({ body: createPlanSchema }),
  catchAsync(PlanController.create)
);

router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validate({ body: updatePlanSchema }),
  catchAsync(PlanController.update)
);

export const planRouter = router;
