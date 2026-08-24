import { apiClient } from "@/lib/api/api-client";
import { mockDb } from "@/lib/api/mock-adapter";
import {
  GenerateCoverLetterRequest,
  GenerateEmailRequest,
  OptimizeResumeRequest,
} from "@/types/api";

const isMockEnabled = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export const aiService = {
  /**
   * Generates tailored cover letter via backend OpenAI API
   */
  async generateCoverLetter(payload: GenerateCoverLetterRequest): Promise<string> {
    if (isMockEnabled) {
      return mockDb.generateCoverLetter(payload);
    }
    try {
      const res = await apiClient.post<{ letter: string }>("/ai/cover-letter", payload);
      return res.letter;
    } catch (error) {
      // Fallback only if offline / dev mock enabled
      if (process.env.NODE_ENV === "development" && isMockEnabled) {
        return mockDb.generateCoverLetter(payload);
      }
      throw error;
    }
  },

  /**
   * Generates high-converting cold email via backend OpenAI API
   */
  async generateEmail(payload: GenerateEmailRequest): Promise<string> {
    if (isMockEnabled) {
      return mockDb.generateOutreachEmail(payload);
    }
    try {
      const res = await apiClient.post<{ email: string }>("/ai/email", payload);
      return res.email;
    } catch (error) {
      if (process.env.NODE_ENV === "development" && isMockEnabled) {
        return mockDb.generateOutreachEmail(payload);
      }
      throw error;
    }
  },

  /**
   * Optimizes resume content via backend OpenAI API
   */
  async optimizeResume(payload: OptimizeResumeRequest): Promise<string> {
    if (isMockEnabled) {
      return `Enhanced with keywords for ${payload.targetRole || "target position"}: ${payload.rawText}`;
    }
    try {
      const res = await apiClient.post<{ summary: string }>("/ai/resume/optimize", payload);
      return res.summary;
    } catch (error) {
      if (process.env.NODE_ENV === "development" && isMockEnabled) {
        return `Enhanced with keywords for ${payload.targetRole || "target position"}: ${payload.rawText}`;
      }
      throw error;
    }
  },
};
