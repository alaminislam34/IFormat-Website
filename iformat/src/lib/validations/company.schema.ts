import { z } from "zod";

export const companyDetailsSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company Name is required")
    .min(2, "Company Name must be at least 2 characters"),
  email: z
    .string()
    .min(1, "Company Email is required")
    .email("Please enter a valid company email address"),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .min(6, "Please enter a valid phone number"),
  description: z
    .string()
    .min(1, "Company description is required")
    .min(15, "Please provide at least 15 characters of description"),
});

export type CompanyDetailsFormData = z.infer<typeof companyDetailsSchema>;
