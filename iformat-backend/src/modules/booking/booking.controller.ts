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
    const bookings = await BookingService.listUserBookings(req.user!.id);
    return ApiResponse.success(res, "Bookings retrieved successfully", bookings);
  }
}
