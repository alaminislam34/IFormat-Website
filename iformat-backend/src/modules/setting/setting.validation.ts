import { z } from "zod";

export const updateSettingsSchema = z.object({
  settings: z
    .record(z.string(), z.any())
    .refine(
      (obj) => Object.keys(obj).length > 0,
      "At least one setting key-value pair is required"
    ),
});
