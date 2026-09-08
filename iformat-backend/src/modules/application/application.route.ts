import { Router } from "express";
import multer from "multer";
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
import { BadRequestError } from "../../errors/index.js";

const resumeUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const mime = (file.mimetype || "").toLowerCase();
    const name = (file.originalname || "").toLowerCase();
    if (mime === "application/pdf" || name.endsWith(".pdf")) {
      cb(null, true);
      return;
    }
    cb(new BadRequestError("Only PDF files are supported for resume upload"));
  },
});

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

// Candidate replaces resume on an existing application (fixes unreadable / wrong CV data)
router.post(
  "/:id/resume",
  requireCandidate,
  resumeUpload.single("file"),
  catchAsync(ApplicationController.replaceResume)
);

// Employer updates application status (shortlist, interview, reject, offer, hire)
router.patch(
  "/:id/status",
  requireEmployer,
  validate({ body: updateStatusSchema }),
  catchAsync(ApplicationController.updateStatus)
);

export const applicationRouter = router;
