import { z } from "zod";
import { Role } from "@prisma/client";

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url("Must be a valid URL").optional(),
});

export const updateRoleSchema = z.object({
  role: z.enum([Role.CANDIDATE, Role.EMPLOYER]),
});

export const updateCompanyProfileSchema = z.object({
  companyName: z.string().min(2, "Company name is required"),
  companyWebsite: z.string().url("Must be a valid URL").optional(),
  companyDescription: z.string().optional(),
  companyLogoUrl: z.string().optional(),
});
