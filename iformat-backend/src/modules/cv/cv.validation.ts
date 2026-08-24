import { z } from "zod";

export const createCVSchema = z.object({
  title: z.string().min(1, "Title is required").default("My Resume"),
  content: z.record(z.any()), // Structured CV JSON content
});

export const updateCVSchema = z.object({
  title: z.string().min(1, "Title is required").optional(),
  isDefault: z.boolean().optional(),
});

export const saveVersionSchema = z.object({
  content: z.record(z.any()),
});
