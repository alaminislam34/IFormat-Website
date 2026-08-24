import OpenAI from "openai";
import { env } from "../../config/env.js";
import { logger } from "../../utils/logger.js";
import {
  GenerateCoverLetterInput,
  GenerateEmailInput,
  OptimizeResumeInput,
} from "./ai.validation.js";

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
  timeout: 30 * 1000,
});

export class AIService {
  /**
   * Generates a tailored, professional Cover Letter
   */
  static async generateCoverLetter(input: GenerateCoverLetterInput): Promise<string> {
    logger.info(`🤖 Generating AI Cover Letter for ${input.role} at ${input.company}`);

    const prompt = `
You are an expert career consultant and senior executive copywriter.
Write an outstanding, modern, and highly compelling Cover Letter tailored specifically for the candidate applying to:

ROLE: ${input.role}
COMPANY: ${input.company}
TONE: ${input.tone || "professional"}
ADDITIONAL CONTEXT / EXPERIENCE:
${input.experienceContext || "Experienced professional with relevant domain expertise, strong communication, and problem-solving skills."}

GUIDELINES:
1. Do not use generic cliches (e.g. "I am writing to apply for..."). Start with a strong, hook-driven opening paragraph expressing value proposition.
2. Highlight relevant technical and soft skills, quantifiable impact, and alignment with the company's mission.
3. Keep the letter formatted cleanly with standard professional sections (Salutation, Introduction, Body Paragraphs, Call to Action, Professional Sign-off).
4. Do not include placeholder text like [Your Name] unless strictly necessary for signoff; make the letter polished and immediately usable.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an elite career coach and resume strategist.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1200,
      });

      const generated = response.choices[0]?.message?.content?.trim();
      if (!generated) {
        throw new Error("No content generated from AI model.");
      }

      return generated;
    } catch (error) {
      logger.error("Failed to generate cover letter via OpenAI:", error);
      throw error;
    }
  }

  /**
   * Generates a high-converting Cold Outreach / Job Application Email
   */
  static async generateEmail(input: GenerateEmailInput): Promise<string> {
    logger.info(`🤖 Generating AI Outreach Email for ${input.role} at ${input.company}`);

    const prompt = `
You are an expert in job search strategy and professional networking communication.
Write a crisp, high-converting outreach email to:

RECIPIENT: ${input.recipientName || "Hiring Manager"}
COMPANY: ${input.company}
ROLE OF INTEREST: ${input.role}
TONE: ${input.tone || "formal"}
CONTEXT / BACKGROUND:
${input.context || "Reaching out regarding open opportunities with relevant background in the field."}

GUIDELINES:
1. Include a catchy, professional Subject Line at the very top (e.g., Subject: Inquiring about [Role] - [Candidate Value]).
2. Keep the email body concise (under 200 words), direct, and respectful of the recipient's time.
3. Clearly state the reason for reaching out, key value proposition, and a clear, low-friction call to action (e.g., a brief 10-minute introductory call).
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert executive communicator and career consultant.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 600,
      });

      const generated = response.choices[0]?.message?.content?.trim();
      if (!generated) {
        throw new Error("No content generated from AI model.");
      }

      return generated;
    } catch (error) {
      logger.error("Failed to generate email via OpenAI:", error);
      throw error;
    }
  }

  /**
   * Optimizes and enhances resume bullet points with quantifiable impact and ATS keywords
   */
  static async optimizeResume(input: OptimizeResumeInput): Promise<string> {
    logger.info(`🤖 Optimizing resume text for role: ${input.targetRole || "general"}`);

    const prompt = `
You are an expert ATS (Applicant Tracking System) optimizer and executive resume writer.
Enhance and rewrite the following resume content to maximize impact, readability, and ATS match score.

TARGET ROLE: ${input.targetRole || "Senior Industry Specialist"}
INDUSTRY: ${input.industry || "Technology & Software"}

ORIGINAL RESUME TEXT:
${input.rawText}

GUIDELINES:
1. Use strong action verbs (Spearheaded, Architected, Accelerated, Reduced, Engineered).
2. Incorporate metric frameworks (Google X-Y-Z formula: Accomplished [X] as measured by [Y], by doing [Z]).
3. Fix grammar, tone, and sentence structure for high executive appeal.
4. Output the polished, optimized resume content cleanly with bullet points or formatted sections.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a top-tier resume specialist and ATS algorithm expert.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.4,
        max_tokens: 1500,
      });

      const generated = response.choices[0]?.message?.content?.trim();
      if (!generated) {
        throw new Error("No content generated from AI model.");
      }

      return generated;
    } catch (error) {
      logger.error("Failed to optimize resume via OpenAI:", error);
      throw error;
    }
  }
}
