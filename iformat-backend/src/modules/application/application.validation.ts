import { z } from "zod";
import { ApplicationStatus } from "@prisma/client";

export const applyJobSchema = z.object({
  jobId: z.string({ required_error: "Job ID is required" }).min(1, "Job ID is required"),
  cvId: z.string().optional().nullable(),
  candidateName: z
    .string({ required_error: "Candidate name is required" })
    .min(2, "Candidate name must be at least 2 characters")
    .max(100, "Candidate name cannot exceed 100 characters"),
  candidateEmail: z
    .string({ required_error: "Candidate email is required" })
    .email("Please provide a valid email address"),
  coverNote: z
    .string()
    .max(2000, "Cover note cannot exceed 2000 characters")
    .optional()
    .nullable(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus, {
    required_error: "Application status is required",
  }),
  employerFeedback: z
    .string()
    .max(1000, "Employer feedback cannot exceed 1000 characters")
    .optional()
    .nullable(),
});

export const queryApplicationsSchema = z.object({
  status: z.nativeEnum(ApplicationStatus).optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

export type ApplyJobInput = z.infer<typeof applyJobSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
export type QueryApplicationsInput = z.infer<typeof queryApplicationsSchema>;
