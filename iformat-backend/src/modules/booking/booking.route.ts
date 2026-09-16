import { Router } from "express";
import { BookingController } from "./booking.controller.js";
import {
  createSlotSchema,
  bookSlotSchema,
  updateBookingStatusSchema,
  createServiceOrderSchema,
} from "./booking.validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/rbac.middleware.js";
import { Role } from "@prisma/client";
import { catchAsync } from "../../utils/catchAsync.js";

const router = Router();

// Publicly viewable available slots
router.get("/slots", catchAsync(BookingController.listAvailableSlots));

// Protected user routes
router.use(requireAuth);

// Candidate / User orders a professional service package with direct checkout
router.post(
  "/checkout",
  validate({ body: createServiceOrderSchema }),
  catchAsync(BookingController.checkoutService)
);

// Candidate views booked consultations & service orders
router.get("/mine", catchAsync(BookingController.listMyBookings));

// Candidate books a consultation
router.post(
  "/book",
  validate({ body: bookSlotSchema }),
  catchAsync(BookingController.bookSlot)
);

// Advisors & Admins create availability slots
router.post(
  "/slots",
  requireRole(Role.ADMIN, Role.EMPLOYER),
  validate({ body: createSlotSchema }),
  catchAsync(BookingController.createSlot)
);

// Update booking status (Admins, Advisors for their slot, or Candidates cancelling their own)
router.patch(
  "/:id/status",
  validate({ body: updateBookingStatusSchema }),
  catchAsync(BookingController.updateStatus)
);

export const bookingRouter = router;
