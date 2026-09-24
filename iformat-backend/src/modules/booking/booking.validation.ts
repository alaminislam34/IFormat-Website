import { z } from "zod";

export const createSlotSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").default("CV & Career Strategy Session"),
  startTime: z.string().datetime("Must be a valid ISO datetime"),
  endTime: z.string().datetime("Must be a valid ISO datetime"),
  priceInCents: z.number().int().nonnegative().default(4900),
});

export const bookSlotSchema = z.object({
  slotId: z.string().min(1, "Slot ID is required"),
  notes: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "COMPLETED", "CANCELLED", "PENDING"]),
  reason: z.string().max(1000).optional(),
});

export const createServiceOrderSchema = z.object({
  serviceId: z.string().min(1, "Service ID is required"),
  serviceTitle: z.string().min(1, "Service Title is required"),
  priceInCents: z.number().int().positive("Price must be greater than 0"),
  requirements: z.string().optional(),
  clientPhone: z.string().optional(),
  notes: z.string().optional(),
});

export const freeConsultSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email address is required"),
  phone: z.string().min(6, "Contact phone number is required"),
  address: z.string().min(2, "Address or location is required"),
  description: z.string().min(10, "Please provide at least 10 characters describing your consultation goals"),
});

