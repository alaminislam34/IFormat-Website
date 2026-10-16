import { z } from "zod";
import { JobStatus } from "@prisma/client";
import { JOB_CATEGORIES, LEGACY_CATEGORY_MAP, WORK_MODES } from "../../config/job-options.js";

// Old clients may still send a pre-update category name; map it instead of rejecting.
const categorySchema = z.preprocess(
  (val) => (typeof val === "string" ? LEGACY_CATEGORY_MAP[val] ?? val : val),
  z.enum(JOB_CATEGORIES, { errorMap: () => ({ message: "Please choose a valid job category" }) })
);
const placeSchema = z.string().trim().max(80).optional().nullable();

const baseJobSchema = z.object({
  title: z
    .string({ required_error: "Job title is required" })
    .min(3, "Job title must be at least 3 characters")
    .max(100, "Job title cannot exceed 100 characters"),
  company: z
    .string()
    .min(2, "Company name must be at least 2 characters")
    .max(100, "Company name cannot exceed 100 characters")
    .optional(),
  category: categorySchema.default("Executive Leadership & Management"),
  jobType: z.string().default("Full Time"),
  workplaceType: z.enum(WORK_MODES).default("Remote"),
  country: placeSchema,
  city: placeSchema,
  location: z.string().trim().max(120).optional(),
  salary: z.string().default("Competitive"),
  salaryMin: z.number().int().positive().optional(),
  salaryMax: z.number().int().positive().optional(),
  validity: z
    .string()
    .optional()
    .nullable()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Validity must be a valid date string",
    }),
  description: z
    .string({ required_error: "Job description is required" })
    .min(20, "Job description must be at least 20 characters"),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  niceToHave: z.array(z.string()).default([]),
  perks: z.array(z.string()).default([]),
  status: z.nativeEnum(JobStatus).default(JobStatus.PUBLISHED),
});

export const createJobSchema = baseJobSchema.refine(
  (data) => data.workplaceType === "Remote" || !!data.country?.trim(),
  { message: "Country is required for Onsite and Hybrid jobs", path: ["country"] }
);

export const updateJobSchema = baseJobSchema.partial().extend({
  status: z.nativeEnum(JobStatus).optional(),
});

export const queryJobsSchema = z.object({
  search: z.string().optional(),
  company: z.string().optional(),
  category: z.string().optional(),
  jobType: z.string().optional(),
  workplaceType: z.string().optional(),
  location: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type QueryJobsInput = z.infer<typeof queryJobsSchema>;
