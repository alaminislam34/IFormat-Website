import { Request, Response } from "express";
import { ScreeningService } from "./screening.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";

export class ScreeningController {
  static async getResult(req: Request, res: Response) {
    const result = await ScreeningService.getScreeningResult(req.params.applicationId);
    return ApiResponse.success(res, "Screening result retrieved successfully", result);
  }

  static async triggerScreening(req: Request, res: Response) {
    const result = await ScreeningService.screenApplication(req.params.applicationId);
    return ApiResponse.success(res, "AI screening processed successfully", result);
  }
}
