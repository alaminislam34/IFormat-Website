import { Router } from "express";
import { ApplicationController } from "./application.controller.js";
import {
  applyJobSchema,
  updateStatusSchema,
  queryApplicationsSchema,
} from "./application.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireEmployer, requireCandidate } from "../../middlewares/rbac.middleware.js";
import { requireApplicationQuota } from "../../middlewares/entitlement.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

router.use(requireAuth);

// Candidate applies to a job
router.post(
  "/",
  requireCandidate,
  requireApplicationQuota,
  validate({ body: applyJobSchema }),
  catchAsync(ApplicationController.apply)
);

// Candidate views their own applications
router.get(
  "/mine",
  validate({ query: queryApplicationsSchema }),
  catchAsync(ApplicationController.listCandidateApplications)
);

// Employer views applications for a specific job posting
router.get(
  "/job/:jobId",
  requireEmployer,
  validate({ query: queryApplicationsSchema }),
  catchAsync(ApplicationController.listJobApplications)
);

// Employer updates application status (shortlist, interview, reject, offer, hire)
router.patch(
  "/:id/status",
  requireEmployer,
  validate({ body: updateStatusSchema }),
  catchAsync(ApplicationController.updateStatus)
);

export const applicationRouter = router;
