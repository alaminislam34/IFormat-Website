import { Request, Response } from "express";
import { AIService } from "./ai.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { BadRequestError } from "../../errors/index.js";
import {
  GenerateCoverLetterInput,
  GenerateEmailInput,
  OptimizeResumeInput,
  BuildCvInput,
  RecommendProductsInput,
  CareerChatInput,
} from "./ai.validation.js";

export class AIController {
  /**
   * POST /api/v1/ai/cover-letter
   */
  static async generateCoverLetter(req: Request, res: Response) {
    const input = req.body as GenerateCoverLetterInput;
    const userId = (req as any).user?.id;
    const result = await AIService.generateCoverLetter(input, userId);

    return ApiResponse.success(res, "Cover letter generated successfully", result);
  }

  /**
   * POST /api/v1/ai/email
   */
  static async generateEmail(req: Request, res: Response) {
    const input = req.body as GenerateEmailInput;
    const result = await AIService.generateEmail(input);

    return ApiResponse.success(res, "Email template generated successfully", result);
  }

  /**
   * POST /api/v1/ai/resume/optimize
   */
  static async optimizeResume(req: Request, res: Response) {
    const input = req.body as OptimizeResumeInput;

    if (!req.file || !req.file.buffer) {
      throw new BadRequestError("Please upload a PDF resume file in the 'resume' form field.");
    }

    if (req.file.mimetype !== "application/pdf") {
      throw new BadRequestError("Only PDF files (.pdf) are supported for resume optimization.");
    }

    const result = await AIService.optimizeResume(
      input,
      req.file.buffer,
      req.file.originalname || "resume.pdf"
    );

    return ApiResponse.success(res, "Resume optimized successfully", result);
  }

  /**
   * POST /api/v1/ai/cv/build
   */
  static async buildCv(req: Request, res: Response) {
    const input = req.body as BuildCvInput;
    const userId = (req as any).user?.id;
    const result = await AIService.buildCV(input, userId);

    return ApiResponse.success(res, "CV built and formatted successfully", result);
  }

  /**
   * POST /api/v1/ai/recommend
   */
  static async recommendProducts(req: Request, res: Response) {
    const input = req.body as RecommendProductsInput;
    const result = await AIService.recommendProducts(input);

    return ApiResponse.success(res, "Product recommendations generated successfully", result);
  }

  /**
   * POST /api/v1/ai/chat
   */
  static async careerChat(req: Request, res: Response) {
    const input = req.body as CareerChatInput;
    const userId = (req as any).user?.id;
    const result = await AIService.careerChat(input, userId);

    return ApiResponse.success(res, "Career Advisor response generated successfully", result);
  }
}
