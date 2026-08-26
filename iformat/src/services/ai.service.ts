import { apiClient } from "@/lib/api/api-client";
import { mockDb } from "@/lib/api/mock-adapter";
import {
  GenerateCoverLetterRequest,
  CoverLetterResponseDTO,
  GenerateEmailRequest,
  ColdEmailResponseDTO,
  OptimizeResumeRequest,
  ResumeOptimizerResponseDTO,
  BuildCvRequest,
  BuildCvResponseDTO,
  ProductRecommenderRequest,
  ProductRecommenderResponseDTO,
  CareerChatRequest,
  CareerChatResponseDTO,
} from "@/types/api";

const isMockEnabled = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const aiService = {
  /**
   * Generates tailored cover letter via backend AI API
   */
  async generateCoverLetter(payload: GenerateCoverLetterRequest): Promise<string> {
    if (isMockEnabled) {
      return mockDb.generateCoverLetter({
        role: payload.role,
        company: payload.company,
        experienceContext: payload.jobDescription || payload.experienceContext || "",
      });
    }
    try {
      const res = await apiClient.post<CoverLetterResponseDTO>("/ai/cover-letter", {
        role: payload.role,
        company: payload.company,
        recipient: payload.recipient || "Hiring Manager",
        jobDescription: payload.jobDescription || payload.experienceContext || "",
        tone: payload.tone || "professional",
        candidateProfile: payload.candidateProfile,
      });
      return res.letter;
    } catch (error) {
      if (process.env.NODE_ENV === "development" && isMockEnabled) {
        return mockDb.generateCoverLetter({
          role: payload.role,
          company: payload.company,
          experienceContext: payload.jobDescription || payload.experienceContext || "",
        });
      }
      throw error;
    }
  },

  /**
   * Generates high-converting cold email via backend AI API
   */
  async generateEmail(payload: GenerateEmailRequest): Promise<string> {
    if (isMockEnabled) {
      return mockDb.generateOutreachEmail(payload);
    }
    try {
      const res = await apiClient.post<ColdEmailResponseDTO>("/ai/email", {
        recipient: payload.recipient || payload.recipientName || "Hiring Manager",
        role: payload.role,
        company: payload.company,
        context: payload.context,
        tone: payload.tone,
      });
      return res.email;
    } catch (error) {
      if (process.env.NODE_ENV === "development" && isMockEnabled) {
        return mockDb.generateOutreachEmail(payload);
      }
      throw error;
    }
  },

  /**
   * Optimizes resume PDF via backend AI API
   */
  async optimizeResume(payload: OptimizeResumeRequest): Promise<ResumeOptimizerResponseDTO> {
    if (isMockEnabled) {
      return {
        model: "mock-model",
        tokensUsed: 120,
        summary: `Optimized resume for ${payload.targetRole} in ${payload.targetIndustry}`,
        fileName: "optimized_resume.pdf",
        contentType: "application/pdf",
        pdfBase64: "",
      };
    }

    const formData = new FormData();
    if (payload.file) {
      formData.append("resume", payload.file);
    }
    formData.append("targetRole", payload.targetRole);
    formData.append("targetIndustry", payload.targetIndustry);
    formData.append("jobDescription", payload.jobDescription);

    const res = await apiClient.post<ResumeOptimizerResponseDTO>("/ai/resume/optimize", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res;
  },

  /**
   * Builds ATS-friendly CV & PDF from raw notes
   */
  async buildCv(payload: BuildCvRequest): Promise<BuildCvResponseDTO> {
    const res = await apiClient.post<BuildCvResponseDTO>("/ai/cv/build", payload);
    return res;
  },

  /**
   * Recommends iFormat products/packages based on user profile
   */
  async recommendProducts(payload: ProductRecommenderRequest): Promise<ProductRecommenderResponseDTO> {
    const res = await apiClient.post<ProductRecommenderResponseDTO>("/ai/recommend", payload);
    return res;
  },

  /**
   * Queries Career Advisor Chatbot
   */
  async queryCareerAdvisor(payload: CareerChatRequest): Promise<CareerChatResponseDTO> {
    const res = await apiClient.post<CareerChatResponseDTO>("/ai/chat", payload);
    return res;
  },
};
