import { Request, Response } from "express";
import { SettingService } from "./setting.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";
import { BadRequestError } from "../../errors/index.js";

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

  static async getContactInfo(req: Request, res: Response) {
    const contact = await SettingService.getContactInfo();
    return ApiResponse.success(res, "Contact info retrieved successfully", contact);
  }

  static async updateContactInfo(req: Request, res: Response) {
    const { location, phone, email } = req.body || {};
    const updatedById = (req as any).user?.id;
    const updated = await SettingService.updateContactInfo({ location, phone, email }, updatedById);
    return ApiResponse.success(res, "Contact info updated successfully", updated);
  }

  static async submitContactInquiry(req: Request, res: Response) {
    const { fullName, email, phone, message } = req.body || {};
    if (!fullName || !email || !message) {
      throw new BadRequestError("Full name, email, and message are required.");
    }
    const inquiry = await SettingService.submitContactInquiry({
      fullName,
      email,
      phone,
      message,
    });
    return ApiResponse.success(res, "Your message has been sent successfully. We will get back to you shortly.", inquiry, 201);
  }

  static async getContactInquiries(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;

    const data = await SettingService.getContactInquiries(page, limit, status, search);
    return ApiResponse.success(res, "Contact inquiries retrieved successfully", data);
  }

  static async updateContactInquiryStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      throw new BadRequestError("Status is required");
    }
    const updated = await SettingService.updateContactInquiryStatus(id, status);
    return ApiResponse.success(res, "Inquiry status updated", updated);
  }

  static async deleteContactInquiry(req: Request, res: Response) {
    const { id } = req.params;
    await SettingService.deleteContactInquiry(id);
    return ApiResponse.success(res, "Contact inquiry deleted successfully");
  }
}
