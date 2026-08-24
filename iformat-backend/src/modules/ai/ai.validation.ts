import { z } from "zod";

export const generateCoverLetterSchema = z.object({
  role: z.string().min(2, "Job role is required"),
  company: z.string().min(2, "Company name is required"),
  experienceContext: z.string().optional(),
  tone: z.enum(["professional", "enthusiastic", "concise", "creative"]).optional().default("professional"),
});

export const generateEmailSchema = z.object({
  recipientName: z.string().optional().default("Hiring Manager"),
  company: z.string().min(2, "Company name is required"),
  role: z.string().min(2, "Target position/role is required"),
  context: z.string().optional(),
  tone: z.enum(["formal", "friendly", "direct", "persuasive"]).optional().default("formal"),
});

export const optimizeResumeSchema = z.object({
  rawText: z.string().min(10, "Resume content is required"),
  targetRole: z.string().optional(),
  industry: z.string().optional(),
});

export type GenerateCoverLetterInput = z.infer<typeof generateCoverLetterSchema>;
export type GenerateEmailInput = z.infer<typeof generateEmailSchema>;
export type OptimizeResumeInput = z.infer<typeof optimizeResumeSchema>;
