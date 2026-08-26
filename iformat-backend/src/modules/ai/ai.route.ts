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
import { catchAsync } from "../../utils/catchAsync.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB maximum
  },
});

const router = Router();

// 1. Cover Letter
router.post(
  "/cover-letter",
  validate({ body: generateCoverLetterSchema }),
  catchAsync(AIController.generateCoverLetter)
);

// 2. Cold Email
router.post(
  "/email",
  validate({ body: generateEmailSchema }),
  catchAsync(AIController.generateEmail)
);

// 3. Resume Optimizer (Multipart PDF upload)
router.post(
  "/resume/optimize",
  upload.single("resume"),
  validate({ body: optimizeResumeSchema }),
  catchAsync(AIController.optimizeResume)
);

// 4. CV Builder
router.post(
  "/cv/build",
  validate({ body: buildCvSchema }),
  catchAsync(AIController.buildCv)
);

// 5. Product Recommender
router.post(
  "/recommend",
  validate({ body: recommendProductsSchema }),
  catchAsync(AIController.recommendProducts)
);

// 6. Career Advisor Chat
router.post(
  "/chat",
  validate({ body: careerChatSchema }),
  catchAsync(AIController.careerChat)
);

export const aiRouter = router;
