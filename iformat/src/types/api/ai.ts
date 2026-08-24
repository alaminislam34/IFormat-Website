export type EmailTone = "Professional" | "Friendly" | "Confident" | "Concise";

export interface GenerateCoverLetterRequest {
  candidateName?: string;
  role: string;
  company: string;
  recipient?: string;
  experienceContext: string;
  tone?: EmailTone;
}

export interface GenerateEmailRequest {
  role: string;
  company: string;
  recipient?: string;
  context: string;
  tone: EmailTone;
}

export interface OptimizeResumeRequest {
  rawText: string;
  targetRole?: string;
  targetIndustry?: string;
}

export interface AIResponse<T = string> {
  result: T;
  tokensUsed?: number;
  model?: string;
}
