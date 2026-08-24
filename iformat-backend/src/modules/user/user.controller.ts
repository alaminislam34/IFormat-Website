import { Request, Response } from "express";
import { UserService } from "./user.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";

export class UserController {
  static async getMe(req: Request, res: Response) {
    const user = await UserService.getProfile(req.user!.id);
    return ApiResponse.success(res, "Profile retrieved successfully", user);
  }

  static async updateMe(req: Request, res: Response) {
    const user = await UserService.updateProfile(req.user!.id, req.body);
    return ApiResponse.success(res, "Profile updated successfully", user);
  }

  static async updateRole(req: Request, res: Response) {
    const user = await UserService.updateRole(req.user!.id, req.body.role);
    return ApiResponse.success(res, "Account role updated successfully", user);
  }

  static async updateCompany(req: Request, res: Response) {
    const user = await UserService.updateCompanyProfile(req.user!.id, req.body);
    return ApiResponse.success(res, "Company profile saved successfully", user);
  }
}
