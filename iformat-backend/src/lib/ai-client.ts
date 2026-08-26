import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { InternalServerError, BadRequestError } from "../errors/index.js";

// ==========================================
// Types & Contracts (FastAPI Bedrock Service)
// ==========================================

export interface ScreeningScoreBreakdown {
  skills: number;
  experience: number;
  education: number;
  domainMatch: number;
}

export interface ScreeningEvidence {
  category: "skills" | "experience" | "education" | "domain_match" | string;
  finding: string;
  source: string;
}

export interface ScreeningRequest {
  user_info: Record<string, any>;
  cv_json: Record<string, any>;
  job_description: string;
}

export interface ScreeningResponse {
  model: string;
  tokensUsed: number;
  score: number;
  recommendation: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  scoreBreakdown: ScreeningScoreBreakdown;
  evidence: ScreeningEvidence[];
}

export interface CoverLetterRequest {
  candidateProfile: Record<string, any>;
  role: string;
  company: string;
  recipient: string;
  jobDescription: string;
  tone: string;
}

export interface CoverLetterResponse {
  model: string;
  tokensUsed: number;
  letter: string;
}

export interface ColdEmailRequest {
  recipient: string;
  role: string;
  company: string;
  context: string;
  tone: string;
}

export interface ColdEmailResponse {
  model: string;
  tokensUsed: number;
  email: string;
}

export interface ResumeOptimizerRequest {
  resumeBuffer: Buffer;
  fileName?: string;
  targetRole: string;
  targetIndustry: string;
  jobDescription: string;
}

export interface ResumeOptimizerResponse {
  model: string;
  tokensUsed: number;
  summary: string;
  fileName: string;
  contentType: string;
  pdfBase64: string;
}

export interface CVBuilderRequest {
  user_info: Record<string, any>;
  raw_notes: string;
  targetRole: string;
  targetIndustry: string;
  jobDescription?: string | null;
}

export interface CVBuilderResponse {
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

export interface ProductCatalogItem {
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
  productCatalog: ProductCatalogItem[];
}

export interface ProductRecommendation {
  productId: string;
  name: string;
  reason: string;
  fitScore: number;
}

export interface ProductRecommenderResponse {
  model: string;
  tokensUsed: number;
  recommendations: ProductRecommendation[];
}

export interface CareerContextSource {
  sourceId: string;
  title: string;
  content: string;
}

export interface CareerChatMessage {
  role: "ai" | "assistant" | "human" | "user";
  content: string;
}

export interface CareerChatSourceReference {
  sourceId: string;
  title: string;
}

export interface CareerChatRequest {
  query: string;
  user_info: Record<string, any>;
  contextSources?: CareerContextSource[];
  chat_history?: CareerChatMessage[] | null;
}

export interface CareerChatResponse {
  model: string;
  tokensUsed: number;
  response: string;
  supported: boolean;
  sources: CareerChatSourceReference[];
}

// ==========================================
// AI Microservice Client Class
// ==========================================

export class AIClient {
  private static baseUrl = env.AI_SERVICE_URL.replace(/\/+$/, "");
  private static timeoutMs = env.AI_SERVICE_TIMEOUT_MS || 60000;

  /**
   * Universal JSON POST helper with timeout and detailed error diagnostics
   */
  private static async postJson<TReq, TRes>(path: string, body: TReq): Promise<TRes> {
    const url = `${this.baseUrl}${path}`;
    logger.info(`🤖 [AIClient] POST ${url}`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        let errorBody: any;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = await response.text();
        }

        logger.error(`❌ [AIClient] HTTP ${response.status} from ${url}:`, errorBody);

        if (response.status === 422) {
          throw new BadRequestError(`Validation error from AI service: ${JSON.stringify(errorBody.detail || errorBody)}`);
        }

        throw new InternalServerError(
          `AI service responded with status ${response.status}: ${JSON.stringify(errorBody)}`
        );
      }

      return (await response.json()) as TRes;
    } catch (error: any) {
      clearTimeout(timer);
      if (error.name === "AbortError") {
        logger.error(`⏱️ [AIClient] Request to ${url} timed out after ${this.timeoutMs}ms`);
        throw new InternalServerError(`AI service request timed out after ${this.timeoutMs}ms.`);
      }
      logger.error(`❌ [AIClient] Connection error communicating with AI service at ${url}:`, error);
      throw error;
    }
  }

  /**
   * 1. Screen Candidate CV against Job Description
   */
  static async screenCandidate(data: ScreeningRequest): Promise<ScreeningResponse> {
    return this.postJson<ScreeningRequest, ScreeningResponse>("/api/v1/ai/screen", data);
  }

  /**
   * 2. Generate Tailored Cover Letter
   */
  static async generateCoverLetter(data: CoverLetterRequest): Promise<CoverLetterResponse> {
    return this.postJson<CoverLetterRequest, CoverLetterResponse>("/api/v1/ai/cover-letter", data);
  }

  /**
   * 3. Generate Cold Outreach Email
   */
  static async generateColdEmail(data: ColdEmailRequest): Promise<ColdEmailResponse> {
    return this.postJson<ColdEmailRequest, ColdEmailResponse>("/api/v1/ai/email", data);
  }

  /**
   * 4. Optimize Resume (Multipart PDF Upload)
   */
  static async optimizeResume(data: ResumeOptimizerRequest): Promise<ResumeOptimizerResponse> {
    const url = `${this.baseUrl}/api/v1/ai/resume/optimize`;
    logger.info(`🤖 [AIClient] POST (multipart) ${url}`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(data.resumeBuffer)], { type: "application/pdf" });
      formData.append("resume", blob, data.fileName || "resume.pdf");
      formData.append("targetRole", data.targetRole);
      formData.append("targetIndustry", data.targetIndustry);
      formData.append("jobDescription", data.jobDescription);

      const response = await fetch(url, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!response.ok) {
        let errorBody: any;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = await response.text();
        }

        logger.error(`❌ [AIClient] HTTP ${response.status} from ${url}:`, errorBody);

        if (response.status === 413) {
          throw new BadRequestError("The uploaded resume PDF exceeds the 10 MB limit.");
        }
        if (response.status === 422) {
          throw new BadRequestError(`Invalid resume PDF: ${JSON.stringify(errorBody.detail || errorBody)}`);
        }

        throw new InternalServerError(
          `AI service responded with status ${response.status}: ${JSON.stringify(errorBody)}`
        );
      }

      return (await response.json()) as ResumeOptimizerResponse;
    } catch (error: any) {
      clearTimeout(timer);
      if (error.name === "AbortError") {
        logger.error(`⏱️ [AIClient] Request to ${url} timed out after ${this.timeoutMs}ms`);
        throw new InternalServerError(`AI resume optimization timed out after ${this.timeoutMs}ms.`);
      }
      throw error;
    }
  }

  /**
   * 5. Build ATS-friendly CV & PDF
   */
  static async buildCV(data: CVBuilderRequest): Promise<CVBuilderResponse> {
    return this.postJson<CVBuilderRequest, CVBuilderResponse>("/api/v1/ai/cv/build", data);
  }

  /**
   * 6. Recommend Products based on Candidate Profile
   */
  static async recommendProducts(data: ProductRecommenderRequest): Promise<ProductRecommenderResponse> {
    return this.postJson<ProductRecommenderRequest, ProductRecommenderResponse>("/api/v1/ai/recommend", data);
  }

  /**
   * 7. Query Career Advisor Chatbot
   */
  static async queryCareerAdvisor(data: CareerChatRequest): Promise<CareerChatResponse> {
    return this.postJson<CareerChatRequest, CareerChatResponse>("/api/v1/ai/chat", data);
  }
}
