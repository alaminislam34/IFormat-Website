import { Request, Response } from "express";
import { JobService } from "./job.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";

export class JobController {
  static async list(req: Request, res: Response) {
    const { jobs, meta } = await JobService.listJobs(req.query as any);
    return ApiResponse.collection(res, "Jobs retrieved successfully", jobs, meta);
  }

  static async getById(req: Request, res: Response) {
    const job = await JobService.getJobById(req.params.id, req.user);
    return ApiResponse.success(res, "Job retrieved successfully", job);
  }

  static async create(req: Request, res: Response) {
    const job = await JobService.createJob(req.user!.id, req.body);
    return ApiResponse.success(res, "Job created successfully", job, 201);
  }

  static async update(req: Request, res: Response) {
    const job = await JobService.updateJob(
      req.params.id,
      req.user!.id,
      req.body,
      req.user?.role
    );
    return ApiResponse.success(res, "Job updated successfully", job);
  }

  static async delete(req: Request, res: Response) {
    const result = await JobService.deleteJob(
      req.params.id,
      req.user!.id,
      req.user?.role
    );
    return ApiResponse.success(res, result.message);
  }

  static async listEmployerJobs(req: Request, res: Response) {
    const { jobs, meta } = await JobService.listEmployerJobs(
      req.user!.id,
      req.query as any
    );
    return ApiResponse.collection(res, "Employer jobs retrieved successfully", jobs, meta);
  }
}
