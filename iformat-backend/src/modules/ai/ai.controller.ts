import { Request, Response } from "express";
import { AIService } from "./ai.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import {
  GenerateCoverLetterInput,
  GenerateEmailInput,
  OptimizeResumeInput,
} from "./ai.validation.js";

export class AIController {
  /**
   * POST /api/v1/ai/cover-letter
   */
  static async generateCoverLetter(req: Request, res: Response) {
    const input = req.body as GenerateCoverLetterInput;
    const letter = await AIService.generateCoverLetter(input);

    return ApiResponse.success(res, "Cover letter generated successfully", {
      letter,
    });
  }

  /**
   * POST /api/v1/ai/email
   */
  static async generateEmail(req: Request, res: Response) {
    const input = req.body as GenerateEmailInput;
    const email = await AIService.generateEmail(input);

    return ApiResponse.success(res, "Email template generated successfully", {
      email,
    });
  }

  /**
   * POST /api/v1/ai/resume/optimize
   */
  static async optimizeResume(req: Request, res: Response) {
    const input = req.body as OptimizeResumeInput;
    const summary = await AIService.optimizeResume(input);

    return ApiResponse.success(res, "Resume content optimized successfully", {
      summary,
    });
  }
}
