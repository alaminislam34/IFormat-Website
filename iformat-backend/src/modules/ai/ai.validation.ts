import { z } from "zod";

export const generateCoverLetterSchema = z.object({
  role: z.string().min(1, "Job role is required").max(300),
  company: z.string().min(1, "Company name is required").max(300),
  recipient: z.string().max(300).optional().default("Hiring Manager"),
  jobDescription: z.string().max(50000).optional(),
  experienceContext: z.string().max(50000).optional(), // Backwards compatibility with previous UI state
  tone: z.string().max(100).optional().default("professional"),
  candidateProfile: z.record(z.any()).optional(),
});

export const generateEmailSchema = z.object({
  recipient: z.string().max(300).optional(),
  recipientName: z.string().max(300).optional(), // Backwards compatibility
  role: z.string().min(1, "Target position/role is required").max(300),
  company: z.string().min(1, "Company name is required").max(300),
  context: z.string().max(30000).optional().default(""),
  tone: z.string().max(100).optional().default("Professional"),
});

export const optimizeResumeSchema = z.object({
  targetRole: z.string().min(1, "Target role is required").max(300),
  targetIndustry: z.string().min(1, "Target industry is required").max(300),
  jobDescription: z.string().min(1, "Job description is required").max(50000),
});

export const buildCvSchema = z.object({
  user_info: z.record(z.any()).optional(),
  raw_notes: z.string().min(1, "Notes or experience bullets are required").max(100000),
  targetRole: z.string().min(1, "Target role is required").max(300),
  targetIndustry: z.string().min(1, "Target industry is required").max(300),
  jobDescription: z.string().max(50000).optional().nullable(),
});

export const productCatalogItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  targetRoles: z.array(z.string()).optional(),
  targetLevels: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const recommendProductsSchema = z.object({
  job_title: z.string().min(1, "Job title is required").max(300),
  experience_level: z.string().min(1, "Experience level is required").max(200),
  career_goals: z.string().min(1, "Career goals are required").max(20000),
  skills: z.array(z.string()).max(200).optional().default([]),
  industry: z.string().min(1, "Industry is required").max(300),
  productCatalog: z.array(productCatalogItemSchema).max(500).optional(),
});

export const careerChatMessageSchema = z.object({
  role: z.enum(["ai", "assistant", "human", "user"]),
  content: z.string().min(1).max(20000),
});

export const careerContextSourceSchema = z.object({
  sourceId: z.string().min(1),
  title: z.string().min(1),
  content: z.string().min(1),
});

export const careerChatSchema = z.object({
  query: z.string().min(1, "Query is required").max(20000),
  user_info: z.record(z.any()).optional(),
  contextSources: z.array(careerContextSourceSchema).max(100).optional(),
  chat_history: z.array(careerChatMessageSchema).max(100).optional().nullable(),
});

export type GenerateCoverLetterInput = z.infer<typeof generateCoverLetterSchema>;
export type GenerateEmailInput = z.infer<typeof generateEmailSchema>;
export type OptimizeResumeInput = z.infer<typeof optimizeResumeSchema>;
export type BuildCvInput = z.infer<typeof buildCvSchema>;
export type RecommendProductsInput = z.infer<typeof recommendProductsSchema>;
export type CareerChatInput = z.infer<typeof careerChatSchema>;
