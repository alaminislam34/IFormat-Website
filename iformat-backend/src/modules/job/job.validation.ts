import { z } from "zod";
import { JobStatus } from "@prisma/client";

export const createJobSchema = z.object({
  title: z
    .string({ required_error: "Job title is required" })
    .min(3, "Job title must be at least 3 characters")
    .max(100, "Job title cannot exceed 100 characters"),
  company: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name cannot exceed 100 characters")
    .optional(),
  category: z.string().default("Technology & Engineering"),
  jobType: z.string().default("Full Time"),
  workplaceType: z.string().default("Remote"),
  location: z.string().default("Remote"),
  salary: z.string().default("Competitive"),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  salaryCurrency: z.string().default("USD"),
  validity: z
    .string()
    .datetime({ message: "Validity must be a valid ISO date" })
    .optional()
    .nullable(),
  description: z
    .string({ required_error: "Job description is required" })
    .min(20, "Job description must be at least 20 characters"),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  niceToHave: z.array(z.string()).default([]),
  perks: z.array(z.string()).default([]),
  status: z.nativeEnum(JobStatus).default(JobStatus.PUBLISHED),
});

export const updateJobSchema = createJobSchema.partial().extend({
  status: z.nativeEnum(JobStatus).optional(),
});

export const queryJobsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  jobType: z.string().optional(),
  workplaceType: z.string().optional(),
  location: z.string().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type QueryJobsInput = z.infer<typeof queryJobsSchema>;
