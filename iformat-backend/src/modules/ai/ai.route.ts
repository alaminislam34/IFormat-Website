import { Router } from "express";
import multer from "multer";
import { AIController } from "./ai.controller.js";
import {
  generateCoverLetterSchema,
  generateEmailSchema,
  optimizeResumeSchema,
  buildCvSchema,
  recommendProductsSchema,
  careerChatSchema,
} from "./ai.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireCandidate } from "../../middlewares/rbac.middleware.js";
import { requireAiEntitlement } from "../../middlewares/entitlement.middleware.js";
import { catchAsync } from "../../utils/catchAsync.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
  },
});

const router = Router();

// Enforce authentication & Candidate/Admin role across all candidate AI routes
router.use(requireAuth);
router.use(requireCandidate);

// 1. Cover Letter
router.post(
  "/cover-letter",
  requireAiEntitlement("COVER_LETTER"),
  validate({ body: generateCoverLetterSchema }),
  catchAsync(AIController.generateCoverLetter)
);

// 2. Cold Email
router.post(
  "/email",
  requireAiEntitlement("COLD_EMAIL"),
  validate({ body: generateEmailSchema }),
  catchAsync(AIController.generateEmail)
);

// 3. Resume Optimizer (Multipart PDF upload)
router.post(
  "/resume/optimize",
  requireAiEntitlement("RESUME_OPTIMIZER"),
  upload.single("resume"),
  validate({ body: optimizeResumeSchema }),
  catchAsync(AIController.optimizeResume)
);

// 4. CV Builder
router.post(
  "/cv/build",
  requireAiEntitlement("CV_BUILD"),
  validate({ body: buildCvSchema }),
  catchAsync(AIController.buildCv)
);

// 5. Product Recommender
router.post(
  "/recommend",
  requireAiEntitlement("PRODUCT_RECOMMEND"),
  validate({ body: recommendProductsSchema }),
  catchAsync(AIController.recommendProducts)
);

// 6. Career Advisor Chat
router.post(
  "/chat",
  requireAiEntitlement("CAREER_CHAT"),
  validate({ body: careerChatSchema }),
  catchAsync(AIController.careerChat)
);

export const aiRouter = router;
