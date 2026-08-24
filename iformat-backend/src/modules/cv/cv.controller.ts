import { Request, Response } from "express";
import { CVService } from "./cv.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";

export class CVController {
  static async list(req: Request, res: Response) {
    const cvs = await CVService.listUserCVs(req.user!.id);
    return ApiResponse.success(res, "CVs retrieved successfully", cvs);
  }

  static async getById(req: Request, res: Response) {
    const cv = await CVService.getCVById(req.params.id, req.user!.id);
    return ApiResponse.success(res, "CV retrieved successfully", cv);
  }

  static async create(req: Request, res: Response) {
    const cv = await CVService.createCV(req.user!.id, req.body);
    return ApiResponse.success(res, "CV created successfully", cv, 201);
  }

  static async saveVersion(req: Request, res: Response) {
    const version = await CVService.saveNewVersion(
      req.params.id,
      req.user!.id,
      req.body.content
    );
    return ApiResponse.success(res, "CV version saved successfully", version, 201);
  }

  static async delete(req: Request, res: Response) {
    await CVService.deleteCV(req.params.id, req.user!.id);
    return ApiResponse.success(res, "CV deleted successfully");
  }
}
