import { Router } from "express";
import multer from "multer";
import { AiFeature } from "@prisma/client";
import { trackAi } from "../../lib/ai-context.js";
import { AIController } from "./ai.controller.js";
import {
  generateCoverLetterSchema,
  generateEmailSchema,
  optimizeResumeSchema,
  buildCvSchema,
  recommendProductsSchema,
  careerChatSchema,
  analyzeJobFitSchema,
  aiFeedbackSchema,
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
  trackAi(AiFeature.COVER_LETTER),
  validate({ body: generateCoverLetterSchema }),
  catchAsync(AIController.generateCoverLetter)
);

// 2. Cold Email
router.post(
  "/email",
  requireAiEntitlement("COLD_EMAIL"),
  trackAi(AiFeature.COLD_EMAIL),
  validate({ body: generateEmailSchema }),
  catchAsync(AIController.generateEmail)
);

// 3. Resume Optimizer (Multipart PDF upload)
router.post(
  "/resume/optimize",
  requireAiEntitlement("RESUME_OPTIMIZER"),
  trackAi(AiFeature.RESUME_OPTIMIZER),
  upload.single("resume"),
  validate({ body: optimizeResumeSchema }),
  catchAsync(AIController.optimizeResume)
);

// 4. CV Builder
router.post(
  "/cv/build",
  requireAiEntitlement("CV_BUILD"),
  trackAi(AiFeature.CV_BUILD),
  validate({ body: buildCvSchema }),
  catchAsync(AIController.buildCv)
);

// 5. Product Recommender
router.post(
  "/recommend",
  requireAiEntitlement("PRODUCT_RECOMMEND"),
  trackAi(AiFeature.PRODUCT_RECOMMEND),
  validate({ body: recommendProductsSchema }),
  catchAsync(AIController.recommendProducts)
);

// 6. Career Advisor Chat
router.post(
  "/chat",
  requireAiEntitlement("CAREER_CHAT"),
  trackAi(AiFeature.CAREER_CHAT),
  validate({ body: careerChatSchema }),
  catchAsync(AIController.careerChat)
);

// 7. Candidate Job Fit Analyzer
router.post(
  "/analyze-job",
  requireAiEntitlement("JOB_ANALYSIS"),
  trackAi(AiFeature.JOB_ANALYSIS),
  validate({ body: analyzeJobFitSchema }),
  catchAsync(AIController.analyzeJobFit)
);

// 8. Rate an AI result (thumbs up / down)
router.post(
  "/feedback",
  validate({ body: aiFeedbackSchema }),
  catchAsync(AIController.submitFeedback)
);

export const aiRouter = router;
