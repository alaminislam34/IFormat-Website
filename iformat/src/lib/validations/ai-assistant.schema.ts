import { z } from "zod";

/**
 * Resume Step 1: Personal Info Validation Schema
 */
export const resumePersonalInfoSchema = z.object({
  fullName: z.string().trim().min(2, "Full name is required (at least 2 characters)"),
  jobTitle: z.string().trim().min(2, "Job title is required (e.g. Full Stack Developer)"),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().min(5, "Phone number is required (at least 5 characters)"),
  location: z.string().trim().optional(),
  website: z.string().trim().optional(),
});

export type ResumePersonalInfoFormData = z.infer<typeof resumePersonalInfoSchema>;

/**
 * Resume Step 2: Summary Validation Schema
 */
export const resumeSummarySchema = z.object({
  summary: z
    .string()
    .trim()
    .min(15, "Please write at least 15 characters about your experience so AI has sufficient context"),
});

export type ResumeSummaryFormData = z.infer<typeof resumeSummarySchema>;

/**
 * Resume Step 3: Work Experience Item Validation Schema
 */
export const resumeWorkExperienceItemSchema = z.object({
  role: z.string().trim().min(2, "Role / Title is required"),
  company: z.string().trim().min(2, "Company name is required"),
  duration: z.string().trim().optional(),
  location: z.string().trim().optional(),
  description: z
    .string()
    .trim()
    .min(10, "Please provide key responsibilities or achievements (at least 10 characters)"),
});

/**
 * Resume Step 4: Education Item Validation Schema
 */
export const resumeEducationItemSchema = z.object({
  degree: z.string().trim().min(2, "Degree or certification is required"),
  institution: z.string().trim().min(2, "School / University / Institution is required"),
  duration: z.string().trim().optional(),
  location: z.string().trim().optional(),
});

/**
 * Resume Step 5: Skill Group Validation Schema
 */
export const resumeSkillGroupSchema = z.object({
  category: z.string().trim().min(2, "Skill category name is required"),
  skills: z.string().trim().min(2, "Please list at least one skill or technology"),
});

/**
 * Cover Letter Generator Validation Schema
 */
export const coverLetterInputSchema = z.object({
  role: z.string().trim().min(2, "Target job position is required"),
  company: z.string().trim().min(2, "Company name is required"),
  recipient: z.string().trim().optional().default("Hiring Manager"),
  jobDescription: z.string().trim().optional(),
  tone: z.string().optional().default("professional"),
});

export type CoverLetterInputFormData = z.infer<typeof coverLetterInputSchema>;

/**
 * Outreach Email Generator Validation Schema
 */
export const outreachEmailInputSchema = z.object({
  role: z.string().trim().min(2, "Target position is required"),
  company: z.string().trim().min(2, "Target company name is required"),
  recipient: z.string().trim().min(2, "Recipient name or title is required"),
  context: z.string().trim().optional(),
  tone: z.string().optional().default("Professional"),
});

export type OutreachEmailInputFormData = z.infer<typeof outreachEmailInputSchema>;
