import { Router } from "express";
import { AIController } from "./ai.controller.js";
import {
  generateCoverLetterSchema,
  generateEmailSchema,
  optimizeResumeSchema,
} from "./ai.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

// Public / Authenticated AI Generation Endpoints
router.post(
  "/cover-letter",
  validate({ body: generateCoverLetterSchema }),
  catchAsync(AIController.generateCoverLetter)
);

router.post(
  "/email",
  validate({ body: generateEmailSchema }),
  catchAsync(AIController.generateEmail)
);

router.post(
  "/resume/optimize",
  validate({ body: optimizeResumeSchema }),
  catchAsync(AIController.optimizeResume)
);

export const aiRouter = router;
