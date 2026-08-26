export type EmailTone = "Professional" | "Friendly" | "Confident" | "Concise" | "formal" | "professional" | string;

export interface GenerateCoverLetterRequest {
  candidateName?: string;
  role: string;
  company: string;
  recipient?: string;
  jobDescription?: string;
  experienceContext?: string;
  tone?: EmailTone;
  candidateProfile?: Record<string, any>;
}

export interface CoverLetterResponseDTO {
  model: string;
  tokensUsed: number;
  letter: string;
}

export interface GenerateEmailRequest {
  recipient: string;
  recipientName?: string;
  role: string;
  company: string;
  context: string;
  tone: EmailTone;
}

export interface ColdEmailResponseDTO {
  model: string;
  tokensUsed: number;
  email: string;
}

export interface OptimizeResumeRequest {
  file?: File;
  targetRole: string;
  targetIndustry: string;
  jobDescription: string;
}

export interface ResumeOptimizerResponseDTO {
  model: string;
  tokensUsed: number;
  summary: string;
  fileName: string;
  contentType: string;
  pdfBase64: string;
}

export interface BuildCvRequest {
  user_info?: Record<string, any>;
  raw_notes: string;
  targetRole: string;
  targetIndustry: string;
  jobDescription?: string | null;
}

export interface BuildCvResponseDTO {
  model: string;
  tokensUsed: number;
  personal: Record<string, any>;
  experiences: any[];
  education: any[];
  skills: string[];
  missingInformation: string[];
  fileName: string;
  contentType: string;
  pdfBase64: string;
}

export interface ProductCatalogItemDTO {
  productId: string;
  name: string;
  description: string;
  targetRoles?: string[];
  targetLevels?: string[];
  metadata?: Record<string, any>;
}

export interface ProductRecommenderRequest {
  job_title: string;
  experience_level: string;
  career_goals: string;
  skills?: string[];
  industry: string;
  productCatalog?: ProductCatalogItemDTO[];
}

export interface ProductRecommendationDTO {
  productId: string;
  name: string;
  reason: string;
  fitScore: number;
}

export interface ProductRecommenderResponseDTO {
  model: string;
  tokensUsed: number;
  recommendations: ProductRecommendationDTO[];
}

export interface CareerChatMessageDTO {
  role: "ai" | "assistant" | "human" | "user";
  content: string;
}

export interface CareerContextSourceDTO {
  sourceId: string;
  title: string;
  content: string;
}

export interface CareerChatRequest {
  query: string;
  user_info?: Record<string, any>;
  contextSources?: CareerContextSourceDTO[];
  chat_history?: CareerChatMessageDTO[] | null;
}

export interface CareerChatResponseDTO {
  model: string;
  tokensUsed: number;
  response: string;
  supported: boolean;
  sources: Array<{ sourceId: string; title: string }>;
}
