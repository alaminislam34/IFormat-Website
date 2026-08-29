import { Request, Response } from "express";
import { SettingService } from "./setting.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";

export class SettingController {
  static async getSettings(req: Request, res: Response) {
    const settings = await SettingService.getAllSettings();
    return ApiResponse.success(res, "System settings retrieved successfully", settings);
  }

  static async updateSettings(req: Request, res: Response) {
    const payload = req.body?.settings || req.body;
    const updatedById = (req as any).user?.id;
    const settings = await SettingService.updateSettings(payload, updatedById);
    return ApiResponse.success(res, "System settings updated successfully", settings);
  }
}
