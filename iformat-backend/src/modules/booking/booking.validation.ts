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
