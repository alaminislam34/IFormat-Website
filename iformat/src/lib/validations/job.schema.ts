import { z } from "zod";

export const createJobSchema = z.object({
  title: z
    .string()
    .min(1, "Job Title is required")
    .min(3, "Title must be at least 3 characters"),
  company: z
    .string()
    .min(1, "Company Name is required")
    .min(2, "Company Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  jobType: z.enum(["Full Time", "Part Time", "Contract"]),
  location: z.enum(["Remote", "Onsite", "Hybrid"]),
  salary: z.string().min(1, "Salary range is required"),
  validity: z.string().min(1, "Job validity date is required"),
  description: z
    .string()
    .min(1, "Job description is required")
    .min(20, "Description must be at least 20 characters"),
  requirements: z.string().min(1, "Requirements are required"),
  niceToHave: z.string().optional(),
  perks: z.string().optional(),
});

export type CreateJobFormData = z.infer<typeof createJobSchema>;

export const applyJobSchema = z.object({
  candidateName: z.string().min(1, "Your name is required"),
  candidateEmail: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  coverNote: z.string().optional(),
});

export type ApplyJobFormData = z.infer<typeof applyJobSchema>;
