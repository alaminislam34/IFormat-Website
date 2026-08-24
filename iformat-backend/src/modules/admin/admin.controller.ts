import { Request, Response } from "express";
import { AdminService } from "./admin.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";

export class AdminController {
  static async getMetrics(_req: Request, res: Response) {
    const metrics = await AdminService.getPlatformMetrics();
    return ApiResponse.success(res, "Platform metrics retrieved", metrics);
  }

  static async listUsers(req: Request, res: Response) {
    const { users, meta } = await AdminService.listUsers(req.query as any);
    return ApiResponse.collection(res, "Users retrieved", users, meta);
  }

  static async banUser(req: Request, res: Response) {
    const { isBanned, reason } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const user = await AdminService.banUser(
      req.user!.id,
      req.params.id,
      Boolean(isBanned),
      reason,
      ipAddress
    );
    return ApiResponse.success(
      res,
      isBanned ? "User has been banned and sessions invalidated" : "User has been unbanned",
      user
    );
  }

  static async softDeleteUser(req: Request, res: Response) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const user = await AdminService.softDeleteUser(req.user!.id, req.params.id, ipAddress);
    return ApiResponse.success(res, "User has been soft-deleted successfully", user);
  }

  static async restoreUser(req: Request, res: Response) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const user = await AdminService.restoreUser(req.user!.id, req.params.id, ipAddress);
    return ApiResponse.success(res, "User account restored successfully", user);
  }

  static async forceVerifyEmail(req: Request, res: Response) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const user = await AdminService.forceVerifyEmail(req.user!.id, req.params.id, ipAddress);
    return ApiResponse.success(res, "User email address marked as verified", user);
  }

  static async listJobs(req: Request, res: Response) {
    const { jobs, meta } = await AdminService.listJobs(req.query as any);
    return ApiResponse.collection(res, "Jobs retrieved", jobs, meta);
  }

  static async updateJobStatus(req: Request, res: Response) {
    const { status } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const job = await AdminService.updateJobStatus(req.user!.id, req.params.id, status, ipAddress);
    return ApiResponse.success(res, "Job status updated", job);
  }

  static async softDeleteJob(req: Request, res: Response) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const job = await AdminService.softDeleteJob(req.user!.id, req.params.id, ipAddress);
    return ApiResponse.success(res, "Job posting soft-deleted", job);
  }

  static async restoreJob(req: Request, res: Response) {
    const ipAddress = req.ip || req.socket.remoteAddress;
    const job = await AdminService.restoreJob(req.user!.id, req.params.id, ipAddress);
    return ApiResponse.success(res, "Job posting restored", job);
  }

  static async toggleCompanyVerification(req: Request, res: Response) {
    const { isVerifiedCompany } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const user = await AdminService.toggleCompanyVerification(
      req.user!.id,
      req.params.userId,
      Boolean(isVerifiedCompany),
      ipAddress
    );
    return ApiResponse.success(
      res,
      isVerifiedCompany ? "Company verified badge granted" : "Company verification revoked",
      user
    );
  }

  static async overrideSubscription(req: Request, res: Response) {
    const { userId, planId, durationDays } = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;
    const sub = await AdminService.overrideSubscription(
      req.user!.id,
      userId,
      planId,
      durationDays,
      ipAddress
    );
    return ApiResponse.success(res, "Subscription manually assigned to user", sub);
  }

  static async listAuditLogs(req: Request, res: Response) {
    const { logs, meta } = await AdminService.listAuditLogs(req.query as any);
    return ApiResponse.collection(res, "Audit logs retrieved", logs, meta);
  }
}
