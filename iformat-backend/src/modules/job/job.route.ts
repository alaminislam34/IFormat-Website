import { Router } from "express";
import { JobController } from "./job.controller.js";
import { createJobSchema, updateJobSchema, queryJobsSchema } from "./job.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireEmployer } from "../../middlewares/rbac.middleware.js";
import { requireJobPostingQuota } from "../../middlewares/entitlement.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

// Public Job Board Browsing
router.get(
  "/",
  validate({ query: queryJobsSchema }),
  catchAsync(JobController.list)
);

// Employer specific listings
router.get(
  "/employer/mine",
  requireAuth,
  requireEmployer,
  catchAsync(JobController.listEmployerJobs)
);

// Single Job Details
router.get("/:id", catchAsync(JobController.getById));

// Protected Employer Actions
router.post(
  "/",
  requireAuth,
  requireEmployer,
  requireJobPostingQuota,
  validate({ body: createJobSchema }),
  catchAsync(JobController.create)
);

router.patch(
  "/:id",
  requireAuth,
  requireEmployer,
  validate({ body: updateJobSchema }),
  catchAsync(JobController.update)
);

router.delete(
  "/:id",
  requireAuth,
  requireEmployer,
  catchAsync(JobController.delete)
);

export const jobRouter = router;
