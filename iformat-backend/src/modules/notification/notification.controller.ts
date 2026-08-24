import { Request, Response } from "express";
import { NotificationService } from "./notification.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";

export class NotificationController {
  static async getMyNotifications(req: Request, res: Response) {
    const notifications = await NotificationService.getUserNotifications(req.user!.id);
    return ApiResponse.success(res, "Notifications retrieved successfully", notifications);
  }

  static async markRead(req: Request, res: Response) {
    await NotificationService.markAsRead(req.params.id, req.user!.id);
    return ApiResponse.success(res, "Notification marked as read");
  }

  static async markAllRead(req: Request, res: Response) {
    await NotificationService.markAllAsRead(req.user!.id);
    return ApiResponse.success(res, "All notifications marked as read");
  }
}
