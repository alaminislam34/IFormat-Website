import { Request, Response } from "express";
import { ApplicationService } from "./application.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";

export class ApplicationController {
  static async apply(req: Request, res: Response) {
    const application = await ApplicationService.apply(req.user!.id, req.body);
    return ApiResponse.success(
      res,
      "Application submitted successfully",
      application,
      201
    );
  }

  static async listCandidateApplications(req: Request, res: Response) {
    const { applications, meta } =
      await ApplicationService.listCandidateApplications(
        req.user!.id,
        req.query as any
      );
    return ApiResponse.collection(
      res,
      "Applications retrieved successfully",
      applications,
      meta
    );
  }

  static async listJobApplications(req: Request, res: Response) {
    const { applications, meta } = await ApplicationService.listJobApplications(
      req.params.jobId,
      req.user!.id,
      req.query as any,
      req.user?.role
    );
    return ApiResponse.collection(
      res,
      "Job applications retrieved successfully",
      applications,
      meta
    );
  }

  static async updateStatus(req: Request, res: Response) {
    const updated = await ApplicationService.updateStatus(
      req.params.id,
      req.user!.id,
      req.body,
      req.user?.role
    );
    return ApiResponse.success(
      res,
      "Application status updated successfully",
      updated
    );
  }
}
