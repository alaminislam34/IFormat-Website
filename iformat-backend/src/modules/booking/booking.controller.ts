import { Request, Response } from "express";
import { BookingService } from "./booking.service.js";
import { ApiResponse } from "../../utils/apiResponse.js";

export class BookingController {
  static async listAvailableSlots(_req: Request, res: Response) {
    const slots = await BookingService.listAvailableSlots();
    return ApiResponse.success(res, "Available consultation slots retrieved", slots);
  }

  static async createSlot(req: Request, res: Response) {
    const slot = await BookingService.createSlot(req.user!.id, req.body);
    return ApiResponse.success(res, "Consultation slot created successfully", slot, 201);
  }

  static async bookSlot(req: Request, res: Response) {
    const booking = await BookingService.bookSlot(req.user!.id, req.body);
    return ApiResponse.success(res, "Consultation booked successfully", booking, 201);
  }

  static async listMyBookings(req: Request, res: Response) {
    const bookings = await BookingService.listUserBookings(req.user!);
    return ApiResponse.success(res, "Bookings retrieved successfully", bookings);
  }

  static async checkoutService(req: Request, res: Response) {
    const result = await BookingService.createServiceOrderCheckout(req.user!.id, req.body);
    return ApiResponse.success(res, "Service order checkout initiated successfully", result, 201);
  }

  static async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status, reason } = req.body;
    const updated = await BookingService.updateBookingStatus(id, status, req.user!, reason);
    return ApiResponse.success(res, "Booking status updated successfully", updated);
  }

  static async requestFreeConsult(req: Request, res: Response) {
    const booking = await BookingService.requestFreeConsultation(
      req.user ? req.user.id : null,
      req.body
    );
    return ApiResponse.success(res, "Free consultation request submitted successfully", booking, 201);
  }
}
